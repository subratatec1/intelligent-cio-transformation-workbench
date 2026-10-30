// Decision capabilities share one context graph; coverage is not analytical readiness.
export const modules = [
  {id:'twin',name:'IT Transformation Digital Twin',types:['Objective','Capability','Process','Application','Interface','Data','Technology','CloudResource'],question:'What business outcomes depend on this part of our estate?',route:'graph',status:'Working demo',needs:'Inventory, dependencies, architecture maps and accountable owners.'},
  {id:'applications',name:'Application Portfolio Intelligence',types:['Application','Capability','Team','Contract'],question:'Which applications should we retain, modernize or retire?',route:'portfolio',status:'Working demo',needs:'Business value, technical health, risk, lifecycle and annual run costs.'},
  {id:'tools',name:'Tool Rationalization Engine',types:['Tool','Capability','Vendor','Contract'],question:'Where do tools overlap, and what can we consolidate?',route:'portfolio',status:'Partial demo',needs:'Functionality mapping, licence usage, renewal dates and exit costs. Overlap analysis is not implemented.'},
  {id:'risk',name:'Technology Debt & Risk Radar',types:['Technology','Risk','Control','Application'],question:'Which technology risks threaten critical business services?',route:'impact',status:'Partial demo',needs:'Support expiry, vulnerabilities, control effectiveness and observed dependencies. Automated risk ingestion is not connected.'},
  {id:'finops',name:'Cloud & FinOps Optimizer',types:['CloudResource','Workload','CostRecord','Application'],question:'Where can we reduce cloud spend without harming service?',status:'Context workspace',needs:'Billing periods, resource utilization, commitments, allocation and service constraints. Optimization engine is planned.'},
  {id:'architecture',name:'Architecture Intelligence Advisor',types:['Standard','Pattern','ArchitectureDecision','Application'],question:'Does the proposed design meet our architecture standards?',status:'Context workspace',needs:'Standards, approved patterns, target architectures and time-bound exceptions. Automated conformance analysis is planned.'},
  {id:'sdlc',name:'AI-Native SDLC Accelerator',types:['Repository','Pipeline','Deployment','Incident','Application'],question:'Where can AI improve delivery quality and throughput?',status:'Context workspace',needs:'Repository ownership, pipeline metrics, tests, deployment outcomes and incidents. Engineering automation is planned.'},
  {id:'agentic',name:'Agentic Opportunity Miner',types:['Process','Task','Data','Control','Opportunity'],question:'Which tasks are suitable for governed agentic automation?',status:'Context workspace',needs:'Task volume, effort, decision rules, data readiness and human control points. Opportunity scoring is planned.'},
  {id:'operating',name:'IT Operating Model Designer',types:['Team','Role','Skill','Capability','Vendor'],question:'Do we have the ownership, skills and capacity to deliver?',status:'Context workspace',needs:'Team responsibilities, roles, skills, capacity and sourcing arrangements. Operating-model simulation is planned.'},
  {id:'value',name:'Transformation Value Engine',types:['Initiative','KPI','Benefit','CostRecord','Objective'],question:'Are transformation investments delivering the intended outcomes?',route:'scenarios',status:'Partial demo',needs:'Benefit owners, baselines, dated actuals and investment records. Current financial calculations are illustrative hypotheses, not realized value.'},
  {id:'simulation',name:'Scenario Simulator',types:['Initiative','Application','Capability','Team','KPI'],question:'Which transformation sequence best fits our constraints?',route:'scenarios',status:'Working demo',needs:'Investment, duration, benefit assumptions and dependencies. Capacity and benefit-overlap constraints are not modelled.'},
  {id:'cio',name:'CIO AI Advisor',types:['Objective','Capability','Application','Risk','Initiative','KPI'],question:'What should I prioritize, and what evidence supports the decision?',route:'advisor',status:'Bounded rules demo',needs:'Validated graph context and decision evidence. The current advisor uses deterministic tools; no LLM is connected.'}
];
export const entityTypes=[...new Set(modules.flatMap(m=>m.types))].sort();
export function moduleCoverage(graph,module){
  const present=module.types.filter(type=>graph.nodes.some(n=>n.type===type));
  const nodes=graph.nodes.filter(n=>module.types.includes(n.type));
  const ids=new Set(nodes.map(n=>n.id));
  return {present,missing:module.types.filter(t=>!present.includes(t)),nodes,links:graph.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)),percent:Math.round(present.length/module.types.length*100)};
}
export function contextReadiness(graph,asOf=new Date().toISOString().slice(0,10)){
  const records=[...graph.nodes,...graph.edges];
  const complete=r=>['owner',('target' in r?'sourceRef':'source'),'observedAt','classification','confidence','state'].every(k=>typeof r[k]==='string'&&r[k].trim())&&typeof r.validated==='boolean';
  const stale=r=>!r.observedAt||!Number.isFinite(Date.parse(r.observedAt))||Date.parse(asOf)-Date.parse(r.observedAt)>90*86400000;
  return {total:records.length,complete:records.filter(complete).length,unvalidated:records.filter(r=>r.validated!==true).length,stale:records.filter(stale).length,isolated:graph.nodes.filter(n=>!graph.edges.some(e=>e.source===n.id||e.target===n.id)),modules:modules.map(m=>({id:m.id,...moduleCoverage(graph,m)}))};
}
