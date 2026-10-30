import test from 'node:test';
import assert from 'node:assert/strict';
import {demoGraph} from '../dist/data.js';
import {signals,signalsFor,signalsView} from '../dist/signals.js';
test('sample signals cover seven sources and never map onto a non-demo enterprise',()=>{
 assert.equal(new Set(signals.map(s=>s.source)).size,7);
 for(const s of signals){for(const id of s.entities)assert.ok(demoGraph.nodes.some(n=>n.id===id));assert.match(signalsView(demoGraph,s.id),/Trace business impact/);}
 const imported=structuredClone(demoGraph);imported.meta.synthetic=false;
 assert.equal(signalsFor(imported,'app-policy').length,0);
 assert.doesNotMatch(signalsView(imported),/data-impact=/);
 const partial=structuredClone(demoGraph);partial.nodes=partial.nodes.filter(n=>n.id!=='tech-db');
 assert.doesNotMatch(signalsView(partial,'servicenow'),/data-impact=/);
});
