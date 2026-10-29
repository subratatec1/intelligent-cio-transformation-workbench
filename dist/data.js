// Synthetic enterprise. Values are illustrative and are not client data.
const meta = { name: 'Northstar Assurance', asOf: '2026-10-29', currency: 'GBP', synthetic: true, schemaVersion: 1 };
const n = (id, type, name, props = {}) => ({ id, type, name, owner: 'Enterprise Architecture', source: 'Illustrative enterprise inventory', validated: true, confidence: 'High', observedAt: meta.asOf, ...props });
const nodes = [
  n('obj-growth','Objective','Grow digital revenue',{owner:'Chief Commercial Officer',description:'Increase digital policy sales and renewal conversion.'}),
  n('obj-resilience','Objective','Strengthen operational resilience',{owner:'Chief Risk Officer',description:'Reduce critical-service exposure and unsupported platforms.'}),
  n('obj-efficiency','Objective','Simplify the cost base',{owner:'Chief Financial Officer',description:'Reduce avoidable run costs while protecting business outcomes.'}),
  n('cap-service','Capability','Customer servicing',{owner:'Customer Operations',description:'Support policy changes, renewals and service requests.'}),
  n('cap-claims','Capability','Claims management',{owner:'Claims Operations'}),
  n('cap-sales','Capability','Digital distribution',{owner:'Digital Business'}),
  n('cap-finance','Capability','Finance & reporting',{owner:'Finance'}),
  n('proc-renewal','Process','Policy renewal',{owner:'Customer Operations'}),
  n('proc-claims','Process','Claims settlement',{owner:'Claims Operations'}),
  n('proc-quote','Process','Quote to bind',{owner:'Digital Business'}),
  n('app-policy','Application','PolicyCore',{owner:'Policy Platforms',annualCost:1200000,health:32,businessValue:92,risk:88,lifecycle:'Modernize',criticality:'Critical',description:'Core policy administration supporting servicing and claims. The data platform is approaching support expiry.',source:'CMDB / architecture assessment'}),
  n('app-crm','Application','CustomerHub',{owner:'Customer Platforms',annualCost:640000,health:78,businessValue:88,risk:28,lifecycle:'Invest',criticality:'High',description:'Strategic CRM for customer interactions.'}),
  n('app-claims','Application','ClaimsFlow',{owner:'Claims Platforms',annualCost:850000,health:55,businessValue:90,risk:62,lifecycle:'Modernize',criticality:'Critical'}),
  n('app-portal','Application','DigitalFront',{owner:'Digital Engineering',annualCost:460000,health:84,businessValue:93,risk:22,lifecycle:'Invest',criticality:'High'}),
  n('app-report','Application','ReportWorks',{owner:'Finance Technology',annualCost:310000,health:38,businessValue:42,risk:57,lifecycle:'Assess retirement',criticality:'Medium',validated:false,confidence:'Medium',description:'Legacy reporting. Retention requirements and downstream extracts require validation.'}),
  n('app-ledger','Application','FinanceOne',{owner:'Finance Technology',annualCost:580000,health:75,businessValue:83,risk:25,lifecycle:'Retain',criticality:'High'}),
  n('tool-bi','Tool','Insight BI',{owner:'Data Platforms',annualCost:180000,health:85,businessValue:78,risk:18,lifecycle:'Invest',criticality:'Medium'}),
  n('tool-test','Tool','LegacyTest Suite',{owner:'Quality Engineering',annualCost:140000,health:40,businessValue:44,risk:44,lifecycle:'Consolidate',criticality:'Medium'}),
  n('tool-auto','Tool','Quality Automation',{owner:'Quality Engineering',annualCost:95000,health:88,businessValue:78,risk:16,lifecycle:'Invest',criticality:'Medium'}),
  n('tech-db','Technology','Legacy database platform',{owner:'Infrastructure Platforms',supportEnd:'2027-06-30',description:'Illustrative support-end date; not a statement about a real vendor product.',source:'Synthetic technology lifecycle register'}),
  n('tech-cloud','Technology','Managed cloud platform',{owner:'Cloud Platform Team'}),
  n('api-bill','Interface','Billing integration',{owner:'Integration Team',description:'Policy and finance exchange through a shared integration.'}),
  n('data-policy','Data','Policy records',{owner:'Data Office',description:'Retention classification must be confirmed before retirement.'}),
  n('risk-db','Risk','Unsupported platform exposure',{owner:'Technology Risk',severity:'High',description:'Support expiry creates a time-bound remediation requirement.'}),
  n('risk-retention','Risk','Unvalidated retention obligations',{owner:'Data Protection',validated:false,confidence:'Low',description:'ReportWorks retention and archive access have not been attested.'}),
  n('init-policy','Initiative','Modernize policy services',{owner:'Transformation Office',investment:650000,annualSaving:240000,durationMonths:12,description:'Incremental modernization of PolicyCore. Savings are a hypothesis, not approved benefits.'}),
  n('init-report','Initiative','Consolidate enterprise reporting',{owner:'Data Platforms',investment:150000,annualSaving:220000,durationMonths:6,validated:false,confidence:'Medium'}),
  n('init-test','Initiative','Unify quality toolchain',{owner:'Quality Engineering',investment:70000,annualSaving:100000,durationMonths:3}),
  n('init-claims','Initiative','Strengthen claims resilience',{owner:'Claims Platforms',investment:420000,annualSaving:80000,durationMonths:9}),
  n('kpi-renewal','KPI','Digital renewal rate',{owner:'Customer Operations',baseline:'62%',target:'72%',description:'Business-case target; causal contribution requires measurement.'}),
  n('kpi-resilience','KPI','Critical service availability',{owner:'Service Operations',baseline:'99.80%',target:'99.95%'}),
  n('kpi-cost','KPI','Annual run-cost reduction',{owner:'Finance',baseline:'£0',target:'£640k',description:'Combined illustrative annual opportunity before validation.'}),
  n('team-policy','Team','Policy platform team',{owner:'Head of Engineering'}),
  n('contract-test','Contract','LegacyTest renewal',{owner:'Procurement',renewalDate:'2027-03-31',description:'Illustrative renewal milestone; notice terms need procurement validation.'})
];
const e = (source, target, type, props = {}) => ({ id: `${source}:${type}:${target}`, source, target, type, sourceRef: 'Synthetic enterprise mapping', validated: true, state: 'observed', observedAt: meta.asOf, ...props });
const edges = [
  e('obj-growth','cap-service','REQUIRES'),e('obj-growth','cap-sales','REQUIRES'),e('obj-resilience','cap-claims','REQUIRES'),e('obj-resilience','cap-service','REQUIRES'),e('obj-efficiency','cap-finance','REQUIRES'),
  e('cap-service','proc-renewal','PERFORMED_THROUGH'),e('cap-claims','proc-claims','PERFORMED_THROUGH'),e('cap-sales','proc-quote','PERFORMED_THROUGH'),
  e('proc-renewal','app-policy','SUPPORTED_BY'),e('proc-renewal','app-crm','SUPPORTED_BY'),e('proc-claims','app-claims','SUPPORTED_BY'),e('proc-claims','app-policy','SUPPORTED_BY'),e('proc-quote','app-portal','SUPPORTED_BY'),
  e('cap-finance','app-ledger','SUPPORTED_BY'),e('cap-finance','app-report','SUPPORTED_BY'),e('cap-finance','tool-bi','SUPPORTED_BY'),
  e('app-policy','tech-db','DEPENDS_ON'),e('app-claims','tech-db','DEPENDS_ON'),e('app-report','tech-db','DEPENDS_ON'),e('app-portal','tech-cloud','DEPENDS_ON'),e('app-crm','tech-cloud','DEPENDS_ON'),e('app-ledger','tech-cloud','DEPENDS_ON'),
  e('app-portal','app-policy','DEPENDS_ON'),e('app-claims','app-policy','DEPENDS_ON'),e('app-crm','app-policy','DEPENDS_ON'),
  e('app-policy','api-bill','EXCHANGES_THROUGH'),e('app-ledger','api-bill','EXCHANGES_THROUGH'),e('app-policy','data-policy','USES'),e('app-report','data-policy','USES'),
  e('tech-db','risk-db','EXPOSED_TO'),e('app-report','risk-retention','EXPOSED_TO'),e('app-policy','team-policy','OWNED_BY'),
  e('init-policy','app-policy','CHANGES',{state:'proposed'}),e('init-policy','obj-growth','CONTRIBUTES_TO',{state:'hypothesis'}),e('init-policy','obj-resilience','CONTRIBUTES_TO',{state:'hypothesis'}),
  e('init-report','app-report','CHANGES',{state:'proposed',validated:false}),e('init-report','tool-bi','REPLACES_WITH',{state:'proposed'}),e('init-report','obj-efficiency','CONTRIBUTES_TO',{state:'hypothesis'}),e('init-report','init-policy','DEPENDS_ON',{state:'proposed',description:'Reporting migration assumes policy data access is stabilized.'}),
  e('init-test','tool-test','CHANGES',{state:'proposed'}),e('init-test','tool-auto','REPLACES_WITH',{state:'proposed'}),e('init-test','obj-efficiency','CONTRIBUTES_TO',{state:'hypothesis'}),e('tool-test','contract-test','GOVERNED_BY'),
  e('init-claims','app-claims','CHANGES',{state:'proposed'}),e('init-claims','obj-resilience','CONTRIBUTES_TO',{state:'hypothesis'}),e('init-claims','init-policy','DEPENDS_ON',{state:'proposed'}),
  e('obj-growth','kpi-renewal','MEASURED_BY'),e('obj-resilience','kpi-resilience','MEASURED_BY'),e('obj-efficiency','kpi-cost','MEASURED_BY'),e('init-policy','kpi-renewal','TRACKS',{state:'proposed'}),e('init-claims','kpi-resilience','TRACKS',{state:'proposed'})
];
export const demoGraph = { meta, nodes, edges };
