import assert from 'node:assert/strict';
import {test} from 'node:test';
import {activityBlocks} from '../activity-sequence.js';
const completed = {'part:1':100,'part:2':100,'part:3':100,practice:100};
for (const owner of [false,true]) {
  for (let id=1;id<=8;id++) {
    test('module '+id+' enforces every assessment prerequisite; owner='+owner, () => {
      for (const absent of Object.keys(completed)) {
        const scores={...completed,short:100,long:100};
        delete scores[absent];
        const result=activityBlocks({id,passed:true,scores},owner);
        assert.match(result.long,/Examen bloqueado/);
        assert.match(result.long,absent==='practice'?/entrega/:new RegExp('parte '+absent.split(':')[1]));
      }
      assert.equal(activityBlocks({id,scores:completed},owner).long,undefined);
      assert.match(activityBlocks({id,scores:{short:100,practice:100}},owner).long,/parte 1.*parte 2.*parte 3/);
    });
  }
  test('final project must reach 80 even in preview; owner='+owner,()=>{
    assert.match(activityBlocks({id:8,scores:{...completed,practice:79}},owner).long,/80\/100/);
    assert.equal(activityBlocks({id:8,scores:{...completed,practice:80}},owner).long,undefined);
  });
}
test('student parts and practice retain their sequence',()=>{
 const blocks=activityBlocks({id:1,scores:{'part:1':55}});
 assert.match(blocks['part:3'],/parte 2/);
 assert.match(blocks.practice,/parte 2/);
 assert.equal(blocks['part:2'],undefined);
});
