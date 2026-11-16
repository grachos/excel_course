import assert from 'node:assert/strict';
import {test} from 'node:test';
import {activityBlocks} from '../activity-sequence.js';

test('a student must complete each part in order before practice and unit assessment', () => {
 const one={id:1,passed:false,scores:{'part:1':55}};
 assert.match(activityBlocks(one)['part:3'],/parte 2/);
 assert.match(activityBlocks(one).practice,/parte 2/);
 assert.equal(activityBlocks(one)['part:2'],undefined);
 assert.match(activityBlocks({...one,scores:{short:70}}).long,/entrega la práctica/);
 assert.deepEqual(activityBlocks({...one,scores:{short:70,practice:10}}),{});
});

test('the final requires an approved project for students and a submitted project in owner preview', () => {
 const student={id:8,passed:false,scores:{short:100,practice:79}};
 assert.match(activityBlocks(student).long,/80\/100/);
 assert.deepEqual(activityBlocks({...student,scores:{short:100,practice:80}}),{});
 assert.deepEqual(activityBlocks(student,true),{});
 assert.match(activityBlocks({...student,scores:{}},true).long,/proyecto final de prueba/);
});
