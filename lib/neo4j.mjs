import { demoGraph } from '../dist/data.js';
import { validateGraph } from '../dist/engine.js';
export const workspace = 'intelligent-cio-prototype-v1';
export function neo4jConfigured(env=process.env){return Boolean(env.NEO4J_HTTP_URL&&env.NEO4J_USERNAME&&env.NEO4J_PASSWORD);}
export async function cypher(statements,env=process.env){
  if(!neo4jConfigured(env))throw new Error('Neo4j configuration is incomplete.');
  const url=new URL(env.NEO4J_HTTP_URL);if(!['http:','https:'].includes(url.protocol))throw new Error('Neo4j requires an HTTP(S) URL.');
  const database=env.NEO4J_DATABASE||'neo4j';
  const response=await fetch(new URL(`/db/${encodeURIComponent(database)}/tx/commit`,url),{method:'POST',headers:{'content-type':'application/json',authorization:'Basic '+Buffer.from(`${env.NEO4J_USERNAME}:${env.NEO4J_PASSWORD}`).toString('base64')},body:JSON.stringify({statements}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error(`Neo4j returned HTTP ${response.status}.`);
  const payload=await response.json();if(payload.errors?.length)throw new Error('Neo4j query failed. Check local database permissions and schema.');return payload.results;
}
export async function loadContext(env=process.env){
  if(!neo4jConfigured(env))return {graph:demoGraph,mode:'demo'};
  const result=await cypher([
    {statement:'MATCH (n:EnterpriseEntity {workspace: $workspace}) RETURN n.payload',parameters:{workspace}},
    {statement:'MATCH (:EnterpriseEntity {workspace: $workspace})-[r:CONTEXT_RELATION]->(:EnterpriseEntity {workspace: $workspace}) RETURN r.payload',parameters:{workspace}},
    {statement:'MATCH (s:ContextSnapshot {workspace: $workspace}) RETURN s.payload',parameters:{workspace}}
  ],env);
  const unpack=r=>(r.data||[]).map(d=>JSON.parse(d.row[0]));
  const nodes=unpack(result[0]),edges=unpack(result[1]),meta=unpack(result[2])[0];
  if(!nodes.length||!meta)throw new Error('Neo4j context is empty. Run npm run seed:neo4j.');
  return {graph:validateGraph({nodes,edges,meta}),mode:'neo4j'};
}
