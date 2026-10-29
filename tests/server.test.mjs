import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.mjs';
test('read-only API serves the same context, validates requests and keeps server files private',async()=>{
  // Dispatch through Node's request listener without opening a socket, so this suite
  // also runs in sandboxes that block loopback network connections.
  const server=createServer();
  const request=(url,method='GET')=>new Promise(resolve=>{const response={status:200,headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);},end(body){resolve({status:this.status,body:String(body),headers:this.headers,json(){return JSON.parse(this.body);}});}};server.emit('request',{url,method},response);});
  const context=(await request('/api/context')).json();assert.equal(context.mode,'demo');assert.ok(context.graph.nodes.length>30);
  const summary=(await request('/api/summary')).json();assert.equal(summary.assets,9);
  const result=(await request('/api/impact?id=tech-db')).json();assert.ok(result.impact.some(x=>x.node.id==='obj-growth'));
  assert.equal((await request('/api/impact?id=missing')).status,404);
  assert.equal((await request('/api/context','POST')).status,405);
  assert.equal((await request('/api/scenario?ids=missing')).status,400);
  assert.equal((await request('/.env')).status,404);assert.equal((await request('/server.mjs')).status,404);
  assert.match((await request('/')).body,/Intelligent CIO Transformation Workbench/);
});
