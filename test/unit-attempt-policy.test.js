import assert from 'node:assert/strict';
import {test} from 'node:test';
import {moduleGrade} from '../grading.js';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
test('an assessment below 80 cannot be compensated by practice and section grades',()=>{
 for(let id=1;id<=8;id++) {
  assert.equal(moduleGrade({practice:100,short:100,long:79},id).passed,false);
  assert.equal(moduleGrade({practice:100,short:100,long:80},id).passed,true);
 }
});
const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
test('failed unit assessment explicitly reports failure',()=>{
 const render=runInNewContext(app+'\nreportHTML;',{
  URLSearchParams,location:{search:''},window:{scrollTo(){}},
  document:{querySelector:()=>({hidden:false}),addEventListener(){}},
  fetch:()=>Promise.reject(new Error('No session'))
 });
 assert.match(render({score:50,examScore:50,final:{attempt:1,maxAttempts:3},details:[]}),/No aprobaste/);
});
