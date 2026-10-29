import {demoGraph} from '../dist/data.js';
import {cypher,workspace} from '../lib/neo4j.mjs';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
// Upserts only this prototype's namespace. It does not delete existing data.
await cypher([{statement:'CREATE CONSTRAINT cio_entity_identity IF NOT EXISTS FOR (n:EnterpriseEntity) REQUIRE (n.workspace, n.id) IS UNIQUE'}]);
await cypher([
  {statement:'UNWIND $nodes AS node MERGE (n:EnterpriseEntity {workspace: $workspace, id: node.id}) SET n.name=node.name, n.type=node.type, n.payload=node.payload',parameters:{workspace,nodes:demoGraph.nodes.map(n=>({id:n.id,name:n.name,type:n.type,payload:JSON.stringify(n)}))}},
  {statement:'UNWIND $edges AS edge MATCH (a:EnterpriseEntity {workspace:$workspace,id:edge.source}), (b:EnterpriseEntity {workspace:$workspace,id:edge.target}) MERGE (a)-[r:CONTEXT_RELATION {id:edge.id}]->(b) SET r.kind=edge.kind,r.state=edge.state,r.payload=edge.payload',parameters:{workspace,edges:demoGraph.edges.map(e=>({id:e.id,source:e.source,target:e.target,kind:e.type,state:e.state,payload:JSON.stringify(e)}))}},
  {statement:'MERGE (s:ContextSnapshot {workspace:$workspace}) SET s.payload=$payload',parameters:{workspace,payload:JSON.stringify(demoGraph.meta)}}
]);
console.log(`Seeded ${demoGraph.nodes.length} entities and ${demoGraph.edges.length} relationships into namespace ${workspace}.`);
