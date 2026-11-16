import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function setup(response) {
  const requests = [];
  const downloads = [];
  const status = {textContent:''};
  const handlers = {};
  const button = {dataset:{template:'3'}, disabled:false, textContent:'Descargar plantilla'};
  runInNewContext(source, {
    URLSearchParams, AbortSignal, location:{search:''},
    window:{scrollTo(){}},
    document:{
      querySelector: selector => selector === '#template-status' ? status : {hidden:false},
      addEventListener: (name,callback) => {handlers[name]=callback;},
      body:{append(){}},
      createElement: () => ({
        click() {
          downloads.push(this.download);
          handlers.click({target:{closest:() => null}});
        },
        remove(){}
      })
    },
    URL:{createObjectURL: () => 'blob:practice', revokeObjectURL(){}},
    setTimeout() {},
    fetch: path => {
      if (path === '/api/me') return Promise.reject(new Error('No authenticated session'));
      requests.push(path);
      return response;
    }
  });
  return {click:() => handlers.click({target:{closest:() => button}}), button, requests, downloads, status};
}

test('requests a single XLSX when the button is clicked twice before the response', async () => {
  let resolve;
  const fixture = setup(new Promise(done => {resolve=done;}));
  const pending = fixture.click();
  await fixture.click();
  assert.equal(fixture.button.disabled,true);
  assert.deepEqual(fixture.requests,['/api/modules/3/template']);
  resolve(new Response('spreadsheet',{headers:{'Content-Type':xlsx}}));
  await pending;
  assert.deepEqual(fixture.downloads,['practica-3.xlsx']);
  assert.equal(fixture.button.disabled,false);
});

test('shows a failed request without downloading its error response', async () => {
  const fixture = setup(Promise.resolve(Response.json({error:'La sesión expiró.'},{status:401})));
  await fixture.click();
  assert.equal(fixture.status.textContent,'La sesión expiró.');
  assert.equal(fixture.downloads.length,0);
  assert.equal(fixture.button.disabled,false);
});
