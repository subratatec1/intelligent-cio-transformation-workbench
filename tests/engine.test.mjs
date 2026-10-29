import test from 'node:test';
import assert from 'node:assert/strict';
import {demoGraph} from '../dist/data.js';
import {businessImpact,summary,assessment,findNode,scenario,validateGraph,answerQuestion} from '../dist/engine.js';
test('impact reaches business objectives through observed dependencies, excluding proposed initiatives',()=>{
  const impact=businessImpact(demoGraph,'tech-db');const ids=impact.map(x=>x.node.id);
  assert.ok(ids.includes('obj-growth'));assert.ok(ids.includes('cap-claims'));assert.ok(ids.includes('app-portal'));assert.ok(!ids.includes('init-policy'));assert.equal(new Set(ids).size,ids.length);
  const growth=impact.find(x=>x.node.id==='obj-growth');assert.equal(growth.path[0],'tech-db');assert.equal(growth.path.at(-1),'obj-growth');
});
test('missing validation blocks a decision-ready assessment',()=>{const a=assessment(findNode(demoGraph,'app-report'));assert.equal(a.priority,null);assert.equal(a.action,'Validate evidence');assert.equal(assessment(findNode(demoGraph,'app-policy')).action,'Assess modernization');});
test('scenario benefits start after implementation and duplicate selections cannot double count',()=>{
  const s=scenario(demoGraph,['init-policy','init-test','init-test'],36,1000000);assert.equal(s.investment,720000);assert.equal(s.annualSaving,340000);assert.equal(s.grossBenefit,755000);assert.equal(s.netBenefit,35000);
  const short=scenario(demoGraph,['init-policy'],6);assert.equal(short.grossBenefit,0);assert.equal(short.netBenefit,-650000);
});
test('dependencies delay benefit start and missing predecessors raise review flags',()=>{
  const s=scenario(demoGraph,['init-policy','init-report'],36);assert.equal(s.schedule.find(x=>x.id==='init-report').start,12);assert.equal(s.schedule.find(x=>x.id==='init-report').end,18);assert.ok(s.warnings.some(x=>x.includes('validation')));
  assert.ok(scenario(demoGraph,['init-report']).warnings.some(x=>x.includes('requires Modernize policy services')));
  assert.ok(scenario(demoGraph,['init-policy'],36,200000).warnings.some(x=>x.includes('exceeds budget')));
});
test('imports reject duplicate IDs, dangling edges, invalid amounts and dependency cycles',()=>{
  assert.equal(validateGraph(demoGraph),demoGraph);
  let g=structuredClone(demoGraph);g.nodes.push(g.nodes[0]);assert.throws(()=>validateGraph(g),/Duplicate/);
  g=structuredClone(demoGraph);g.edges[0].target='absent';assert.throws(()=>validateGraph(g),/Dangling/);
  g=structuredClone(demoGraph);g.nodes.find(n=>n.id==='app-policy').annualCost=-1;assert.throws(()=>validateGraph(g),/Invalid annualCost/);
  g=structuredClone(demoGraph);g.edges.push({id:'cycle',source:'init-policy',target:'init-report',type:'DEPENDS_ON',state:'proposed'});assert.throws(()=>validateGraph(g),/Cyclic/);
});
test('advisor routes unsupported questions to explicit coverage gaps and numeric questions to calculations',()=>{
  assert.equal(answerQuestion(demoGraph,'Will our share price rise?').tool,'no_supported_tool');
  assert.equal(answerQuestion(demoGraph,'What is total annual run cost?').tool,'get_portfolio_summary');
  assert.equal(answerQuestion(demoGraph,'What is the business impact of the Legacy database platform?').tool,'trace_business_impact');
  assert.equal(summary(demoGraph).cost,4455000);
});
