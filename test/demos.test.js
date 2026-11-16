import assert from 'node:assert/strict';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import sharp from 'sharp';
import {buildDemos} from '../scripts/build-demos.js';
import {modules} from '../course.js';
import {moduleOutline} from '../lessons.js';

test('all 24 module parts have their own valid three-frame animated GIF', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'celda-demos-'));
  try {
    await buildDemos(directory);
    const expected = modules.flatMap(module => moduleOutline(module).parts.map((_,index) =>
      'modulo-'+module.id+'-parte-'+(index+1)+'.gif'));
    assert.equal(expected.length,24);
    assert.deepEqual((await readdir(directory)).sort(),expected.sort());
    for (const filename of expected) {
      const gif = await sharp(join(directory,filename)).metadata();
      assert.equal(gif.format,'gif');
      assert.equal(gif.pages,3);
      assert.deepEqual(gif.delay,[4300,4300,4300]);
    }
  } finally {
    await rm(directory,{recursive:true,force:true});
  }
});
