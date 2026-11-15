const defaultModel = 'gpt-6-luna';
export function tutorConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function explainPractice(moduleTitle, details, request = fetch) {
  const issues = details.filter(detail => !detail.ok).map(({cell, message}) => ({cell, message}));
  if (!issues.length || !tutorConfigured()) return null;
  const model = process.env.OPENAI_MODEL?.trim() || defaultModel;
  try {
    const response = await request('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        model,
        ...(model === defaultModel ? {reasoning_effort: 'none'} : {}),
        store: false,
        max_completion_tokens: 140,
        messages: [
          {role: 'system', content: 'Tutor de hojas de cálculo. En español, da una pista breve por celda y un siguiente paso. Usa solo los hallazgos; no inventes errores ni afirmes haber revisado fórmulas. Máximo 60 palabras.'},
          {role: 'user', content: JSON.stringify({module: moduleTitle, issues})}
        ]
      })
    });
    if (!response.ok) {
      console.warn('Tutor API HTTP', response.status);
      return null;
    }
    const {choices} = await response.json();
    const choice = choices?.[0];
    return choice?.finish_reason === 'stop' ? choice.message?.content?.trim() || null : null;
  } catch (error) {
    console.warn('Tutor API unavailable', error.name);
    return null;
  }
}
