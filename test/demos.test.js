import assert from 'node:assert/strict';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import sharp from 'sharp';
import {buildDemos} from '../scripts/build-demos.js';
import {modules} from '../course.js';

test('all practice modules have a valid three-frame animated GIF', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'celda-demos-'));
  try {
    await buildDemos(directory);
    assert.equal((await readdir(directory)).length, modules.length);
    for (const {id} of modules) {
      const gif = await sharp(join(directory,'modulo-'+id+'.gif')).metadata();
      assert.equal(gif.format,'gif');
      assert.equal(gif.pages,3);
      assert.deepEqual(gif.delay,[4300,4300,4300]);
    }
  } finally {
    await rm(directory,{recursive:true,force:true});
  }
});
