import test from 'node:test';
import assert from 'node:assert/strict';
import {demoGraph} from '../dist/data.js';
import {modules,moduleCoverage,contextReadiness} from '../dist/modules.js';
import {saveContextRecord} from '../dist/context-editor.js';
const evidence={owner:'QA owner',source:'Synthetic QA source',observedAt:'2026-10-30',classification:'Internal',confidence:'Low',state:'observed',validated:false};
test('module coverage exposes missing types and updates when context is added',()=>{
 assert.equal(modules.length,12);
 const m=modules.find(m=>m.id==='finops');
 assert.ok(moduleCoverage(demoGraph,m).missing.includes('CloudResource'));
 const g=saveContextRecord(demoGraph,'node',{...evidence,id:'qa-cloud',name:'QA cloud',type:'CloudResource'});
 assert.ok(!moduleCoverage(g,m).missing.includes('CloudResource'));
 assert.equal(demoGraph.nodes.length,34);
});
test('record updates preserve existing attributes; invalid writes leave original graph untouched',()=>{
 const prior=demoGraph.nodes.find(n=>n.id==='app-policy');
 const g=saveContextRecord(demoGraph,'node',{...evidence,id:prior.id,name:'Updated policy',type:'Application'});
 assert.equal(g.nodes.find(n=>n.id===prior.id).annualCost,prior.annualCost);
 assert.equal(prior.name,'PolicyCore');
 assert.throws(()=>saveContextRecord(demoGraph,'node',{...evidence,id:'bad',name:'Bad',type:'Initiative'}),/requires financial/);
 assert.throws(()=>saveContextRecord(demoGraph,'node',{...evidence,observedAt:'2026-02-30',id:'bad',name:'Bad',type:'Tool'}),/valid evidence date/);
});
test('relationship authoring keeps endpoint and evidence source distinct and prevents dangling references',()=>{
 const r={...evidence,id:'qa-link',source:'app-policy',target:'app-crm',sourceRef:'Review mapping',type:'DEPENDS_ON'};
 const g=saveContextRecord(demoGraph,'edge',r);
 assert.equal(g.edges.at(-1).sourceRef,'Review mapping');
 assert.throws(()=>saveContextRecord(demoGraph,'edge',{...r,target:'missing'}),/Dangling/);
 assert.throws(()=>saveContextRecord(demoGraph,'edge',{...r,target:r.source}),/different source/);
 assert.throws(()=>saveContextRecord(demoGraph,'edge',{...r,sourceRef:''}),/sourceRef/);
});
test('readiness exposes missing governance rather than equating existing types with readiness',()=>{
 const g={meta:{},nodes:[{...evidence,id:'a',name:'A',type:'Tool'}],edges:[]};
 const r=contextReadiness(g,'2026-10-30');
 assert.equal(r.complete,1);assert.equal(r.unvalidated,1);assert.equal(r.stale,0);assert.equal(r.isolated.length,1);
 g.nodes[0].observedAt='2025-01-01';assert.equal(contextReadiness(g,'2026-10-30').stale,1);
 delete g.nodes[0].classification;assert.equal(contextReadiness(g).complete,0);
});
