import assert from 'node:assert/strict';
import {modules} from '../dist/modules.js';
export async function verifyModules(page){
 page.on('pageerror',e=>console.log('Module page error:',e.message));
 await page.setViewportSize({width:1440,height:1100});
 await page.goto('http://127.0.0.1:4173/#modules');
 await page.getByRole('heading',{name:'Twelve modules. One enterprise context.'}).waitFor();
 assert.equal(await page.locator('.module-card').count(),12);
 await page.screenshot({path:'preview/twelve-modules.png',fullPage:true});
 for(const m of modules){
  await page.goto('http://127.0.0.1:4173/#module-'+m.id);
  await page.getByRole('heading',{name:m.name,exact:true}).waitFor();
 }
 await page.goto('http://127.0.0.1:4173/#builder');
 await page.getByLabel('Unique record ID',{exact:true}).fill('qa-cloud');
 await page.getByLabel('Entity name',{exact:true}).fill('QA cloud resource');
 await page.getByLabel('Entity type',{exact:true}).selectOption('CloudResource');
 await page.getByLabel('Accountable owner',{exact:true}).fill('QA owner');
 await page.getByLabel('Evidence source / reference',{exact:true}).fill('Synthetic QA mapping');
 await page.getByRole('button',{name:'Add record',exact:true}).click();
 assert.ok(await page.getByRole('button',{name:'Save record',exact:true}).isVisible(), await page.locator('#context-editor').innerText()+' INVALID '+JSON.stringify(await page.locator('#context-editor').evaluate(f=>[...f.elements].filter(e=>!e.checkValidity()).map(e=>({name:e.name,message:e.validationMessage,value:e.value})))));
 await page.reload();
 await page.locator('#editor-record').selectOption('qa-cloud');
 assert.equal(await page.getByLabel('Entity name',{exact:true}).inputValue(),'QA cloud resource');
 await page.getByRole('button',{name:'Relationships',exact:true}).click();
 await page.getByLabel('Unique record ID',{exact:true}).fill('qa-dependency');
 await page.getByLabel('Source entity',{exact:true}).selectOption('app-policy');
 await page.getByLabel('Target entity',{exact:true}).selectOption('qa-cloud');
 await page.getByLabel('Accountable owner',{exact:true}).fill('QA owner');
 await page.getByLabel('Evidence source / reference',{exact:true}).fill('Synthetic relationship evidence');
 await page.getByRole('button',{name:'Add record',exact:true}).click();
 assert.ok(await page.getByRole('button',{name:'Save record',exact:true}).isVisible(), await page.locator('#context-editor').innerText()+' INVALID '+JSON.stringify(await page.locator('#context-editor').evaluate(f=>[...f.elements].filter(e=>!e.checkValidity()).map(e=>({name:e.name,message:e.validationMessage,value:e.value})))));
 await page.goto('http://127.0.0.1:4173/#module-finops');
 await page.getByRole('button',{name:'QA cloud resource',exact:true}).waitFor();
 await page.goto('http://127.0.0.1:4173/#readiness');
 await page.getByRole('heading',{name:'Context readiness',exact:true}).waitFor();
 await page.screenshot({path:'preview/context-readiness.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 for(const name of ['modules','builder','readiness']){
  await page.goto('http://127.0.0.1:4173/#'+name);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),name+' mobile overflow');
 }
 await page.goto('http://127.0.0.1:4173/#modules');
 await page.screenshot({path:'preview/modules-mobile.png',fullPage:true});
}
