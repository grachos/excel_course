import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import ExcelJS from 'exceljs';
import pg from 'pg';
import {modules} from '../course.js';
import {examQuestions, partKinds} from '../lessons.js';
test('sessions, isolation, workbook review and module unlocking',{skip:!process.env.DATABASE_URL,timeout:30000},async()=>{
 const origin='http://127.0.0.1:3101';
 const clockTestDb=new pg.Pool({connectionString:process.env.DATABASE_URL});
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
 const outline=await (await request('/modules',{cookie})).json();
 assert.equal(outline.length,8);
 assert.equal(outline[0].parts.length,3);
 assert.equal(outline[0].parts[0].questions,undefined);
 assert.equal(outline[0].examples.length,2);
 assert.equal(outline[7].unitQuestionCount,16);
 assert.equal((await request('/modules/1/exam',{cookie,method:'POST',body:{kind:'short'}})).status,400);
 const answerFor = (module,kind,questions) => {
   const bank = examQuestions(module,kind);
   return questions.map(({question,options}) => {
     const item = bank.find(entry=>entry.question===question);
     return options.indexOf(item.options[item.correct]);
   });
 };
 for(const kind of [...partKinds,'long']){
 const exam=await(await request('/modules/1/exam',{cookie,method:'POST',body:{kind}})).json();
 assert.equal(exam.questions.length,kind==='long'?6:3);
 const answers=answerFor(1,kind,exam.questions);
 const submit=await request('/modules/1/exam/submit',{cookie,method:'POST',body:{id:exam.id,answers}});
 assert.equal((await submit.json()).score,100);
 assert.equal((await request('/modules/1/exam/submit',{cookie,method:'POST',body:{id:exam.id,answers}})).status,400);
 }
 const firstProgress=await (await request('/me',{cookie})).json();
 assert.equal(firstProgress.progress[0].scores.short,100);
 const template = await request('/modules/2/template',{cookie});
 assert.equal(template.status,200);
 assert.match(template.headers.get('content-type'),/^application\/vnd\.openxmlformats/);
 assert.equal(template.headers.get('content-disposition').replaceAll('"',''),'attachment; filename=practica-2.xlsx');
 assert.equal(template.headers.get('cache-control'),'private, no-store');
 const templateBook = new ExcelJS.Workbook();
 await templateBook.xlsx.load(Buffer.from(await template.arrayBuffer()));
 assert.ok(templateBook.getWorksheet('Entrega'));
 const b=await request('/auth/register',{method:'POST',body:{email:'other-'+email,password:'integration-password',name:'Luis',tool:'sheets'}});
 const cookieB=b.headers.get('set-cookie').split(';')[0];
 assert.deepEqual(await(await request('/history',{cookie:cookieB})).json(),[]);
 assert.equal((await request('/modules/2/template',{cookie:cookieB})).status,403);
 assert.equal((await request('/owner/report.xlsx',{cookie})).status,403);
 assert.equal((await request('/owner/claim',{cookie,method:'POST',body:{token:'wrong'}})).status,403);
 assert.equal((await request('/owner/claim',{cookie:cookieB,method:'POST',body:{token:'test-only-owner-code'}})).status,201);
 assert.equal((await request('/owner/claim',{cookie,method:'POST',body:{token:'test-only-owner-code'}})).status,409);
 assert.equal((await (await request('/me',{cookie:cookieB})).json()).isOwner,true);
 for (const {id} of modules) {
   assert.equal((await request('/modules/'+id+'/template',{cookie:cookieB})).status,200);
 }
 assert.equal((await request('/modules/8/template',{cookie})).status,403);
 assert.equal((await request('/modules/8/exam',{cookie:cookieB,method:'POST',body:{kind:'long'}})).status,400);
 const practiceBook = new ExcelJS.Workbook();
 const practiceSheet = practiceBook.addWorksheet('Entrega');
 for (const {cell,expected} of modules[7].checks) practiceSheet.getCell(cell).value = expected;
 const ownerPractice = new FormData();
 ownerPractice.append('file', new Blob([await practiceBook.xlsx.writeBuffer()]), 'project.xlsx');
 const preview = await request('/modules/8/practice',{cookie:cookieB,method:'POST',body:ownerPractice,raw:true});
 assert.equal(preview.status,200);
 assert.equal((await preview.json()).score,100);
 for (const kind of [...partKinds,'long']) {
   const exam = await (await request('/modules/8/exam',{cookie:cookieB,method:'POST',body:{kind}})).json();
   assert.equal(exam.questions.length,kind==='long'?16:3);
   if (kind==='long') {
     assert.equal(exam.final.attempt,1);
     assert.equal(Date.parse(exam.final.expiresAt)-Date.parse(exam.final.serverNow),60*60*1000);
   }
   const answers = answerFor(8,kind,exam.questions);
   const result = await request('/modules/8/exam/submit',{cookie:cookieB,method:'POST',body:{id:exam.id,answers}});
   assert.equal(result.status,200);
   assert.equal((await result.json()).score,100);
 }
 const previewProfile = await (await request('/me',{cookie:cookieB})).json();
 assert.equal(previewProfile.progress[7].passed,true);
 assert.equal(previewProfile.progress[0].passed,false);
 const previewHistory = await (await request('/history',{cookie:cookieB})).json();
 assert.equal(previewHistory.length,5);
 const ownerReportDetail = await (await request('/owner/students/'+previewProfile.user.id,{cookie:cookieB})).json();
 assert.equal(ownerReportDetail.attempts.length,0);
 assert.equal(ownerReportDetail.student.progress[7].score,null);
 const startFinal = () => request('/modules/8/exam',{cookie:cookieB,method:'POST',body:{kind:'long'}});
 const submitFinal = (exam,answers=answerFor(8,'long',exam.questions)) =>
   request('/modules/8/exam/submit',{cookie:cookieB,method:'POST',body:{id:exam.id,answers}});
 const [second,resumed] = await Promise.all([startFinal(),startFinal()]).then(responses=>Promise.all(responses.map(r=>r.json())));
 assert.equal(second.final.attempt,2);
 assert.equal(second.id,resumed.id);
 assert.equal(second.final.expiresAt,resumed.final.expiresAt);
 assert.deepEqual(second.questions,resumed.questions);
 assert.equal((await submitFinal(second,[])).status,400);
 assert.equal((await (await startFinal()).json()).id,second.id);
 await clockTestDb.query("UPDATE final_exam_sessions SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[second.id]);
 assert.equal((await submitFinal(second)).status,400);
 const third = await (await startFinal()).json();
 assert.equal(third.final.attempt,3);
 const thirdResponse = await submitFinal(third);
 assert.equal(thirdResponse.status,200);
 const thirdReport = await thirdResponse.json();
 const locked = await startFinal();
 assert.equal(locked.status,429);
 assert.equal((await locked.json()).availableAt,thirdReport.final.availableAt);
 assert.equal((await submitFinal(third)).status,400);
 await clockTestDb.query("UPDATE final_exam_sessions SET finished_at=clock_timestamp()-interval '25 hours' WHERE id=$1",[third.id]);
 const renewed = await (await startFinal()).json();
 assert.equal(renewed.final.attempt,1);
 assert.notEqual(renewed.id,third.id);
 const pivotTemplate = await request('/modules/7/template',{cookie:cookieB});
 assert.equal(pivotTemplate.status,200);
 const pivotBook = new ExcelJS.Workbook();
 await pivotBook.xlsx.load(Buffer.from(await pivotTemplate.arrayBuffer()));
 const pivotData = pivotBook.getWorksheet('Datos');
 assert.equal(pivotData.rowCount,9);
 assert.equal(pivotData.getCell('C1').value,'Importe');
 assert.equal(pivotData.getCell('C9').value,40);
 const pivotResult = pivotBook.getWorksheet('Entrega');
 pivotResult.addRows([
   ['Suma de Importe','Etiquetas de columna'],
   ['Región','Febrero','Enero','Grand Total'],
   ['Sur',200,90,290], ['Centro',125,75,200], ['Norte',180,150,330],
   ['Grand Total',505,315,820]
 ]);
 async function uploadPivot() {
   const form = new FormData();
   form.append('file', new Blob([await pivotBook.xlsx.writeBuffer()]), 'pivot.xlsx');
   const result = await request('/modules/7/practice',{cookie:cookieB,method:'POST',body:form,raw:true});
   assert.equal(result.status,200);
   return result.json();
 }
 assert.equal((await uploadPivot()).score,100);
 pivotResult.getCell('B3').value=2;
 const mistaken = await uploadPivot();
 assert.equal(mistaken.score,92);
 assert.equal(mistaken.details.find(detail => detail.cell==='sur:febrero').ok,false);
 const ownerList = await (await request('/owner/students?q='+encodeURIComponent(email),{cookie:cookieB})).json();
 const student = ownerList.students.find(row => row.email === email);
 assert.equal(student.approved,1);
 assert.equal((await request('/owner/students/'+student.id,{cookie})).status,403);
 const detail = await (await request('/owner/students/'+student.id,{cookie:cookieB})).json();
 assert.equal(detail.attempts.length,5);
 for(const path of ['/owner/report.xlsx','/owner/students/'+student.id+'/report.xlsx']){
 const response = await request(path,{cookie:cookieB});
 assert.equal(response.status,200);
 assert.equal(response.headers.get('cache-control'),'no-store');
 const report = new ExcelJS.Workbook();
 await report.xlsx.load(Buffer.from(await response.arrayBuffer()));
 assert.equal(report.worksheets[0].getCell('B2').value,email);
 if(path.includes('/students/'))assert.equal(report.getWorksheet('Intentos y correcciones').rowCount,6);
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
 }finally{child.kill('SIGTERM');await clockTestDb.end();}
});
