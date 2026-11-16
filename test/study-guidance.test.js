import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';

const app = await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const context = {
  URLSearchParams,location:{search:''},window:{scrollTo(){}},
  document:{querySelector:()=>({hidden:false}),addEventListener(){}},
  fetch:()=>Promise.reject(new Error('No session'))
};
const plan = runInNewContext(app+'\nstudyPlan;',context);
const parts = ['Celdas','Formato','Estructura'].map((title,index)=>({title,kind:'part:'+(index+1)}));

test('an unfinished module explains missing activities and their effect on approval', () => {
  const result=plan({id:1,parts},{passed:false,score:null,scores:{'part:1':100}});
  assert.deepEqual(Array.from(result.items,item=>item.target),['lesson-practice','lesson-part-2','lesson-part-3','lesson-assessment']);
  assert.match(result.items[3].reason,/examen final del módulo 8/);
});

test('the final module explains the project prerequisite before the final can be opened', () => {
  const result=plan({id:8,parts},{passed:false,score:null,scores:{short:100}});
  assert.equal(result.items[0].target,'lesson-practice');
  assert.match(result.items[0].reason,/se habilita cuando/);
  assert.match(result.items[1].title,/pendiente del proyecto/);
});

test('a student who has passed the exam and needs a better project is sent to the project', () => {
  const result=plan({id:8,parts},{passed:false,score:76,scores:{short:100,long:85,practice:70}});
  assert.deepEqual(Array.from(result.items,item=>item.target),['lesson-practice']);
  assert.match(result.items[0].reason,/80\/100/);
});
