export const domains=[
 {id:'estate',name:'Applications & technology',example:'Connect a claims application to its business process and database.',types:['Application','Technology','Capability','Process','Interface','Data','Risk'],modules:['twin','applications','risk','architecture']},
 {id:'tools',name:'Tools & suppliers',example:'Record testing tools, their capabilities, vendors and contracts.',types:['Tool','Vendor','Contract','Capability'],modules:['tools','operating']},
 {id:'cloud',name:'Cloud & costs',example:'Connect a cloud resource to a workload and its cost records.',types:['CloudResource','Workload','CostRecord','Application'],modules:['finops','value']},
 {id:'delivery',name:'Engineering & AI',example:'Connect repositories and pipelines, or tasks and automation opportunities.',types:['Repository','Pipeline','Deployment','Incident','Task','Opportunity','Process','Control','Data'],modules:['sdlc','agentic','architecture']},
 {id:'change',name:'People, investment & outcomes',example:'Connect teams, skills and transformation initiatives to business outcomes.',types:['Team','Role','Skill','Initiative','Benefit','KPI','Objective'],modules:['operating','value','simulation','cio']}
];
export const moduleGuidance={
 twin:{input:'Business processes, applications and their dependencies',output:'Explore a connected estate map and inspect recorded evidence.',example:'Which business processes depend on the legacy database?',action:'Explore enterprise graph'},
 applications:{input:'Application value, technical health, risk and owner validation',output:'See a transparent proposed disposition for each application.',example:'Should we modernize PolicyCore or retain it?',action:'Assess application portfolio'},
 tools:{input:'Tools, functionality, usage and supplier commitments',output:'Review tool records and basic portfolio scores. Automatic overlap detection is planned.',example:'Do two testing tools serve the same users and capabilities?',action:'Review tools in portfolio'},
 risk:{input:'Technology risks and observed business dependencies',output:'Trace potential business exposure from a selected technology or application.',example:'What is affected if the legacy database fails?',action:'Trace business impact'},
 finops:{input:'Cloud resources, utilization and billing evidence',output:'Inspect relevant records and missing context. Cloud optimization is not implemented.',example:'Which idle resources could we remove without affecting service?'},
 architecture:{input:'Standards, design patterns and architecture decisions',output:'Inspect relevant records and missing context. Automated design assessment is not implemented.',example:'Does the proposed design meet our architecture standards?'},
 sdlc:{input:'Repositories, pipelines, deployments and incidents',output:'Inspect relevant records and missing context. AI delivery automation is not implemented.',example:'Where could AI reduce testing effort or improve release quality?'},
 agentic:{input:'Process tasks, effort, data and control requirements',output:'Inspect relevant records and missing context. Automation opportunity scoring is not implemented.',example:'Which claims tasks are suitable for an agent with human review?'},
 operating:{input:'Teams, roles, skills, capabilities and sourcing',output:'Inspect relevant records and missing context. Operating-model simulation is not implemented.',example:'Do we have the skills and ownership to deliver modernization?'},
 value:{input:'Initiative investment, duration and savings assumptions',output:'Calculate illustrative planned benefits. Actual realized-value tracking is not implemented.',example:'When could planned savings exceed the initial investment?',action:'Model planned benefits'},
 simulation:{input:'Initiative costs, durations, dependencies and budget',output:'Compare the timing, cost and benefit assumptions of selected initiatives.',example:'What changes if we prioritize cost reduction over risk?',action:'Compare scenarios'},
 cio:{input:'The shared enterprise graph and supported questions',output:'Get evidence-linked answers from bounded rules. No LLM is connected.',example:'Which assets have elevated risk, and what depends on them?',action:'Ask the demo advisor'}
};
export function domainRecords(graph,domain){return graph.nodes.filter(n=>domain.types.includes(n.type));}
export function reviewGaps(graph,domain){
 const nodes=domainRecords(graph,domain),ids=new Set(nodes.map(n=>n.id));
 const edges=graph.edges.filter(e=>ids.has(e.source)||ids.has(e.target));
 return [...nodes.map(record=>({kind:'node',record})),...edges.map(record=>({kind:'edge',record}))].map(item=>{
  const r=item.record,gaps=[];
  if(!r.owner)gaps.push('Assign an owner');
  if(!(item.kind==='edge'?r.sourceRef:r.source))gaps.push('Add an evidence source');
  if(!r.observedAt||!Number.isFinite(Date.parse(r.observedAt)))gaps.push('Add a valid evidence date');
  if(!r.classification)gaps.push('Set classification');
  if(!r.confidence)gaps.push('Record confidence');
  if(!r.state)gaps.push('Distinguish fact from plan');
  if(r.validated!==true)gaps.push('Obtain owner validation');
  if(item.kind==='node'&&!graph.edges.some(e=>e.source===r.id||e.target===r.id))gaps.push('Connect this record');
  return {...item,gaps};
 }).filter(item=>item.gaps.length);
}
