// Hand-authored fictional examples, never fetched from enterprise systems.
export const signals = [
  {
    "id": "servicenow",
    "source": "ServiceNow / CMDB",
    "short": "SN",
    "record": "INC-DEMO-1042",
    "title": "Claims processing interrupted",
    "observation": "ClaimsFlow experienced a 42-minute service interruption on 28 October. The synthetic incident cites database connection failures.",
    "owner": "Service Operations",
    "confidence": "High",
    "entities": [
      "app-claims",
      "tech-db"
    ],
    "implication": "Review claims resilience priorities; this incident alone does not establish root cause.",
    "initiative": "init-claims",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  },
  {
    "id": "leanix",
    "source": "LeanIX / Alfabet",
    "short": "EA",
    "record": "EA-DEMO-021",
    "title": "PolicyCore dependency recorded",
    "observation": "The architecture inventory maps PolicyCore to the legacy database platform, with illustrative support ending 30 June 2027.",
    "owner": "Enterprise Architecture",
    "confidence": "High",
    "entities": [
      "app-policy",
      "tech-db"
    ],
    "implication": "Assess sequencing for policy modernization and dependent applications.",
    "initiative": "init-policy",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  },
  {
    "id": "jira",
    "source": "Jira / Azure DevOps",
    "short": "DV",
    "record": "WORK-DEMO-318",
    "title": "Claims remediation backlog",
    "observation": "A proposed resilience work item targets ClaimsFlow; delivery is awaiting dependency review.",
    "owner": "Claims Engineering",
    "confidence": "Medium",
    "entities": [
      "app-claims",
      "init-claims"
    ],
    "implication": "Compare remediation timing with policy modernization dependencies.",
    "initiative": "init-claims",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  },
  {
    "id": "github",
    "source": "GitHub / GitLab",
    "short": "GH",
    "record": "CI-DEMO-084",
    "title": "Policy pipeline regression",
    "observation": "A sample PolicyCore pipeline run failed 8 of 120 integration checks. The failure requires engineering triage.",
    "owner": "Policy Engineering",
    "confidence": "Medium",
    "entities": [
      "app-policy",
      "team-policy"
    ],
    "implication": "Investigate release readiness before committing the modernization milestone.",
    "initiative": "init-policy",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  },
  {
    "id": "cloud",
    "source": "Cloud / FinOps",
    "short": "CF",
    "record": "COST-DEMO-029",
    "title": "Low cloud utilisation",
    "observation": "A sample DigitalFront workload reports 18% average CPU and GBP 4,800 compute spend for September 2026. This is a separate monthly observation, not an update to annual run cost.",
    "owner": "Cloud Platform Team",
    "confidence": "Medium",
    "entities": [
      "app-portal",
      "tech-cloud"
    ],
    "implication": "Investigate rightsizing after checking peak load and service objectives; savings are not calculated.",
    "initiative": "",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  },
  {
    "id": "security",
    "source": "Security / Risk",
    "short": "SR",
    "record": "RISK-DEMO-067",
    "title": "Platform support exposure",
    "observation": "A synthetic risk observation flags the legacy database support horizon. Remediation evidence has not yet been attested.",
    "owner": "Technology Risk",
    "confidence": "Medium",
    "entities": [
      "tech-db",
      "risk-db"
    ],
    "implication": "Trace affected services and review remediation before support expiry.",
    "initiative": "init-policy",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  },
  {
    "id": "finance",
    "source": "Finance / Procurement",
    "short": "FP",
    "record": "CON-DEMO-014",
    "title": "Tool renewal approaching",
    "observation": "LegacyTest has an illustrative renewal date of 31 March 2027. Notice terms and exit costs remain unverified.",
    "owner": "Procurement",
    "confidence": "Low",
    "entities": [
      "tool-test",
      "contract-test"
    ],
    "implication": "Review tool consolidation before the renewal window; validate exit terms first.",
    "initiative": "init-test",
    "observedAt": "2026-10-29",
    "origin": "Synthetic demo data",
    "status": "Needs owner review"
  }
];

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function demoMatches(graph,s){return graph.meta.synthetic===true&&graph.meta.name==='Northstar Assurance'&&s.entities.every(id=>graph.nodes.some(n=>n.id===id));}
export function signalsFor(graph,id){return signals.filter(s=>demoMatches(graph,s)&&s.entities.includes(id));}
const graphLink=(g,id)=>{const n=g.nodes.find(n=>n.id===id);return n?'<button class="btn" data-graphnode="'+esc(id)+'">'+esc(n.name)+'</button>':'';};
export function signalEvidence(graph,id){const list=signalsFor(graph,id);return '<section class="signal-evidence"><h3>Signals &amp; Evidence</h3><p>Source observations linked to this entity.</p>'+ (list.length?list.map(s=>'<button class="connection" data-signal="'+s.id+'"><small>'+esc(s.source)+' · Synthetic demo data</small>'+esc(s.title)+'</button>').join(''):'<p>No sample signals mapped to this entity. Imported records are not automatically matched.</p>')+'</section>';}
export function signalsView(graph,active='servicenow'){
 const s=signals.find(x=>x.id===active)||signals[0],mapped=demoMatches(graph,s);
 const relationships=mapped?graph.edges.filter(e=>s.entities.includes(e.source)&&s.entities.includes(e.target)):[];
 return '<div class="heading"><div><div class="eyebrow">Bottom-up transformation intelligence</div><h1>Enterprise Signals</h1><p class="subtitle">Start with an observation. Trace its enterprise context. Explore a decision.</p></div></div><div class="data-health">Synthetic demo data · 7 sample sources · No live connections · Fixed snapshot: 29 October 2026</div><div class="signal-sources">'+signals.map(x=>'<button class="signal-source '+(s.id===x.id?'selected':'')+'" data-signal="'+x.id+'" aria-pressed="'+(s.id===x.id)+'"><span class="avatar">'+x.short+'</span><strong>'+esc(x.source)+'</strong><small>1 sample signal</small></button>').join('')+'</div><div class="signal-layout"><section class="panel signal-card"><div class="eyebrow">1 · Source observation</div><h2>'+esc(s.title)+'</h2><span class="tag orange">Synthetic demo data</span><p>'+esc(s.observation)+'</p><dl><dt>Source system</dt><dd>'+esc(s.source)+'</dd><dt>Sample source record</dt><dd>'+esc(s.record)+' (fictional; no external record)</dd><dt>Observed</dt><dd>'+s.observedAt+'</dd><dt>Accountable owner</dt><dd>'+esc(s.owner)+'</dd><dt>Mapping confidence</dt><dd>'+s.confidence+' · manually authored example</dd><dt>Validation</dt><dd>'+s.status+'</dd></dl><p class="muted">These observations demonstrate provenance. They do not change portfolio scores, costs or recommendations automatically.</p></section><section class="panel signal-card"><div class="eyebrow">2 · Enterprise graph context</div><h2>Where this signal belongs</h2>'+(mapped?'<p>Open a linked entity to explore its graph and supporting signals.</p><div class="buttons">'+s.entities.map(id=>graphLink(graph,id)).join('')+'</div><h3>Mapped relationships</h3>'+ (relationships.length?relationships.map(e=>'<p class="signal-relation">'+esc(graph.nodes.find(n=>n.id===e.source).name)+' → <b>'+esc(e.type.replaceAll('_',' '))+'</b> → '+esc(graph.nodes.find(n=>n.id===e.target).name)+'<br><small>State: '+esc(e.state||'unspecified')+' · '+esc(e.sourceRef||'Reference not supplied')+'</small></p>').join(''):'<p>Both entities are referenced by this signal; no direct relationship is asserted.</p>'):'<p>This sample belongs to Northstar Assurance. Its entities are missing or a different enterprise context is loaded. No sample evidence is attached to your records.</p>')+'<div class="signal-decision"><div class="eyebrow">3 · Potential decision impact</div><h3>Question for owner review</h3><p>'+esc(s.implication)+'</p><span class="tag orange">Interpretation · not an approved decision</span><div class="buttons">'+(mapped?'<button class="btn primary" data-impact="'+s.entities[0]+'">Trace business impact</button>':'')+(mapped&&s.initiative&&graph.nodes.some(n=>n.id===s.initiative)?graphLink(graph,s.initiative):'')+'</div></div></section></div>';
}
