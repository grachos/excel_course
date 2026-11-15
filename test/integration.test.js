import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import ExcelJS from 'exceljs';
test('sessions, isolation, workbook review and module unlocking',{skip:!process.env.DATABASE_URL,timeout:30000},async()=>{
 const origin='http://127.0.0.1:3101';
 const child=spawn(process.execPath,['server.js'],{env:{...process.env,APP_ORIGIN:origin,PORT:'3101',NODE_ENV:'test',OPENAI_API_KEY:''},stdio:'inherit'});
 try{
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(origin+'/health')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,150));}assert.equal(ready,true);
 async function request(path,{cookie,body,method='GET',raw=false,originOverride=origin}={}){
 const headers={Origin:originOverride};if(cookie)headers.Cookie=cookie;if(body&&!raw)headers['Content-Type']='application/json';
 return fetch(origin+'/api'+path,{method,headers,body:body?(raw?body:JSON.stringify(body)):undefined});
 }
 assert.equal((await request('/me')).status,401);
 const email='test-'+Date.now()+'@example.com';
 const a=await request('/auth/register',{method:'POST',body:{email,password:'integration-password',name:'Ana',tool:'excel'}});assert.equal(a.status,200);
 const cookie=a.headers.get('set-cookie').split(';')[0];
 assert.equal((await request('/modules/2/template',{cookie})).status,403);
 assert.equal((await request('/logout',{cookie,method:'POST',originOverride:'https://wrong.example'})).status,403);
 const workbook=new ExcelJS.Workbook();const sheet=workbook.addWorksheet('Entrega');sheet.getCell('A1').value='Concepto';sheet.getCell('B1').value='Valor';sheet.getCell('B2').value=800000;
 const form=new FormData();form.append('file',new Blob([await workbook.xlsx.writeBuffer()]),'practice.xlsx');
 const uploaded=await request('/modules/1/practice',{cookie,method:'POST',body:form,raw:true});assert.equal(uploaded.status,200);assert.equal((await uploaded.json()).score,100);
 for(const kind of ['short','long']){
 const exam=await(await request('/modules/1/exam',{cookie,method:'POST',body:{kind}})).json();
 const correct=['Columna B, fila 3','La presentación','Un rango','Un concepto por fila'];
 const answers=exam.questions.map((q,i)=>q.options.indexOf(correct[i]));
 const submit=await request('/modules/1/exam/submit',{cookie,method:'POST',body:{id:exam.id,answers}});
 assert.equal((await submit.json()).score,100);
 assert.equal((await request('/modules/1/exam/submit',{cookie,method:'POST',body:{id:exam.id,answers}})).status,400);
 }
 assert.equal((await request('/modules/2/template',{cookie})).status,200);
 const b=await request('/auth/register',{method:'POST',body:{email:'other-'+email,password:'integration-password',name:'Luis',tool:'sheets'}});
 const cookieB=b.headers.get('set-cookie').split(';')[0];
 assert.deepEqual(await(await request('/history',{cookie:cookieB})).json(),[]);
 assert.equal((await request('/modules/2/template',{cookie:cookieB})).status,403);
 await request('/logout',{cookie,method:'POST'});
 assert.equal((await request('/me',{cookie})).status,401);
 }finally{child.kill('SIGTERM');}
});
