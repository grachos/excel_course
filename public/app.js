const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let user,progress=[],modules=[],current,register=false;
let ownerAccess = false;
let ownerSetup = false;
let aiConfigured = false;
let activationRequested = new URLSearchParams(location.search).get('activar') === 'dueno';
async function api(path, options={}) {
  const response=await fetch('/api'+path,{...options,headers:options.body instanceof FormData?{}:{'Content-Type':'application/json'}});
  const data=await response.json();
  if (!response.ok) {
    const failure=new Error(data.error || 'No se pudo completar la solicitud.');
    failure.availableAt=data.availableAt;
    throw failure;
  }
  return data;
}
function error(e){$('#notice').className='error';$('#notice').textContent=e.message;}
function view(id){for(const s of ['auth','dashboard','lesson','history','owner'])$('#'+s).hidden=s!==id;$('#notice').textContent='';window.scrollTo(0,0);}
async function refresh(){const r=await api('/me');user=r.user;progress=r.progress;ownerAccess=r.isOwner;ownerSetup=r.ownerSetupAvailable;aiConfigured=r.aiConfigured;$('#nav-owner').hidden=!ownerAccess;$('#identity').textContent=user.name+' · '+(user.tool==='excel'?'Excel Online':'Google Sheets');$('#logout').hidden=false;return r;}
async function dashboard(){
 try{await refresh();modules=await api('/modules');if(activationRequested&&(ownerAccess||ownerSetup)){activationRequested=false;return ownerAccess?showStudents():showOwnerSetup();}view('dashboard');if(ownerAccess)return showReviewModules();const passed=progress.filter(p=>p.passed).length;const next=modules.find(m=>!progress[m.id-1].passed);
 $('#dashboard').innerHTML='<div class="intro"><p class="eyebrow">TU RUTA · 8 SEMANAS</p><h1>Un paso más cerca,<br><em>'+esc(user.name.split(' ')[0])+'.</em></h1><p>Aprende a tu ritmo. Practica con propósito.</p></div><div class="hero"><span class="pill">EXCEL ONLINE & GOOGLE SHEETS</span><h2>'+(next?'De entender una fórmula<br>a resolver un problema.':'¡Completaste los ocho módulos!')+'</h2><p>'+(next?'Módulo '+next.id+' · '+esc(next.title)+'. '+esc(studyPlan(next,progress[next.id-1]).summary):'Todos los módulos aprobados con al menos 80/100.')+'</p>'+(next?'<button class="primary" data-module="'+next.id+'">Continuar mi aprendizaje →</button>':'')+'</div><div class="stats"><div class="card"><strong>'+passed+'/8</strong><span>Módulos aprobados</span></div><div class="card"><strong>60 min</strong><span>Dedicación semanal</span></div><div class="card"><strong>80/100</strong><span>Meta por módulo</span></div></div><div class="row"><h2>Tu camino de aprendizaje</h2><span class="muted">De lo básico a tu primer tablero</span></div><progress max="8" value="'+passed+'" aria-label="Módulos aprobados"></progress><p class="muted">30% práctica · 20% nota de partes · 50% evaluación de unidad. Proyecto final: mínimo 80.</p><div class="grid">'+modules.map((m,i)=>{const p=progress[i],prerequisite=progress.slice(0,i).find(x=>!x.passed),locked=Boolean(prerequisite);return '<article class="card module '+(locked?'locked':'')+'"><div class="row"><span class="number">MÓDULO 0'+m.id+'</span><span class="pill">'+(p.passed?'✓ Aprobado':locked?'Bloqueado':m.level)+'</span></div><h3>'+esc(m.title)+'</h3><p>'+esc(m.goal)+'</p>'+(locked?'<p class="muted">Para abrirlo, primero aprueba el módulo '+prerequisite.id+' con 80/100.</p>':'')+'<span class="muted">'+(p.score===null?'Sin calificación completa':p.score+'/100')+' · 1 hora</span><button data-module="'+m.id+'" '+(locked?'disabled':'')+'>'+(p.passed?'Repasar módulo':'Abrir módulo →')+'</button></article>';}).join('')+'</div>';
 }catch(e){error(e);}
}
function showReviewModules() {
  $('#dashboard').innerHTML = '<div class="intro"><h1>Revisar el curso</h1>' +
    '<p>Abre cualquiera de los ocho módulos y prueba sus actividades. Tus resultados de prueba aparecen en Mis resultados y quedan fuera de los reportes de alumnos.</p></div>' +
    '<div class="grid">' + modules.map(module => '<article class="card module"><span class="number">MÓDULO ' +
    module.id + ' · ' + esc(module.level) + '</span><h3>' + esc(module.title) + '</h3><p>' + esc(module.goal) +
    '</p><button data-module="' + module.id + '">Abrir módulo →</button></article>').join('') + '</div>';
}
function platformGuide(module) {
 const steps = module.platformSteps?.[user.tool];
 if (!steps?.length) return '';
 const title = user.tool === 'excel' ? 'Pasos en Excel Online' : 'Pasos en Google Sheets';
 return '<h3>' + title + '</h3><ol>' + steps.map(step => '<li>' + esc(step) + '</li>').join('') + '</ol>';
}
function scoreText(score) {
  return typeof score === 'number' ? score.toLocaleString('es-CO',{maximumFractionDigits:2}) + '/100' : 'Pendiente';
}

function studyPlan(module, result) {
  const {scores, passed}=result;
  const final=module.id===8;
  const practice=final?'proyecto final':'práctica';
  const assessment=final?'examen final':'evaluación de unidad';
  if (passed) {
    return {summary:'Módulo aprobado con '+scoreText(result.score)+'.',items:[]};
  }

  const items=[];
  const add=(title,reason,target)=>items.push({title,reason,target});
  if (!Number.isFinite(scores.practice) && !result.blocks?.practice) {
    add('Entrega tu '+practice+'.',final
      ? 'El examen final se habilita cuando tu proyecto tenga al menos 80/100.'
      : 'La práctica vale el 30 % y es necesaria para calcular la nota del módulo.','lesson-practice');
  } else if (final && scores.practice<80) {
    add('Mejora el proyecto final.','Tu mejor nota es '+scoreText(scores.practice)+'. Necesitas al menos 80/100 en el proyecto.','lesson-practice');
  }

  if (!Number.isFinite(scores.short)) {
    module.parts.forEach((part,index)=>{
      if (!Number.isFinite(scores[part.kind]) && !result.blocks?.[part.kind]) {
        add('Presenta el examen de la parte '+(index+1)+'.',part.title+'. El promedio de las partes vale el 20 %.','lesson-part-'+(index+1));
      }
    });
  }

  if (!Number.isFinite(scores.long)) {
    add(final && !Number.isFinite(scores.practice) ? 'El examen final está pendiente del proyecto.' : 'Presenta '+(final?'el ':'la ')+assessment+'.', final
      ? (result.blocks?.long || 'Dura hasta 60 minutos y necesitas al menos 80/100.')
      : (result.blocks?.long ? result.blocks.long+' ' : '')+'Vale el 50 % del módulo. El contador de 60 minutos se usa en el examen final del módulo 8.','lesson-assessment');
  } else if (final && scores.long<80) {
    add('Repite el examen final.','Tu mejor nota es '+scoreText(scores.long)+'. Consulta tus intentos y la hora de reintento si están agotados.','lesson-assessment');
  }

  if (!items.length) {
    const attempts=[
      {score:scores.long,weight:0.5,title:'Repasa y vuelve a presentar '+(final?'el ':'la ')+assessment+'.',target:'lesson-assessment'},
      {score:scores.practice,weight:0.3,title:'Mejora y vuelve a entregar tu '+practice+'.',target:'lesson-practice'},
      ...module.parts.filter(part=>Number.isFinite(scores[part.kind])).map(part=>({
        score:scores[part.kind],weight:0.2/module.parts.length,title:'Repasa '+part.title+' y repite su examen.',
        target:'lesson-part-'+(module.parts.indexOf(part)+1)
      }))
    ];
    const improve=attempts.reduce((best,attempt)=>
      (100-attempt.score)*attempt.weight>(100-best.score)*best.weight ? attempt : best);
    add(improve.title,'Tu mejor nota en esa actividad es '+scoreText(improve.score)+'.',improve.target);
  }

  const summary=Number.isFinite(result.score)
    ? 'Tu nota del módulo es '+scoreText(result.score)+'. Para aprobar necesitas al menos 80/100.'
    : 'Aún no tienes la nota completa. Revisa lo que te falta.';
  return {summary,items};
}

function renderStudyPlan(module,result) {
  const plan=studyPlan(module,result);
  const passMessage=module.id===8?'Ya completaste este módulo.':'Ya puedes abrir el módulo '+(module.id+1)+' si aprobaste los anteriores.';
  return '<h2>Tu siguiente paso</h2><p>'+esc(plan.summary)+'</p>'+
    (plan.items.length?'<ul class="study-next-list">'+plan.items.map(item=>
      '<li><strong>'+esc(item.title)+'</strong><p>'+esc(item.reason)+'</p>'+
      '<button type="button" data-study-target="'+item.target+'">Ir a la actividad</button></li>').join('')+'</ul>'
      : (ownerAccess ? '' : '<p>'+esc(passMessage)+'</p>'));
}

function controlState(blocks,kind) {
  const reason=blocks?.[kind];
  return {disabled:reason?' disabled':'',reason:reason??''};
}

function renderBlockMessage(kind,reason) {
  return '<p class="activity-block muted" data-block-message="'+kind+'"'+(reason?'':' hidden')+'>'+esc(reason)+'</p>';
}

function renderParts(module, scores, blocks) {
  return module.parts.map((part,index) =>
    '<details class="card lesson-part" id="lesson-part-'+(index+1)+'"' + (index === 0 ? ' open' : '') + '><summary><strong>Parte ' +
    (index + 1) + ' · ' + esc(part.title) + '</strong><span class="pill" data-score-kind="' + part.kind + '">' +
    scoreText(scores[part.kind]) + '</span></summary><p>' + esc(part.lesson) + '</p>' +
    '<div class="lesson-example"><strong>Prueba este ejemplo</strong><p>' + esc(part.example) + '</p></div>' +
    '<section class="course-demo part-demo" data-part-demo="'+(index+1)+'" aria-label="Ejemplo visual de la parte"><p>Cargando ejemplo visual…</p></section>' +
    '<button type="button" data-exam="' + part.kind + '" data-block-kind="'+part.kind+'"'+controlState(blocks,part.kind).disabled+'>Examen de la parte · 3 preguntas</button>' +
    renderBlockMessage(part.kind,controlState(blocks,part.kind).reason) +
    '<div data-quiz="' + part.kind + '"></div></details>'
  ).join('');
}

function officialExamples(module) {
  return '<section class="card"><h2>Ejemplos oficiales</h2><ul class="official-links">' + module.examples.map(example =>
    '<li><a href="' + esc(example.url) + '" target="_blank" rel="noopener noreferrer">' +
    esc(example.platform) + ' · ' + esc(example.title) + ' ↗</a></li>').join('') + '</ul></section>';
}

function lesson(id) {
  current=modules.find(module => module.id===id);
  view('lesson');
  const m=current;
  const result=progress[id-1];
  const scores=result.scores;
  const blocks=result.blocks;
  const practice=controlState(blocks,'practice');
  const assessment=controlState(blocks,'long');
  const final=m.id===8;
  const examTitle=final?'Examen final acumulativo':'Evaluación de unidad';
  const toolGuide=user.tool==='excel'
    ? 'Descarga la plantilla, ábrela en Excel Online y guarda una copia XLSX después de recalcular.'
    : 'Importa la plantilla en Google Sheets. Al terminar, usa Archivo → Descargar → Microsoft Excel (.xlsx).';

  $('#lesson').innerHTML='<button id="back">← '+(ownerAccess?'Revisar el curso':'Mi curso')+'</button>' +
    '<div class="lesson-body">'+(ownerAccess?'<p class="pill">Modo de revisión · Resultado de prueba</p>':'') +
    '<p class="eyebrow">MÓDULO '+m.id+' · '+esc(m.level)+'</p><h1>'+esc(m.title)+'</h1><p>'+esc(m.goal)+'</p>' +
    '<span class="pill">'+(user.tool==='excel'?'Ruta Excel Online':'Ruta Google Sheets')+'</span>' +
    '<p class="muted">En cada parte, revisa el ejemplo visual antes de presentar su examen.</p>' +
    '<section id="study-next" class="card study-next" aria-label="Tu siguiente paso">'+renderStudyPlan(m,result)+'</section>' +
    renderParts(m,scores,blocks)+'<details class="card"><summary>Repaso y referencias rápidas</summary>'+m.guide.map(text=>'<p>'+esc(text)+'</p>').join('')+'</details>'+officialExamples(m) +
    '<section class="card" id="lesson-practice"><h2>Manos a la hoja</h2><p>'+esc(m.task)+'</p>'+platformGuide(m)+'<p>'+esc(toolGuide)+'</p>' +
    '<button type="button" class="primary" data-template="'+m.id+'" data-block-kind="practice"'+practice.disabled+'>↓ Descargar plantilla</button>' +
    renderBlockMessage('practice',practice.reason) +
    '<p id="template-status" class="muted" role="status"></p><form id="practice">' +
    '<label>Entrega tu práctica · XLSX, máximo 2 MB<input type="file" name="file" accept=".xlsx" data-block-kind="practice" required'+practice.disabled+'></label>' +
    '<button class="primary" data-block-kind="practice"'+practice.disabled+'>Revisar mi práctica</button></form>' +
    '<p class="muted">'+esc(m.reviewNote || 'Revisamos los resultados guardados. Los gráficos y el formato requieren revisión adicional.')+'</p>' +
    '<p class="muted">'+(aiConfigured
      ? 'La plataforma verifica el archivo y calcula la nota. Si encuentra errores, el tutor con IA puede explicarte cómo corregirlos.'
      : 'La plataforma verifica el archivo, calcula la nota y te indica qué revisar.')+'</p>' +
    '<div id="practice-report"></div></section>' +
    '<section class="card" id="lesson-assessment"><h2>'+examTitle+'</h2><p>'+m.unitQuestionCount+' preguntas. '+(final
      ? 'Cubre los ocho módulos. Entrega el proyecto primero y alcanza 80 en ambas actividades. Tienes 60 minutos por intento y hasta tres intentos. Después del tercero, espera 24 horas para volver a presentarlo.'
      : 'Aplica lo aprendido en situaciones de la unidad. El reloj de 60 minutos aparece en el examen final del módulo 8.')+'</p>' +
    '<p class="muted">Práctica: 30 % · Promedio de las tres partes: 20 % · '+examTitle+': 50 %.</p>' +
    '<dl class="lesson-scores"><div><dt>Práctica</dt><dd data-score-kind="practice">'+scoreText(scores.practice)+'</dd></div>' +
    '<div><dt>Nota de partes</dt><dd data-score-kind="short">'+scoreText(scores.short)+'</dd></div>' +
    '<div><dt>'+examTitle+'</dt><dd data-score-kind="long">'+scoreText(scores.long)+'</dd></div></dl>' +
    (final ? '<div id="final-clock" class="exam-clock" aria-label="Tiempo del examen final">' +
      '<div><span>Tiempo del examen final</span><strong data-exam-clock-digits role="timer">60:00</strong></div>' +
      '<p data-exam-clock-note>El contador empieza cuando inicias un intento.</p></div>' +
      '<div id="final-status" class="final-timing" aria-label="Estado del examen final"><p role="status">Consultando intentos…</p></div>' : '') +
    '<button type="button" class="primary" data-exam="long" data-block-kind="long"'+(final?' disabled':assessment.disabled)+'>Iniciar '+examTitle.toLowerCase()+'</button>' +
    renderBlockMessage('long',assessment.reason) +
    '<div data-quiz="long"></div></section></div>';

  if (final) syncFinalStatus();
  const demoContainers = [...$('#lesson').querySelectorAll('[data-part-demo]')];
  for (const container of demoContainers) {
    import('/course-demo.js')
      .then(({mountCourseDemo}) => mountCourseDemo(container,id,Number(container.dataset.partDemo)))
      .catch(() => {
        if (container.isConnected) container.textContent='No pudimos cargar el ejemplo visual de esta parte.';
      });
  }
}

async function refreshLessonScores(moduleId) {
  await refresh();
  if (current?.id !== moduleId || $('#lesson').hidden) return;
  const result=progress[moduleId-1];
  const scores=result.scores;
  $('#study-next').innerHTML=renderStudyPlan(current,result);
  $('#lesson').querySelectorAll('[data-block-kind]').forEach(control=>{
    if (moduleId!==8 || control.dataset.blockKind!=='long') {
      control.disabled=Boolean(result.blocks?.[control.dataset.blockKind]);
    }
  });
  $('#lesson').querySelectorAll('[data-block-message]').forEach(message=>{
    const reason=result.blocks?.[message.dataset.blockMessage];
    message.textContent=reason??'';
    message.hidden=!reason;
  });
  $('#lesson').querySelectorAll('[data-score-kind]').forEach(node => {
    node.textContent=scoreText(scores[node.dataset.scoreKind]);
  });
}

function finalAvailableText(value) {
  const date = new Intl.DateTimeFormat('es-CO', {
    dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'
  }).format(new Date(value));
  return 'Podrás volver a presentarlo el '+date+' (hora de Colombia).';
}

function timeRemaining(deadline) {
  const remaining = Math.max(0,Math.ceil((deadline-performance.now())/1000));
  return {remaining,text:String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0')};
}

function renderFinalClock(value, message) {
  const clock = $('#final-clock');
  if (!clock) return;
  clock.querySelector('[data-exam-clock-digits]').textContent=value;
  clock.querySelector('[data-exam-clock-note]').textContent=message;
}

function finalDeadline(instant,serverNow) {
  return performance.now()+Date.parse(instant)-Date.parse(serverNow);
}

let finalStatusInterval;
let finalStatusRequest=0;

async function syncFinalStatus() {
  const panel=$('#final-status');
  const button=$('[data-exam="long"]');
  if (!panel || $('#lesson').hidden) return;
  const request=++finalStatusRequest;
  clearInterval(finalStatusInterval);
  try {
    const final=await api('/modules/8/exam/status');
    if (request!==finalStatusRequest || !panel.isConnected || $('#lesson').hidden) return;
    const prerequisite=progress[7]?.blocks?.long;
    const active=final.status==='active';
    const locked=final.status==='cooldown';
    const examPassed=final.bestExamScore>=80;
    const hasProject=typeof final.projectScore==='number';
    const latest=typeof final.lastExamScore==='number'
      ? 'Última nota: '+scoreText(final.lastExamScore)+'. ' : '';
    let guidance;
    if (examPassed) {
      guidance=final.projectScore>=80 ? 'Ya aprobaste el examen y el proyecto.'
        : 'Ya aprobaste el examen. Mejora el proyecto hasta alcanzar 80/100.';
    } else if (active) {
      guidance='Tu intento sigue en curso. Puedes retomarlo sin gastar otro intento.';
    } else if (locked) {
      guidance='Usaste tus tres intentos sin aprobar. '+finalAvailableText(final.availableAt);
    } else if (final.expiredAt && final.attemptsUsed) {
      guidance='Se agotó el tiempo del último intento. Debes repetir el examen para aprobar.';
    } else if (latest) {
      guidance='Debes repetir el examen y alcanzar al menos 80/100.';
    } else {
      guidance=hasProject ? 'Necesitas 80/100 para aprobar el examen.' : 'Aún no has entregado el proyecto final. Por eso el examen sigue bloqueado. Sube tu archivo .xlsx en «Manos a la hoja».';
    }
    if (prerequisite && !locked && !active) guidance=prerequisite;
    if (examPassed && locked) guidance+=' '+finalAvailableText(final.availableAt);
    panel.innerHTML='<strong>Intentos utilizados: '+final.attemptsUsed+' de '+final.maxAttempts+'</strong>'+
      '<p>Intentos disponibles: '+final.attemptsRemaining+'</p>'+
      '<p role="status">'+esc(latest+guidance)+'</p>';
    button.dataset.locked=String(locked || !hasProject || Boolean(prerequisite));
    button.disabled=button.dataset.locked==='true';
    button.textContent=locked ? 'Examen en espera'
      : prerequisite ? 'Examen final bloqueado'
      : active ? 'Continuar examen final'
      : examPassed ? 'Volver a presentar el examen final'
      : final.attemptsUsed || latest ? 'Reintentar examen final' : 'Iniciar examen final';

    if (active || locked) {
      const deadline=finalDeadline(active?final.expiresAt:final.availableAt,final.serverNow);
      if (locked) renderFinalClock('—','El examen está en espera. Consulta abajo cuándo podrás reintentar.');
      function draw() {
        if (!panel.isConnected || $('#lesson').hidden) {
          clearInterval(finalStatusInterval);
          return;
        }
        const {remaining,text}=timeRemaining(deadline);
        if (active) renderFinalClock(text,'Tiempo restante del intento en curso.');
        if (!remaining) syncFinalStatus();
      }
      finalStatusInterval=setInterval(draw,active?500:1000);
      draw();
    } else {
      if (final.expiredAt && final.attemptsUsed) {
        renderFinalClock('00:00','Se agotó el último intento. El siguiente tendrá 60 minutos.');
      } else {
        renderFinalClock('60:00','El contador empieza cuando inicias un intento.');
      }
    }
  } catch (err) {
    if (request!==finalStatusRequest || !panel.isConnected) return;
    panel.textContent='No pudimos consultar el estado. '+err.message;
    button.dataset.locked=String(Boolean(progress[7]?.blocks?.long));
    button.disabled=button.dataset.locked==='true';
  }
}

function enableFinalTimer(form, final) {
  const deadline = finalDeadline(final.expiresAt,final.serverNow);
  const dock = form.querySelector('[data-final-dock]');
  const display = dock.querySelector('[data-final-timer]');
  const expiredNotice = form.querySelector('[data-final-expired]');
  const draftKey = 'celda-final-' + form.dataset.id;
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) || '{}');
    form.querySelectorAll('input[type=radio]').forEach(input => {
      if (draft[input.name] === input.value) input.checked=true;
    });
  } catch {}
  form.addEventListener('change', () => {
    try { sessionStorage.setItem(draftKey,JSON.stringify(Object.fromEntries(new FormData(form)))); } catch {}
  });
  function draw() {
    if (!form.isConnected || $('#lesson').hidden) return false;
    const {remaining,text} = timeRemaining(deadline);
    display.textContent = text;
    dock.dataset.runningOut = String(remaining <= 300);
    if (!remaining) {
      form.dataset.expired='true';
      expiredNotice.hidden=false;
      form.querySelectorAll('input, button').forEach(control => {control.disabled=true;});
      try { sessionStorage.removeItem(draftKey); } catch {}
    }
    return remaining > 0;
  }
  if (draw()) {
    const timer = setInterval(() => {if (!draw()) clearInterval(timer);},500);
  }
}

async function openQuiz(button) {
  const moduleId=current.id;
  const kind=button.dataset.exam;
  const target=$('[data-quiz="'+kind+'"]');
  button.disabled=true;
  try {
    const data=await api('/modules/'+moduleId+'/exam',{method:'POST',body:JSON.stringify({kind})});
    if(!target?.isConnected)return;
    const header = data.final ? '<div class="exam-clock-dock" data-final-dock aria-label="Reloj del examen final">' +
      '<div><span>Tiempo restante</span><strong data-final-timer role="timer">60:00</strong></div>' +
      '<span>Intento '+data.final.attempt+' de '+data.final.maxAttempts+'</span></div>' +
      '<p class="final-timing" data-final-expired hidden role="status">Se agotó el tiempo. Usa el botón del examen para consultar tu siguiente intento.</p>' : '';
    target.innerHTML='<form class="quiz-form" data-id="'+data.id+'" data-module-id="'+moduleId+'" data-count="'+data.questions.length+'">' + header +
      data.questions.map((q,i)=>'<fieldset><legend>'+ (i+1) +'. '+esc(q.question)+'</legend>' +
        q.options.map((option,j)=>'<label><input type="radio" name="q'+i+'" value="'+j+'" required>'+esc(option)+'</label>').join('')+
      '</fieldset>').join('')+'<button class="primary">Entregar respuestas</button></form>';
    if (data.final) {
      button.textContent = 'Continuar examen final';
      enableFinalTimer(target.querySelector('form'),data.final);
      await syncFinalStatus();
    }
    target.querySelector('input')?.focus();
  } catch(err) {
    if (err.availableAt && target?.isConnected) {
      target.textContent = err.message+' '+finalAvailableText(err.availableAt);
      if(moduleId===8 && kind==='long')await syncFinalStatus();
    } else {
      error(err);
    }
  } finally { button.disabled=button.dataset.locked==='true'; }
}
function reportHTML(r){return '<div class="feedback"><h3>'+scoreText(r.score)+' · '+(r.score>=80?'Meta alcanzada':'Sigue practicando')+'</h3>'+(r.mode?'<span class="pill">'+(r.mode==='ai'?'Explicación con IA':'Corrección automática por reglas')+'</span>':'')+r.details.map(d=>'<p class="'+(d.ok?'good':'bad')+'">'+(d.ok?'✓ ':'↳ ')+esc(d.cell||d.question)+': '+esc(d.message)+(d.correctAnswer&&!d.ok?' Respuesta correcta: '+esc(d.correctAnswer):'')+'</p>').join('')+(r.tutor?'<p>'+esc(r.tutor)+'</p>':'')+(typeof r.examScore==='number'?'<p>Examen: '+scoreText(r.examScore)+' · Proyecto: '+scoreText(r.projectScore)+'</p>':'')+(r.note?'<p class="muted">'+esc(r.note)+'</p>':'')+'</div>';}
const activityNames = {practice:'Práctica',short:'Examen corto',long:'Evaluación de unidad',
  'part:1':'Examen de parte 1','part:2':'Examen de parte 2','part:3':'Examen de parte 3'};
const activityName = (kind,moduleId) => kind==='long'&&moduleId===8 ? 'Examen final acumulativo' : activityNames[kind];
const dateText = value => value ? new Date(value).toLocaleString('es-CO', {timeZone:'America/Bogota'}) : '—';
const moduleTitle = id => modules.find(module => module.id === id)?.title ?? 'Módulo ' + id;

const accountLabel = student => student.active ? 'Activa' : 'Inactiva';

function accountControls(student) {
  const label = accountLabel(student);
  if (student.id === user.id) {
    return '<section class="card account-tools"><h2>Cuenta del dueño</h2><p class="muted">Cuenta protegida.</p></section>';
  }
  const id = student.id;
  return '<section class="card account-tools"><div class="row"><h2>Cuenta del alumno</h2>' +
    '<span class="pill">' + label + '</span></div><div class="grid">' +
    '<form id="student-email" data-target="' + id + '"><label>Correo de ingreso' +
    '<input name="email" type="email" required maxlength="254" value="' + esc(student.email) + '"></label>' +
    '<button>Guardar correo</button></form>' +
    '<form id="student-password" data-target="' + id + '"><label>Nueva contraseña' +
    '<input name="password" type="password" required minlength="10" maxlength="128" autocomplete="new-password"></label>' +
    '<button>Restablecer contraseña</button></form></div>' +
    '<p class="muted">Cambiar el correo o la contraseña cierra las sesiones del alumno.</p>' +
    '<button data-account-target="' + id + '" data-account-next="' + !student.active + '">' +
    (student.active ? 'Inactivar cuenta' : 'Reactivar cuenta') + '</button></section>';
}

function showOwnerSetup() {
  view('owner');
  $('#owner').innerHTML = '<div class="intro"><h1>Activa el acceso de dueño</h1></div>' +
    '<form id="owner-claim" class="card owner-setup"><p>El panel quedará asociado a <strong>' + esc(user.email) +
    '</strong>. Usa el código de activación de Render.</p><label>Código<input name="token" type="password" autocomplete="off" required maxlength="256"></label>' +
    '<button class="primary">Activar acceso</button></form>';
}

async function showStudents(query = '', after = '', append = false) {
  try {
    const params = new URLSearchParams({q:query, after});
    const {students, next} = await api('/owner/students?' + params);
    if (!append) {
      view('owner');
      $('#owner').innerHTML = '<div class="intro"><button id="review-course">Revisar los ocho módulos →</button><div class="row"><h1>Usuarios y avance</h1>' +
        '<a class="button primary" href="/api/owner/report.xlsx">Descargar reporte general (.xlsx)</a></div></div>' +
        '<div class="card"><form id="owner-search" class="row"><label>Buscar por nombre o correo' +
        '<input name="query" type="search" maxlength="100" value="' + esc(query) + '"></label><button>Buscar</button></form>' +
        '<div class="owner-table"><table><thead><tr><th>Alumno</th><th>Herramienta</th><th>Cuenta</th><th>Aprobados</th>' +
        '<th>Última actividad</th><th>Acciones</th></tr></thead><tbody id="student-rows"></tbody></table></div>' +
        '<div id="student-next"></div></div>';
    }
    const rows = students.map(student => '<tr><td><strong>' + esc(student.name) + '</strong><br><span class="muted">' +
      esc(student.email) + '</span></td><td>' + (student.tool === 'excel' ? 'Excel Online' : 'Google Sheets') +
      '</td><td><span class="pill">' + accountLabel(student) + '</span></td><td>' + student.approved + ' / 8</td><td>' + esc(dateText(student.lastActivity)) +
      '</td><td><button data-student="' + student.id + '">Ver cuenta y avance</button></td></tr>');
    $('#student-rows').insertAdjacentHTML('beforeend', rows.join('') ||
      (append ? '' : '<tr><td colspan="6">No hay alumnos que coincidan.</td></tr>'));
    $('#student-next').innerHTML = next ? '<button data-student-page="' + next + '">Cargar más</button>' : '';
  } catch (err) { error(err); }
}

async function showStudent(id, before = '', append = false) {
  try {
    const {student, attempts, next} = await api('/owner/students/' + id + '?before=' + before);
    if (!append) {
      view('owner');
      const rows = student.progress.map(module => '<tr><td>' + esc(moduleTitle(module.id)) + '</td><td>' +
        (module.scores.practice ?? '—') + '</td><td>' + (module.scores.short ?? '—') + '</td><td>' +
        (module.scores.long ?? '—') + '</td><td>' + (module.score ?? '—') + '</td><td>' +
        (module.passed ? 'Aprobado' : module.score === null ? 'Pendiente' : 'Por mejorar') + '</td></tr>');
      $('#owner').innerHTML = '<button id="owner-back">← Alumnos</button><div class="row"><div><h1>' +
        esc(student.name) + '</h1><p>' + esc(student.email) + ' · ' + student.approved +
        ' de 8 módulos aprobados</p></div><a class="button primary" href="/api/owner/students/' + id +
        '/report.xlsx">Descargar informe (.xlsx)</a></div>' + accountControls(student) + '<div class="card owner-table"><table><thead><tr>' +
        '<th>Módulo</th><th>Práctica</th><th>Corto</th><th>Evaluación</th><th>Nota final</th><th>Estado</th>' +
        '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div><h2>Intentos y correcciones</h2>' +
        '<div id="owner-attempts"></div><div id="owner-attempt-next"></div>';
    }
    $('#owner-attempts').insertAdjacentHTML('beforeend', attempts.map(attempt =>
      '<details class="card owner-attempt"><summary>' + esc(moduleTitle(attempt.module)) + ' · ' +
      esc(activityName(attempt.kind,attempt.module)) + ' · ' + attempt.score + '/100 <span class="muted">' +
      esc(dateText(attempt.created_at)) + '</span></summary>' + reportHTML(attempt.feedback) + '</details>'
    ).join('') || (append ? '' : '<p>Todavía no hay entregas.</p>'));
    $('#owner-attempt-next').innerHTML = next ? '<button data-attempt-student="' + id +
      '" data-attempt-page="' + next + '">Cargar más intentos</button>' : '';
  } catch (err) { error(err); }
}

const templateDownloads = new Set();
const templateType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function downloadTemplate(button) {
  const moduleId = button.dataset.template;
  if (templateDownloads.has(moduleId)) return;

  templateDownloads.add(moduleId);
  button.disabled = true;
  const label = button.textContent;
  const status = document.querySelector('#template-status');
  button.textContent = 'Preparando plantilla…';
  status.textContent = '';

  try {
    const response = await fetch('/api/modules/' + moduleId + '/template', {
      cache: 'no-store',
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'No se pudo descargar la plantilla. Intenta nuevamente.');
    }
    if (response.headers.get('content-type')?.split(';')[0] !== templateType) {
      throw new Error('El servidor no devolvió una plantilla de Excel.');
    }
    const file = await response.blob();
    if (!file.size) throw new Error('La plantilla está vacía. Intenta nuevamente.');

    const link = document.createElement('a');
    const url = URL.createObjectURL(file);
    try {
      link.href = url;
      link.download = 'practica-' + moduleId + '.xlsx';
      link.hidden = true;
      document.body.append(link);
      link.click();
      status.textContent = 'Plantilla enviada a las descargas del navegador.';
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  } catch (err) {
    status.textContent = err.name === 'TimeoutError' ? 'La plantilla tardó demasiado. Intenta nuevamente.' : err.message;
  } finally {
    templateDownloads.delete(moduleId);
    button.disabled = false;
    button.textContent = label;
  }
}

document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if (b.dataset.studyTarget) {
   const target=document.getElementById(b.dataset.studyTarget);
   if (target) {
     if (target.tagName==='DETAILS') target.open=true;
     const focus=target.querySelector('summary,h2');
     if (focus) {
       focus.setAttribute('tabindex','-1');
       focus.focus({preventScroll:true});
     }
     target.scrollIntoView({block:'start'});
   }
   return;
 }
 if(b.dataset.template)return downloadTemplate(b);
 if(b.id==='nav-owner'||b.id==='owner-back')await showStudents();
 if(b.dataset.accountTarget){
   const id=b.dataset.accountTarget;
   const active=b.dataset.accountNext==='true';
   if(!active&&!window.confirm('¿Inactivar esta cuenta? Se cerrarán sus sesiones y se conservará su avance.'))return;
   b.disabled=true;
   try{
     await api('/owner/students/'+id,{method:'PATCH',body:JSON.stringify({active})});
     await showStudent(id);
     showAccountSuccess(active?'Cuenta reactivada.':'Cuenta inactivada.');
   }catch(err){error(err);}finally{b.disabled=false;}
 }
 if(b.dataset.student)await showStudent(b.dataset.student);
 if(b.dataset.studentPage||b.dataset.attemptPage){
   b.disabled=true;
   if(b.dataset.studentPage)await showStudents($('#owner-search input').value,b.dataset.studentPage,true);
   else await showStudent(b.dataset.attemptStudent,b.dataset.attemptPage,true);
   b.disabled=false;
 }
 if(b.dataset.module)lesson(Number(b.dataset.module));
 if(b.id==='back'||b.id==='nav-course'||b.id==='review-course'){if(user)await dashboard();else view('auth');}
 if(b.id==='toggle-auth'){register=!register;$('#registration').hidden=!register;$('#auth-form [name=name]').required=register;$('#auth-form .primary').textContent=register?'Crear cuenta':'Ingresar';b.textContent=register?'Ya tengo cuenta':'Soy nuevo · crear cuenta';}
 if(b.id==='logout'){try{await api('/logout',{method:'POST'});location.reload();}catch(e){error(e);}}
 if(b.id==='nav-history'){if(!user)return view('auth');try{const rows=await api('/history');view('history');$('#history').innerHTML=(ownerAccess?'<h1>Resultados de tus pruebas</h1>':'<h1>Tu progreso, intento a intento.</h1>')+(rows.length?rows.map(r=>'<article class="card"><span class="pill">Módulo '+r.module+' · '+esc(activityName(r.kind,r.module))+'</span><p class="muted">'+esc(new Date(r.created_at).toLocaleString('es-CO'))+'</p>'+reportHTML(r.feedback)+'</article>').join(''):'<p>Tus resultados aparecerán después de entregar tu primera actividad.</p>');}catch(e){error(e);}}
 if(b.dataset.exam)await openQuiz(b);
});
function showAccountSuccess(message) {
  $('#notice').className='good';
  $('#notice').textContent=message;
}

document.addEventListener('submit',async e=>{
 e.preventDefault();const form=e.target;const btn=form.querySelector('button');btn.disabled=true;$('#notice').textContent='';
 try{
 if(form.id==='student-email'||form.id==='student-password'){
   const field=form.id==='student-email'?'email':'password';
   const id=form.dataset.target;
   const value=new FormData(form).get(field);
   await api('/owner/students/'+id,{method:'PATCH',body:JSON.stringify({[field]:value})});
   form.reset();
   await showStudent(id);
   showAccountSuccess(field==='email'?'Correo de ingreso guardado.':'Contraseña restablecida.');
 }
 if(form.id==='owner-claim'){
   const token=new FormData(form).get('token').trim();
   await api('/owner/claim',{method:'POST',body:JSON.stringify({token})});
   history.replaceState(null,'','/');
   location.reload();
 }
 if(form.id==='owner-search')await showStudents(new FormData(form).get('query'));
 if(form.id==='auth-form'){const body=Object.fromEntries(new FormData(form));await api('/auth/'+(register?'register':'login'),{method:'POST',body:JSON.stringify(body)});await dashboard();}
 if(form.id==='practice'){
   const moduleId=current.id;
   const target=$('#practice-report');
   const result=await api('/modules/'+moduleId+'/practice',{method:'POST',body:new FormData(form)});
   if(target.isConnected)target.innerHTML=reportHTML(result);
   await refreshLessonScores(moduleId);
   if(moduleId===8)await syncFinalStatus();
 }
 if(form.classList.contains('quiz-form')){
   const data=new FormData(form);
   const target=form.parentElement;
   const moduleId=Number(form.dataset.moduleId);
   const answers=Array.from({length:Number(form.dataset.count)},(_,i)=>Number(data.get('q'+i)));
   const result=await api('/modules/'+moduleId+'/exam/submit',{method:'POST',body:JSON.stringify({id:form.dataset.id,answers})});
   if(form.isConnected) {
     const retry=result.final && result.examScore<80 && (progress[7].scores.long??0)<80
       ? '<p class="final-timing"><strong>Debes repetir el examen.</strong> '+esc(result.final.availableAt
         ? finalAvailableText(result.final.availableAt) : 'Necesitas al menos 80/100 para aprobar.')+'</p>' : '';
     target.innerHTML=reportHTML(result)+retry;
     if (result.final) {
       try { sessionStorage.removeItem('celda-final-'+form.dataset.id); } catch {}
     }
   }
   await refreshLessonScores(moduleId);
   if(result.final)await syncFinalStatus();
 }
 }catch(e){error(e);}finally{btn.disabled=form.dataset.expired==='true';}
});
(async()=>{try{await refresh();await dashboard();}catch(e){view('auth');}})();
