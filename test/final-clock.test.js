import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';

const app = await readFile(new URL('../public/app.js',import.meta.url),'utf8');

test('the final exam clock shows the remaining time, warns at five minutes, and disables an expired form', () => {
  const digits = {};
  const note = {hidden:true};
  const radio = {disabled:false};
  const submit = {disabled:false};
  const dock = {dataset:{},querySelector:() => digits};
  const form = {
    isConnected:true,dataset:{id:'test-final'},
    querySelector:selector => selector==='[data-final-dock]' ? dock : note,
    querySelectorAll:selector => selector==='input, button' ? [radio,submit] : [radio],
    addEventListener(){}
  };
  let elapsed=0;
  let tick;
  let stopped=false;
  const context = {
    URLSearchParams,location:{search:''},window:{scrollTo(){}},
    document:{querySelector:() => ({hidden:false}),addEventListener(){}},
    fetch: () => Promise.reject(new Error('No session')),
    performance:{now:() => elapsed},
    sessionStorage:{getItem:()=>null,removeItem(){}},
    setInterval(callback){tick=callback;return 1;},
    clearInterval(){stopped=true;},
    form
  };
  runInNewContext(app+`
    enableFinalTimer(form,{serverNow:'2026-11-16T16:00:00Z',expiresAt:'2026-11-16T17:00:00Z'});
  `,context);
  assert.equal(digits.textContent,'60:00');
  elapsed=44*60*1000+17*1000;
  tick();
  assert.equal(digits.textContent,'15:43');
  assert.equal(dock.dataset.runningOut,'false');
  elapsed=55*60*1000;
  tick();
  assert.equal(digits.textContent,'05:00');
  assert.equal(dock.dataset.runningOut,'true');
  elapsed=60*60*1000;
  tick();
  assert.equal(digits.textContent,'00:00');
  assert.equal(form.dataset.expired,'true');
  assert.equal(note.hidden,false);
  assert.equal(radio.disabled,true);
  assert.equal(submit.disabled,true);
  assert.equal(stopped,true);
});
