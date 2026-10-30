
// Fixed, deterministic fictional records. No live system access.
export const sources=[['servicenow','ServiceNow / CMDB'],['leanix','LeanIX / Alfabet'],['github','GitHub / GitLab'],['security','Security / Risk'],['finance','Finance / Procurement'],['jira','Jira / Azure DevOps'],['cloud','Cloud / FinOps']];
export const snapshot='2026-10-29';
export const appNames={'app-policy':'PolicyCore','app-claims':'ClaimsFlow','app-crm':'CustomerHub','app-portal':'DigitalFront','app-report':'ReportWorks','app-ledger':'FinanceOne'};
export const records=[];
const add=(app,source,id,date,title,extra={})=>records.push({id,app,source,date,title,owner:source==='finance'?'Procurement':source==='security'?'Technology Risk':appNames[app]+' team',synthetic:true,validated:false,...extra});
Object.keys(appNames).forEach((app,a)=>{
 const elevated=a<2||a===4;
 for(let month=5;month<=10;month++){
  const mm=String(month).padStart(2,'0'),count=(elevated?21:8)+(month-5)*(a===0?3:a===1?2:1)+a;
  for(let i=0;i<count;i++){
   const day=String(1+(i*7+a)%28).padStart(2,'0');
   const severity=i%(elevated?15:45)===0?'P1':i%6===0?'P2':i%3===0?'P3':'P4';
   add(app,'servicenow', 'INC-'+a+mm+String(i+1).padStart(3,'0'),'2026-'+mm+'-'+day,['Database connection timeout','Slow response','Access request failure','Integration error'][i%4],{kind:'Incident',severity,status:month===10&&i%3===0?'Open':'Resolved',resolutionHours:2+(i*3)%72,category:['Database','Performance','Access','Integration'][i%4],relatedEntity:elevated?'tech-db':'tech-cloud',note:'Priority P1–P4 is the synthetic incident priority/severity classification; not a universal source-system severity mapping.'});
  }
  for(let i=0;i<8;i++)add(app,'github','RUN-'+a+mm+i,'2026-'+mm+'-'+String(2+i*3).padStart(2,'0'),'Release pipeline '+(i+1),{kind:'Pipeline run',repository:appNames[app].toLowerCase()+'-api',status:i%(elevated?3:7)===0?'Failed':'Passed',leadTimeHours:12+a*7+i*2,coveragePct:elevated?58+a:86+a,changeId:'PR-'+a+mm+i});
  add(app,'cloud','BILL-'+a+mm,'2026-'+mm+'-28','Monthly cloud allocation',{kind:'Cost record',status:'Allocated',period:'2026-'+mm,amountGBP:Math.round((a+2)*1250*(1+(month-5)*.035)),cpuPct:app==='app-portal'?18:35+a*5,note:'Monthly cloud allocation may overlap inventory annual run cost. Do not add the two measures.'});
 }
 for(let i=0;i<10;i++)add(app,'security','SEC-'+a+'-'+i,'2026-'+String(7+i%4).padStart(2,'0')+'-'+String(1+i*2).padStart(2,'0'),['Dependency vulnerability','Control evidence gap','Privileged access finding'][i%3],{kind:'Security finding',severity:i===0&&elevated?'Critical':i%3===0?'High':i%2===0?'Medium':'Low',status:i<(elevated?6:2)?'Open':'Remediated',dueDate:'2026-10-'+String(10+i).padStart(2,'0'),relatedEntity:elevated?'tech-db':'tech-cloud'});
 for(let i=0;i<2;i++)add(app,'github','REPO-'+a+'-'+i,'2026-10-28',appNames[app]+' '+(i?'web':'api')+' repository',{kind:'Repository',repository:appNames[app].toLowerCase()+(i?'-web':'-api'),status:'Active',openPullRequests:3+a*2+i,stalePullRequests:a<2?4:1,coveragePct:elevated?58+a:86+a,defaultBranch:'main'});
 for(let i=0;i<4;i++)add(app,'jira','PROJ-'+a+'-'+i,'2026-'+String(7+i).padStart(2,'0')+'-12',['Modernization','Resilience remediation','API upgrade','Regression automation'][i]+' project',{kind:'Project',status:i===0?'In progress':i===1&&elevated?'Blocked':i===3?'Planned':'Done',targetDate:i===0?'2026-12-15':'2027-02-15',completedItems:12+a+i,totalItems:40+a*3,blockedItems:elevated&&i<2?3:0,initiative:app==='app-claims'?'init-claims':app==='app-report'?'init-report':'init-policy',note:'Project status is an observation, not a causal explanation for incidents.'});
 add(app,'finance','CON-'+a,'2026-10-01',appNames[app]+' support agreement',{kind:'Contract',status:a<2?'Pending renewal':'Active',renewalDate:['2026-11-30','2026-12-15','2027-06-30','2027-04-30','2027-01-15','2027-08-31'][a],noticeDate:['2026-10-15','2026-11-01','2027-03-31','2027-01-31','2026-11-15','2027-05-31'][a],annualAmountGBP:80000+a*15000,vendor:'Fictional supplier '+(a+1),note:'Contract value is not automatically additive to application run cost. Notice deadlines require procurement review.'});
 add(app,'leanix','EA-'+a,'2026-10-20','Application lifecycle assessment',{kind:'Architecture record',status:'Recorded',lifecycle:elevated?'Modernize':'Invest',relatedEntity:elevated?'tech-db':'tech-cloud',supportEnd:elevated?'2027-06-30':'2029-12-31',note:'Hand-authored synthetic mapping. Validate before any real decision.'});
});
export function available(graph){return graph.meta.synthetic===true&&graph.meta.name==='Northstar Assurance';}
export function appRecords(graph,app){if(!available(graph)||!graph.nodes.some(n=>n.id===app&&n.name===appNames[app]&&n.type==='Application'))return [];return records.filter(r=>r.app===app);}
export function within(r,months=6){const start='2026-'+String(11-months).padStart(2,'0')+'-01';return r.date>=start&&r.date<=snapshot;}
export const daysUntil=date=>Math.ceil((Date.parse(date)-Date.parse(snapshot))/86400000);
export function summarize(graph,app,months=6){
 const all=appRecords(graph,app).filter(r=>within(r,months)),tickets=all.filter(r=>r.source==='servicenow'),runs=all.filter(r=>r.kind==='Pipeline run'),findings=all.filter(r=>r.source==='security'),contracts=all.filter(r=>r.kind==='Contract'),projects=all.filter(r=>r.kind==='Project'),costs=all.filter(r=>r.kind==='Cost record');
 const counts=Object.fromEntries(['P1','P2','P3','P4'].map(p=>[p,tickets.filter(r=>r.severity===p).length]));
 return {all,tickets,runs,findings,contracts,projects,costs,counts,openTickets:tickets.filter(r=>r.status==='Open').length,failed:runs.filter(r=>r.status==='Failed').length,critical:findings.filter(r=>r.status==='Open'&&['Critical','High'].includes(r.severity)),renewals:contracts.filter(r=>daysUntil(r.renewalDate)>=0&&daysUntil(r.renewalDate)<=90),blocked:projects.filter(r=>r.status==='Blocked'||(r.status!=='Done'&&r.blockedItems>0)),spend:costs.reduce((n,r)=>n+r.amountGBP,0)};
}
export const moduleSources={twin:['servicenow','leanix'],applications:['servicenow','security','finance','jira'],tools:['finance'],risk:['security','servicenow','leanix'],finops:['cloud'],architecture:['leanix','security'],sdlc:['github','jira','servicenow'],agentic:['servicenow'],operating:['jira','github'],value:['finance','cloud'],simulation:['jira','finance','security'],cio:['servicenow','security','finance','jira','github','cloud']};
export function priority(graph,app,module='applications',include=true){
 const n=graph.nodes.find(n=>n.id===app),s=summarize(graph,app),allowed=moduleSources[module]||[];
 const base=n&&['risk','health','businessValue'].every(k=>Number.isFinite(n[k]))?Math.round(.45*n.risk+.35*(100-n.health)+.2*n.businessValue):null;
 const candidates=[
 ['servicenow',Math.min(12,s.counts.P1*2+s.counts.P2*.5),s.counts.P1+' P1 / '+s.counts.P2+' P2 tickets',s.tickets.filter(r=>['P1','P2'].includes(r.severity))],
 ['security',Math.min(10,s.critical.length*3),s.critical.length+' open high/critical findings',s.critical],
 ['finance',Math.min(8,s.renewals.length*5+s.contracts.filter(r=>r.status==='Pending renewal'&&daysUntil(r.noticeDate)<0).length*3),s.renewals.length+' renewals within 90 days',s.renewals],
 ['jira',Math.min(6,s.blocked.length*3),s.blocked.length+' projects with blockers',s.blocked],
 ['github',s.runs.length&&s.failed/s.runs.length>.2?6:0,s.failed+'/'+s.runs.length+' failed pipeline runs',s.runs.filter(r=>r.status==='Failed')],
 ['cloud',s.costs.some(r=>r.cpuPct<25)?5:0,'Cloud CPU below 25% in observed months',s.costs.filter(r=>r.cpuPct<25)],
 ['leanix',s.all.some(r=>r.source==='leanix'&&r.lifecycle==='Modernize')?4:0,'Lifecycle assessment proposes modernization',s.all.filter(r=>r.source==='leanix'&&r.lifecycle==='Modernize')]
 ];
 const drivers=candidates.filter(([source,points])=>allowed.includes(source)&&points>0).map(([source,points,label,evidence])=>({source,points,label,ids:evidence.map(r=>r.id)}));
 const uplift=include?Math.min(25,drivers.reduce((v,d)=>v+d.points,0)):0;
 return {app,base,score:base===null?null:Math.min(100,base+uplift),uplift,drivers,recordIds:[...new Set(drivers.flatMap(d=>d.ids))],needsReview:!n?.validated};
}
