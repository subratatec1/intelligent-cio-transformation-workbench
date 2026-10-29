import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadContext} from './lib/neo4j.mjs';
import {summary,businessImpact,findNode,answerQuestion,scenario} from './dist/engine.js';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));};
export function createServer(){return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  try{
    if(req.method!=='GET'){send(res,405,{error:'Only GET requests are supported by this read-only prototype API.'});return;}
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/health'){send(res,200,{status:'ok',prototype:true});return;}
    if(url.pathname.startsWith('/api/')){
      const {graph,mode}=await loadContext();
      if(url.pathname==='/api/context'){send(res,200,{graph,mode});return;}
      if(url.pathname==='/api/summary'){send(res,200,{...summary(graph),mode});return;}
      if(url.pathname==='/api/impact'){const id=url.searchParams.get('id');if(!findNode(graph,id)){send(res,404,{error:'Unknown entity'});return;}send(res,200,{id,impact:businessImpact(graph,id)});return;}
      if(url.pathname==='/api/advisor'){const q=url.searchParams.get('q')||'';if(!q||q.length>600){send(res,400,{error:'Provide a question of 1–600 characters.'});return;}send(res,200,answerQuestion(graph,q));return;}
      if(url.pathname==='/api/scenario'){const ids=(url.searchParams.get('ids')||'').split(',').filter(Boolean),horizon=Number(url.searchParams.get('horizon')||36),budget=Number(url.searchParams.get('budget')||1000000);if(!Number.isFinite(budget)||budget<0){send(res,400,{error:'Invalid budget'});return;}try{send(res,200,scenario(graph,ids,horizon,budget));}catch(error){send(res,400,{error:error.message});}return;}
      send(res,404,{error:'Unknown API endpoint'});return;
    }
    let relative;try{relative=decodeURIComponent(url.pathname);}catch{send(res,400,{error:'Invalid path'});return;}
    const target=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
    if(!target.startsWith(root+path.sep)){send(res,403,{error:'Path not permitted'});return;}
    try{const content=await readFile(target);res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream','cache-control':'no-cache'});res.end(content);}catch{send(res,404,{error:'File not found'});}
  }catch(error){console.error('Request failed:',error.message);send(res,503,{error:'Context backend unavailable. Check the server logs and Neo4j setup.'});}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||4173);const server=createServer();server.listen(port,'127.0.0.1',()=>console.log(`Intelligent CIO Workbench ready: http://127.0.0.1:${port}`));
  process.on('SIGINT',()=>server.close(()=>process.exit(0)));
}
