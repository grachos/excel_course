import {test} from 'node:test';
import assert from 'node:assert/strict';
import {explainPractice} from '../tutor.js';

test('tutor skips correct work and sends only mistakes with a bounded response', async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = 'test-only';
  delete process.env.OPENAI_MODEL;
  try {
    const correct = {cell:'A1', ok:true, message:'not sent'};
    assert.equal(await explainPractice('Fórmulas', [correct], () => assert.fail('unexpected API call')), null);
    const explanation = await explainPractice('Fórmulas', [correct, {cell:'B2', ok:false, message:'Revisa la referencia.'}],
      async (_url, options) => {
        const body = JSON.parse(options.body);
        assert.equal(body.model,'gpt-6-luna');
        assert.equal(body.reasoning_effort,'none');
        assert.equal(body.store,false);
        assert.equal(body.max_completion_tokens,140);
        assert.deepEqual(JSON.parse(body.messages[1].content).issues, [{cell:'B2',message:'Revisa la referencia.'}]);
        return {ok:true, json:async () => ({choices:[{finish_reason:'stop',message:{content:'Revisa B2.'}}]})};
      });
    assert.equal(explanation,'Revisa B2.');
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
  }
});
