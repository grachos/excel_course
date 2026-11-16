const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let user,progress=[],modules=[],current,register=false;
let ownerAccess = false;
let ownerSetup = false;
let activationRequested = new URLSearchParams(location.search).get('activar') === 'dueno';
async function api(path,options={}){const r=await fetch('/api'+path,{...options,headers:options.body instanceof FormData?{}:{'Content-Type':'application/json'}});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo completar la solicitud.');return data;}
function error(e){$('#notice').className='error';$('#notice').textContent=e.message;}
function view(id){for(const s of ['auth','dashboard','lesson','history','owner'])$('#'+s).hidden=s!==id;$('#notice').textContent='';window.scrollTo(0,0);}
async function refresh(){const r=await api('/me');user=r.user;progress=r.progress;ownerAccess=r.isOwner;ownerSetup=r.ownerSetupAvailable;$('#nav-owner').hidden=!ownerAccess;$('#identity').textContent=user.name+' · '+(user.tool==='excel'?'Excel Online':'Google Sheets');$('#logout').hidden=false;return r;}
async function dashboard(){
 try{await refresh();modules=await api('/modules');if(activationRequested&&(ownerAccess||ownerSetup)){activationRequested=false;return ownerAccess?showStudents():showOwnerSetup();}view('dashboard');if(ownerAccess)return showReviewModules();const passed=progress.filter(p=>p.passed).length;const next=modules.find(m=>!progress[m.id-1].passed);
 $('#dashboard').innerHTML='<div class="intro"><p class="eyebrow">TU RUTA · 8 SEMANAS</p><h1>Un paso más cerca,<br><em>'+esc(user.name.split(' ')[0])+'.</em></h1><p>Aprende a tu ritmo. Practica con propósito.</p></div><div class="hero"><span class="pill">EXCEL ONLINE & GOOGLE SHEETS</span><h2>'+(next?'De entender una fórmula<br>a resolver un problema.':'¡Completaste los ocho módulos!')+'</h2><p>'+(next?'Tu próxima parada: '+esc(next.title):'Todos los módulos aprobados con al menos 80/100.')+'</p>'+(next?'<button class="primary" data-module="'+next.id+'">Continuar mi aprendizaje →</button>':'')+'</div><div class="stats"><div class="card"><strong>'+passed+'/8</strong><span>Módulos aprobados</span></div><div class="card"><strong>60 min</strong><span>Dedicación semanal</span></div><div class="card"><strong>80/100</strong><span>Meta por módulo</span></div></div><div class="row"><h2>Tu camino de aprendizaje</h2><span class="muted">De lo básico a tu primer tablero</span></div><progress max="8" value="'+passed+'" aria-label="Módulos aprobados"></progress><p class="muted">30% práctica · 20% examen corto · 50% evaluación de unidad. Proyecto final: mínimo 80.</p><div class="grid">'+modules.map((m,i)=>{const p=progress[i],locked=progress.slice(0,i).some(x=>!x.passed);return '<article class="card module '+(locked?'locked':'')+'"><div class="row"><span class="number">MÓDULO 0'+m.id+'</span><span class="pill">'+(p.passed?'✓ Aprobado':locked?'Bloqueado':m.level)+'</span></div><h3>'+esc(m.title)+'</h3><p>'+esc(m.goal)+'</p><span class="muted">'+(p.score===null?'Sin calificación completa':p.score+'/100')+' · 1 hora</span><button data-module="'+m.id+'" '+(locked?'disabled':'')+'>'+(p.passed?'Repasar módulo':'Abrir módulo →')+'</button></article>';}).join('')+'</div>';
 }catch(e){error(e);}
}
function showReviewModules() {
  $('#dashboard').innerHTML = '<div class="intro"><h1>Revisar el curso</h1>' +
    '<p>Abre cualquiera de los ocho módulos y prueba sus actividades. Tus resultados de prueba aparecen en Mis resultados y quedan fuera de los reportes de alumnos.</p></div>' +
    '<div class="grid">' + modules.map(module => '<article class="card module"><span class="number">MÓDULO ' +
    module.id + ' · ' + esc(module.level) + '</span><h3>' + esc(module.title) + '</h3><p>' + esc(module.goal) +
    '</p><button data-module="' + module.id + '">Abrir módulo →</button></article>').join('') + '</div>';
}
function lesson(id){
 current=modules.find(m=>m.id===id);view('lesson');const m=current,p=progress[id-1];
 $('#lesson').innerHTML='<button id="back">← '+(ownerAccess?'Revisar el curso':'Mi curso')+'</button><div class="lesson-body">'+(ownerAccess?'<p class="pill">Modo de revisión · Resultado de prueba</p>':'')+'<p class="eyebrow">MÓDULO '+m.id+' · '+esc(m.level)+'</p><h1>'+esc(m.title)+'</h1><p>'+esc(m.goal)+'</p><span class="pill">'+(user.tool==='excel'?'Ruta Excel Online':'Ruta Google Sheets')+'</span><div class="card"><h2>01 · Comprende y prueba</h2>'+m.guide.map(t=>'<p>'+esc(t)+'</p>').join('')+'<p class="muted">Distribución sugerida: 5 min objetivo, 10 min ejemplo, 15 min práctica, 5 min examen corto, 20 min evaluación y 5 min repaso.</p></div><div class="card"><h2>02 · Manos a la hoja</h2><p>'+esc(m.task)+'</p><p>'+(user.tool==='excel'?'Descarga la plantilla, ábrela en Excel Online y guarda una copia XLSX después de recalcular.':'Descarga la plantilla e impórtala en Google Sheets. Al terminar usa Archivo → Descargar → Microsoft Excel (.xlsx).')+'</p><a class="button primary" href="/api/modules/'+m.id+'/template">↓ Descargar plantilla</a><form id="practice"><label>Entrega tu práctica · XLSX, máximo 2 MB<input type="file" name="file" accept=".xlsx" required></label><button class="primary">Revisar mi práctica</button></form><p class="muted">Revisión inicial de resultados guardados. Gráficos, formato y procedimiento requieren revisión adicional. La IA explica los hallazgos si está configurada; de lo contrario se muestran correcciones por reglas.</p><div id="practice-report"></div></div><div class="card"><h2>03 · Demuestra lo aprendido</h2><p>Examen corto: 2 preguntas. Evaluación de unidad: 4 preguntas. Banco inicial; se ampliará antes del lanzamiento.</p><button data-exam="short">Examen corto · 20%</button> <button data-exam="long">Evaluación de unidad · 50%</button><p class="muted">Práctica: '+(p.scores.practice??'—')+' · Corto: '+(p.scores.short??'—')+' · Unidad: '+(p.scores.long??'—')+'</p><div id="exam"></div></div></div>';
}
function reportHTML(r){return '<div class="feedback"><h3>'+r.score+'/100 · '+(r.score>=80?'Meta alcanzada':'Sigue practicando')+'</h3>'+(r.mode?'<span class="pill">'+(r.mode==='ai'?'Explicación con IA':'Corrección automática por reglas')+'</span>':'')+r.details.map(d=>'<p class="'+(d.ok?'good':'bad')+'">'+(d.ok?'✓ ':'↳ ')+esc(d.cell||d.question)+': '+esc(d.message)+'</p>').join('')+(r.tutor?'<p>'+esc(r.tutor)+'</p>':'')+(r.note?'<p class="muted">'+esc(r.note)+'</p>':'')+'</div>';}
const activityName = {practice:'Práctica', short:'Examen corto', long:'Evaluación de unidad'};
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
      esc(activityName[attempt.kind]) + ' · ' + attempt.score + '/100 <span class="muted">' +
      esc(dateText(attempt.created_at)) + '</span></summary>' + reportHTML(attempt.feedback) + '</details>'
    ).join('') || (append ? '' : '<p>Todavía no hay entregas.</p>'));
    $('#owner-attempt-next').innerHTML = next ? '<button data-attempt-student="' + id +
      '" data-attempt-page="' + next + '">Cargar más intentos</button>' : '';
  } catch (err) { error(err); }
}

document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
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
 if(b.id==='nav-history'){if(!user)return view('auth');try{const rows=await api('/history');view('history');$('#history').innerHTML=(ownerAccess?'<h1>Resultados de tus pruebas</h1>':'<h1>Tu progreso, intento a intento.</h1>')+(rows.length?rows.map(r=>'<article class="card"><span class="pill">Módulo '+r.module+' · '+esc({practice:'Práctica',short:'Examen corto',long:'Evaluación de unidad'}[r.kind])+'</span><p class="muted">'+esc(new Date(r.created_at).toLocaleString('es-CO'))+'</p>'+reportHTML(r.feedback)+'</article>').join(''):'<p>Tus resultados aparecerán después de entregar tu primera actividad.</p>');}catch(e){error(e);}}
 if(b.dataset.exam){b.disabled=true;try{const data=await api('/modules/'+current.id+'/exam',{method:'POST',body:JSON.stringify({kind:b.dataset.exam})});$('#exam').innerHTML='<form id="exam-form" data-id="'+data.id+'">'+data.questions.map((q,i)=>'<fieldset><legend>'+esc(q.question)+'</legend>'+q.options.map((o,j)=>'<label><input type="radio" name="q'+i+'" value="'+j+'" required>'+esc(o)+'</label>').join('')+'</fieldset>').join('')+'<button class="primary">Entregar respuestas</button></form>';$('#exam-form').dataset.count=data.questions.length;}catch(e){error(e);}finally{b.disabled=false;}}
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
 if(form.id==='practice'){const r=await api('/modules/'+current.id+'/practice',{method:'POST',body:new FormData(form)});$('#practice-report').innerHTML=reportHTML(r);await refresh();}
 if(form.id==='exam-form'){const data=new FormData(form);const answers=Array.from({length:Number(form.dataset.count)},(_,i)=>Number(data.get('q'+i)));const r=await api('/modules/'+current.id+'/exam/submit',{method:'POST',body:JSON.stringify({id:form.dataset.id,answers})});$('#exam').innerHTML=reportHTML(r);await refresh();}
 }catch(e){error(e);}finally{btn.disabled=false;}
});
(async()=>{try{await refresh();await dashboard();}catch(e){view('auth');}})();
