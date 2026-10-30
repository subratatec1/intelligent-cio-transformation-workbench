import {summarize as operationalSummary,appRecords as operationalRecords,priority as signalPriority} from './operational.js';
export const money = (v, compact = true) => new Intl.NumberFormat('en-GB', { style:'currency', currency:'GBP', notation:compact?'compact':'standard', maximumFractionDigits:compact?1:0 }).format(v);
export const findNode = (graph,id) => graph.nodes.find(n=>n.id===id);
export function neighborhood(graph,id,depth=2) {
  const ids=new Set([id]); let frontier=new Set([id]);
  for(let d=0;d<depth;d++) { const next=new Set(); for(const edge of graph.edges) { if(frontier.has(edge.source)&&!ids.has(edge.target)) next.add(edge.target); if(frontier.has(edge.target)&&!ids.has(edge.source)) next.add(edge.source); } next.forEach(x=>ids.add(x)); frontier=next; }
  return { ...graph, nodes:graph.nodes.filter(n=>ids.has(n.id)), edges:graph.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)) };
}
// Operational impact follows the inverse of explicit business/technical dependency relationships.
// Initiatives, KPI links and hypotheses are deliberately excluded from impact propagation.
export function businessImpact(graph,id) {
  const permitted=new Set(['DEPENDS_ON','SUPPORTED_BY','PERFORMED_THROUGH','REQUIRES','EXCHANGES_THROUGH','USES']);
  const paths=new Map([[id,[id]]]);const queue=[id];
  while(queue.length) { const current=queue.shift();for(const e of graph.edges.filter(e=>e.target===current&&e.state==='observed'&&permitted.has(e.type))) { if(!paths.has(e.source)) { paths.set(e.source,[...paths.get(current),e.source]);queue.push(e.source); } } }
  return [...paths].filter(([key])=>key!==id).map(([key,path])=>({node:findNode(graph,key),path}));
}
export function portfolio(graph) { return graph.nodes.filter(n=>['Application','Tool'].includes(n.type)); }
export function summary(graph) {
  const assets=portfolio(graph);return { assets:assets.length, cost:assets.reduce((s,n)=>s+(n.annualCost||0),0), highRisk:assets.filter(n=>(n.risk||0)>=60).length, confidence:Math.round(100*graph.nodes.filter(n=>n.validated).length/Math.max(graph.nodes.length,1)), entities:graph.nodes.length, relationships:graph.edges.length };
}
export function assessment(node) {
  if(node.validated!==true||!['health','businessValue','risk'].every(k=>Number.isFinite(node[k]))) return {action:'Validate evidence',priority:null,confidence:'Incomplete',rule:'Mandatory assessment evidence must be complete and validated.'};
  const priority=Math.round(.45*node.risk+.35*(100-node.health)+.20*node.businessValue);
  const action=node.businessValue>=70&&node.health<60?'Assess modernization':node.businessValue<50?'Assess consolidation / retirement':node.health>=70?'Retain / invest':'Review technical health';
  return {action,priority,confidence:node.confidence,rule:'Priority v1: 45% risk + 35% technical weakness + 20% business value. Assessment proposals require owner approval.'};
}
export const scenarioPresets = { balanced:['init-policy','init-test'], risk:['init-policy','init-claims'], cost:['init-policy','init-report','init-test'] };
export function scenario(graph,ids,horizonMonths=36,budget=1000000) {
  if(!Number.isFinite(horizonMonths)||horizonMonths<1) throw new Error('Invalid horizon');
  const unique=[...new Set(ids)]; const selected=unique.map(id=>findNode(graph,id));
  if(selected.some(n=>!n||n.type!=='Initiative')) throw new Error('Unknown initiative');
  let investment=0,annualSaving=0,grossBenefit=0;const warnings=[]; const finish=new Map();
  function end(id,stack=new Set()) { if(finish.has(id))return finish.get(id);if(stack.has(id))throw new Error('Cyclic initiative dependency');stack.add(id);const n=findNode(graph,id);const deps=graph.edges.filter(e=>e.source===id&&e.type==='DEPENDS_ON'&&findNode(graph,e.target)?.type==='Initiative');let start=0;for(const dep of deps) { if(!unique.includes(dep.target)) warnings.push(`${n.name} requires ${findNode(graph,dep.target).name}; add it or validate external readiness.`);else start=Math.max(start,end(dep.target,new Set(stack))); }const value=start+n.durationMonths;finish.set(id,value);return value; }
  selected.forEach(n=>{investment+=n.investment;annualSaving+=n.annualSaving;grossBenefit+=Math.max(0,horizonMonths-end(n.id))*n.annualSaving/12;if(!n.validated)warnings.push(`${n.name}: evidence requires validation.`);});
  if(investment>budget)warnings.push(`Investment exceeds budget by ${money(investment-budget)}.`);
  return {investment,annualSaving,grossBenefit,netBenefit:grossBenefit-investment,warnings:[...new Set(warnings)],feasible:warnings.length===0,schedule:selected.map(n=>({id:n.id,name:n.name,start:finish.get(n.id)-n.durationMonths,end:finish.get(n.id)}))};
}
export function validateGraph(value) {
  if(!value||!Array.isArray(value.nodes)||!Array.isArray(value.edges)||!value.meta)throw new Error('Expected meta, nodes and edges.');
  if(value.nodes.length>300||value.edges.length>1500)throw new Error('Prototype import limit: 300 nodes and 1,500 relationships.');
  const ids=new Set();const edgeIds=new Set();
  for(const n of value.nodes) {if(!n||typeof n.id!=='string'||!n.id||typeof n.name!=='string'||!n.name||typeof n.type!=='string')throw new Error('Each node needs a non-empty id, name and type.');if(ids.has(n.id))throw new Error(`Duplicate node: ${n.id}`);ids.add(n.id);for(const k of ['annualCost','investment','annualSaving','durationMonths'])if(n[k]!==undefined&&(!Number.isFinite(n[k])||n[k]<0))throw new Error(`Invalid ${k} on ${n.id}`);for(const k of ['health','businessValue','risk'])if(n[k]!==undefined&&(!Number.isFinite(n[k])||n[k]<0||n[k]>100))throw new Error(`Invalid score on ${n.id}`);if(n.type==='Initiative'&&!['investment','annualSaving','durationMonths'].every(k=>Number.isFinite(n[k])))throw new Error(`Initiative ${n.id} requires financial and duration values.`);}
  for(const e of value.edges){if(!e||typeof e.id!=='string'||edgeIds.has(e.id))throw new Error('Each edge needs a unique id.');edgeIds.add(e.id);if(!ids.has(e.source)||!ids.has(e.target))throw new Error(`Dangling edge: ${e.id}`);if(typeof e.type!=='string'||!e.type)throw new Error('Each edge needs a relationship type.');}
  // Validate cycles even when all initiatives are chosen together.
  scenario(value,value.nodes.filter(n=>n.type==='Initiative').map(n=>n.id));
  return value;
}
export function answerQuestion(graph,question) {
  const q=question.toLowerCase().trim();const target=graph.nodes.filter(n=>q.includes(n.name.toLowerCase())).sort((a,b)=>b.name.length-a.name.length)[0];
  if(target&&operationalRecords(graph,target.id).length&&/ticket|incident|pipeline|renewal|contract|project|vulnerabil|security finding|operational|signal/.test(q)){
 const s=operationalSummary(graph,target.id),p=signalPriority(graph,target.id);
 return {title:'Operational evidence: '+target.name,text:'Synthetic snapshot, 1 May–29 October 2026: '+s.tickets.length+' tickets raised (P1 '+s.counts.P1+', P2 '+s.counts.P2+', P3 '+s.counts.P3+', P4 '+s.counts.P4+'); '+s.openTickets+' currently open. '+s.failed+'/'+s.runs.length+' failed pipelines; '+s.critical.length+' open high/critical findings; '+s.renewals.length+' renewals within 90 days; '+s.blocked.length+' projects with blockers. Application review priority '+p.base+' → '+p.score+' using explicit operational rules. Open the application evidence view for individual source IDs. These correlations do not establish causation.',ids:[target.id],tool:'summarize_application_signals',kind:'Calculated synthetic evidence'};
 }
  if(/risk|unsupported|support expiry|exposure/.test(q)&&!target) { const candidates=portfolio(graph).filter(n=>n.risk>=60);return {title:'Start with critical service exposure',text:`${candidates.length} assets have risk scores of 60 or above. ${candidates.map(n=>n.name).join(' and ')} merit owner review. Scores are synthetic assessment evidence, not a quantified probability of failure.`,ids:candidates.map(n=>n.id),tool:'list_risk_candidates',kind:'Observed assessment'}; }
  if(target&&/impact|depend|affect|fail|support|expos/.test(q)) {const impact=businessImpact(graph,target.id);return {title:`Business impact of ${target.name}`,text:`The recorded dependency paths reach ${impact.filter(x=>x.node.type==='Application').length} other applications, ${impact.filter(x=>x.node.type==='Capability').length} capabilities and ${impact.filter(x=>x.node.type==='Objective').length} objectives. These are potential exposure paths, not a prediction of an outage. Unrecorded dependencies remain unknown.`,ids:[target.id,...impact.filter(x=>['Capability','Objective'].includes(x.node.type)).map(x=>x.node.id)],tool:'trace_business_impact',kind:'Graph traversal'};}
  if(/spend|run.cost|cost base|total cost/.test(q))return {title:'Recorded annual run cost',text:`The loaded application and tool inventory totals ${money(summary(graph).cost,false)} per year. This sums the recorded annualCost fields in GBP; it excludes costs not present in the graph and is not reconciled to a finance ledger.`,ids:portfolio(graph).map(n=>n.id),tool:'get_portfolio_summary',kind:'Calculated'};
  if(/scenario|balanced|prioriti|invest first/.test(q)){const ids=scenarioPresets.balanced.filter(id=>findNode(graph,id));if(!ids.length)return {title:'Scenario evidence unavailable',text:'No default scenario initiatives exist in this dataset. Build a scenario in the scenario planner.',ids:[],tool:'compare_scenarios',kind:'Evidence gap'};const s=scenario(graph,ids);return {title:'Balanced transformation option',text:`The illustrative balanced option requires ${money(s.investment)} investment, targets ${money(s.annualSaving)} annual recurring savings at steady state, and gives ${money(s.netBenefit)} undiscounted net benefit over 36 months after implementation delays. Review dependencies and benefit assumptions before approval.`,ids,tool:'compare_scenarios',kind:'Hypothesis'};}
  if(target&&/retire|retirement|moderniz|why|recommend/.test(q)){const a=assessment(target);return {title:`Decision readiness: ${target.name}`,text:`Proposed action: ${a.action}. ${a.rule} ${target.description||''} Retirement additionally requires confirmed replacement coverage, retention obligations, contract terms and dependency validation.`,ids:[target.id,...graph.edges.filter(e=>e.source===target.id&&e.type==='EXPOSED_TO').map(e=>e.target)],tool:'get_assessment_evidence',kind:target.validated?'Assessment proposal':'Evidence gap'};}
  if(/evidence|missing|confidence|quality/.test(q)){const missing=graph.nodes.filter(n=>!n.validated);return {title:'Resolve the evidence gaps first',text:`${missing.length} entities are awaiting validation: ${missing.map(n=>n.name).join(', ')||'none'}. This checks owner validation flags only; it does not establish completeness of the enterprise inventory.`,ids:missing.map(n=>n.id),tool:'get_evidence_gaps',kind:'Evidence gap'};}
  return {title:'This question needs more context',text:'This prototype uses bounded graph tools, not a connected language model. Try a question about business impact, risk, recorded spend, scenarios, an application recommendation, or missing evidence. No answer has been inferred beyond the loaded dataset.',ids:[],tool:'no_supported_tool',kind:'Outside current coverage'};
}
