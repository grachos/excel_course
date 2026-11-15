import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import ExcelJS from 'exceljs';
test('sessions, isolation, workbook review and module unlocking',{skip:!process.env.DATABASE_URL,timeout:30000},async()=>{
 const origin='http://127.0.0.1:3101';
 const child=spawn(process.execPath,['server.js'],{env:{...process.env,APP_ORIGIN:origin,PORT:'3101',NODE_ENV:'test',OPENAI_API_KEY:'',OWNER_SETUP_TOKEN:'test-only-owner-code'},stdio:'inherit'});
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
 assert.equal((await request('/owner/report.xlsx',{cookie})).status,403);
 assert.equal((await request('/owner/claim',{cookie,method:'POST',body:{token:'wrong'}})).status,403);
 assert.equal((await request('/owner/claim',{cookie:cookieB,method:'POST',body:{token:'test-only-owner-code'}})).status,201);
 assert.equal((await request('/owner/claim',{cookie,method:'POST',body:{token:'test-only-owner-code'}})).status,409);
 assert.equal((await (await request('/me',{cookie:cookieB})).json()).isOwner,true);
 const ownerList = await (await request('/owner/students?q='+encodeURIComponent(email),{cookie:cookieB})).json();
 const student = ownerList.students.find(row => row.email === email);
 assert.equal(student.approved,1);
 assert.equal((await request('/owner/students/'+student.id,{cookie})).status,403);
 const detail = await (await request('/owner/students/'+student.id,{cookie:cookieB})).json();
 assert.equal(detail.attempts.length,3);
 for(const path of ['/owner/report.xlsx','/owner/students/'+student.id+'/report.xlsx']){
 const response = await request(path,{cookie:cookieB});
 assert.equal(response.status,200);
 assert.equal(response.headers.get('cache-control'),'no-store');
 const report = new ExcelJS.Workbook();
 await report.xlsx.load(Buffer.from(await response.arrayBuffer()));
 assert.equal(report.worksheets[0].getCell('B2').value,email);
 if(path.includes('/students/'))assert.equal(report.getWorksheet('Intentos y correcciones').rowCount,4);
 }
 const patchStudent = (id, changes, cookie = cookieB) =>
   request('/owner/students/'+id,{cookie,method:'PATCH',body:changes});
 const login = (email, password) =>
   request('/auth/login',{method:'POST',body:{email,password}});
 assert.equal((await patchStudent(student.id,{active:false},cookie)).status,403);
 const me = await (await request('/me',{cookie:cookieB})).json();
 assert.equal((await patchStudent(me.user.id,{active:false})).status,403);
 assert.equal((await patchStudent(student.id,{email:'not-an-email'})).status,400);
 assert.equal((await patchStudent(student.id,{email:me.user.email})).status,409);
 assert.equal((await patchStudent(student.id,{password:'short'})).status,400);
 assert.equal((await patchStudent(student.id,{active:false})).status,200);
 assert.equal((await request('/me',{cookie})).status,401);
 assert.equal((await login(email,'integration-password')).status,401);
 assert.equal((await patchStudent(student.id,{active:true})).status,200);
 assert.equal((await request('/me',{cookie})).status,401);
 const previousLogin = await login(email,'integration-password');
 assert.equal(previousLogin.status,200);
 const previousCookie = previousLogin.headers.get('set-cookie').split(';')[0];
 const newEmail = 'edited-'+email;
 assert.equal((await patchStudent(student.id,{email:newEmail.toUpperCase()})).status,200);
 assert.equal((await request('/me',{cookie:previousCookie})).status,401);
 assert.equal((await login(email,'integration-password')).status,401);
 const renamedLogin = await login(newEmail,'integration-password');
 assert.equal(renamedLogin.status,200);
 const renamedCookie = renamedLogin.headers.get('set-cookie').split(';')[0];
 assert.equal((await patchStudent(student.id,{password:'replacement-password'})).status,200);
 assert.equal((await request('/me',{cookie:renamedCookie})).status,401);
 assert.equal((await login(newEmail,'integration-password')).status,401);
 const newLogin = await login(newEmail,'replacement-password');
 assert.equal(newLogin.status,200);
 const newCookie = newLogin.headers.get('set-cookie').split(';')[0];
 assert.equal((await (await request('/me',{cookie:newCookie})).json()).progress[0].passed,true);
 await request('/logout',{cookie,method:'POST'});
 assert.equal((await request('/me',{cookie})).status,401);
 }finally{child.kill('SIGTERM');}
});
