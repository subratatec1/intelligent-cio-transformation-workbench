
import test from 'node:test';import assert from 'node:assert/strict';
import {records,sources,summarize,priority,appRecords,within} from '../dist/operational.js';
import {demoGraph} from '../dist/data.js';
import {answerQuestion} from '../dist/engine.js';
test('six-month records reconcile by month and severity with unique provenance IDs',()=>{
 assert.ok(records.length>1000);assert.equal(new Set(records.map(r=>r.id)).size,records.length);
 for(const app of demoGraph.nodes.filter(n=>n.type==='Application')){
 const s=summarize(demoGraph,app.id);assert.equal(s.tickets.length,Object.values(s.counts).reduce((a,b)=>a+b,0));
 assert.equal(s.runs.length,48);for(const [source] of sources)assert.ok(s.all.some(r=>r.source===source));
 const one=summarize(demoGraph,app.id,1);assert.ok(one.tickets.length<s.tickets.length);assert.ok(one.all.every(r=>r.date.startsWith('2026-10')));
 }
 assert.equal(within({date:'2026-04-30'}),false);assert.equal(within({date:'2026-10-30'}),false);
});
test('evidence changes module priorities, has inspectable drivers and does not mutate baseline',()=>{
 const before=JSON.stringify(demoGraph),p=priority(demoGraph,'app-policy'),base=priority(demoGraph,'app-policy','applications',false);
 assert.ok(p.score>base.score);assert.ok(p.score<=100);assert.ok(p.uplift<=25);
 assert.ok(p.recordIds.every(id=>records.some(r=>r.id===id&&r.app==='app-policy')));
 const excluded=priority(demoGraph,'app-policy','finops');assert.ok(excluded.drivers.every(d=>d.source==='cloud'));
 const missing=structuredClone(demoGraph);delete missing.nodes.find(n=>n.id==='app-policy').risk;assert.equal(priority(missing,'app-policy').score,null);
 assert.equal(JSON.stringify(demoGraph),before);
});
test('demo records never attach to other enterprises and advisor computes ticket counts',()=>{
 const external=structuredClone(demoGraph);external.meta.synthetic=false;assert.equal(appRecords(external,'app-policy').length,0);
 const renamed=structuredClone(demoGraph);renamed.nodes.find(n=>n.id==='app-policy').name='Real application';assert.equal(appRecords(renamed,'app-policy').length,0);
 const result=answerQuestion(demoGraph,'How many tickets for PolicyCore in six months?');assert.equal(result.tool,'summarize_application_signals');assert.ok(result.text.includes(summarize(demoGraph,'app-policy').tickets.length+' tickets'));
});
