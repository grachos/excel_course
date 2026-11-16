import assert from 'node:assert/strict';
import {test} from 'node:test';
import {prepareQuestions} from '../exam-options.js';
import {examQuestions,partKinds} from '../lessons.js';

test('all questionnaires balance correct positions without changing answers or the source bank',()=>{
 for(let module=1;module<=8;module++) {
  for(const kind of [...partKinds,'long']) {
   const bank=examQuestions(module,kind);
   const original=JSON.stringify(bank);
   for(let attempt=0;attempt<20;attempt++) {
    const items=prepareQuestions(bank);
    const counts=new Map();
    items.forEach((item,index)=>{
     const source=bank[index];
     assert.equal(item.options.filter(option=>option.correct).length,1);
     assert.equal(item.options.find(option=>option.correct).text,source.options[source.correct]);
     assert.deepEqual(item.options.map(option=>option.text).sort(),[...source.options].sort());
     const n=item.options.length;
     if(!counts.has(n)) counts.set(n,Array(n).fill(0));
     counts.get(n)[item.options.findIndex(option=>option.correct)]++;
    });
    for(const distribution of counts.values()) assert.ok(Math.max(...distribution)-Math.min(...distribution)<=1);
    assert.ok(items.filter(item=>item.options[0].correct).length/items.length<0.8);
   }
   assert.equal(JSON.stringify(bank),original);
  }
 }
});
