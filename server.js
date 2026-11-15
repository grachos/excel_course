import express from 'express';
import pg from 'pg';
import ExcelJS from 'exceljs';
import multer from 'multer';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import yauzl from 'yauzl';
import {modules} from './course.js';
import {moduleGrade,gradeChecks} from './grading.js';
const app=express(), db=new pg.Pool({connectionString:process.env.DATABASE_URL});
const origin=process.env.APP_ORIGIN;
if(!origin||!process.env.DATABASE_URL) throw Error('Configure APP_ORIGIN and DATABASE_URL');
app.set('trust proxy',1);
app.use(helmet()); app.use(express.json({limit:'32kb'}));
app.use('/api',rateLimit({windowMs:60000,limit:90}));
app.use((req,res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin!==origin)return res.status(403).json({error:'Origen no permitido'});next();});
await db.query(`CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,tool TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,expires TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS attempts(id SERIAL PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,module INT NOT NULL,kind TEXT NOT NULL,score NUMERIC NOT NULL,feedback JSONB NOT NULL,created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,module INT NOT NULL,kind TEXT NOT NULL,answers JSONB NOT NULL,expires TIMESTAMPTZ NOT NULL);`);
const hash=s=>createHash('sha256').update(s).digest('hex');
const safeUser=u=>({id:u.id,name:u.name,email:u.email,tool:u.tool});
const authLimit=rateLimit({windowMs:15*60000,limit:20});
app.post('/api/auth/:action',authLimit,async(req,res)=>{
 const {action}=req.params;const {email,password,name,tool}=req.body;
 if(!['register','login'].includes(action))return res.sendStatus(404);
 if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||typeof password!=='string'||password.length<10||password.length>128)return res.status(400).json({error:'Usa un correo válido y una contraseña de 10 a 128 caracteres.'});
 let u;
 if(action==='register'){
 if(typeof name!=='string'||!name.trim()||name.length>80||!['excel','sheets'].includes(tool))return res.status(400).json({error:'Completa nombre y herramienta.'});
 const salt=randomBytes(16).toString('hex'), digest=scryptSync(password,salt,64).toString('hex');
 try{u=(await db.query('INSERT INTO users(email,name,password,tool) VALUES($1,$2,$3,$4) RETURNING *',[email.toLowerCase().trim(),name.trim(),salt+':'+digest,tool])).rows[0];}catch(e){if(e.code==='23505')return res.status(409).json({error:'No se pudo registrar ese correo. Intenta iniciar sesión.'});throw e;}
 }else{
 u=(await db.query('SELECT * FROM users WHERE email=$1',[email.toLowerCase().trim()])).rows[0];
 const [salt,digest]=(u?.password||'0000000000000000:'+('0'.repeat(128))).split(':');
 const valid=timingSafeEqual(scryptSync(password,salt,64),Buffer.from(digest,'hex'));
 if(!u||!valid)return res.status(401).json({error:'Correo o contraseña incorrectos.'});
 }
 const token=randomBytes(32).toString('hex');
 await db.query("INSERT INTO sessions VALUES($1,$2,now()+interval '7 days')",[hash(token),u.id]);
 res.cookie('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:604800000,path:'/'});
 res.json(safeUser(u));
});
app.use('/api',async(req,res,next)=>{
 const token=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('session='))?.slice(8);
 if(!token)return res.status(401).json({error:'Inicia sesión.'});
 req.user=(await db.query('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=$1 AND s.expires>now()',[hash(token)])).rows[0];
 if(!req.user)return res.status(401).json({error:'La sesión expiró.'});req.token=token;next();
});
async function state(uid){
 const rows=(await db.query('SELECT module,kind,MAX(score)::float AS score FROM attempts WHERE user_id=$1 GROUP BY module,kind',[uid])).rows;
 return modules.map(m=>{const scores=Object.fromEntries(rows.filter(r=>r.module===m.id).map(r=>[r.kind,r.score]));return {id:m.id,scores,...moduleGrade(scores,m.id)};});
}
app.get('/api/me',async(req,res)=>res.json({user:safeUser(req.user),progress:await state(req.user.id),aiConfigured:!!(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL)}));
app.post('/api/logout',async(req,res)=>{await db.query('DELETE FROM sessions WHERE token=$1',[hash(req.token)]);res.clearCookie('session',{path:'/'});res.json({ok:true});});
app.get('/api/modules',(req,res)=>res.json(modules.map(({questions,checks,...m})=>m)));
app.get('/api/history',async(req,res)=>res.json((await db.query('SELECT id,module,kind,score,feedback,created_at FROM attempts WHERE user_id=$1 ORDER BY id DESC LIMIT 100',[req.user.id])).rows));
app.use('/api/modules/:id',async(req,res,next)=>{
 req.module=modules[Number(req.params.id)-1];
 if(!req.module)return res.sendStatus(404);
 const progress=await state(req.user.id);
 if(progress.slice(0,req.module.id-1).some(p=>!p.passed))return res.status(403).json({error:'Aprueba los módulos anteriores con 80 o más.'});next();
});
async function save(req,kind,report){await db.query('INSERT INTO attempts(user_id,module,kind,score,feedback) VALUES($1,$2,$3,$4,$5)',[req.user.id,req.module.id,kind,report.score,JSON.stringify(report)]);}
app.get('/api/modules/:id/template',async(req,res)=>{
 const w=new ExcelJS.Workbook();const guide=w.addWorksheet('Guía');guide.getCell('A1').value=req.module.title;guide.getCell('A2').value=req.module.task;guide.getColumn(1).width=100;guide.getCell('A2').alignment={wrapText:true};guide.getRow(2).height=100;
 const s=w.addWorksheet('Entrega');for(const c of req.module.checks){s.getCell(c.cell).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE7F4ED'}};}
 for(let i=1;i<=8;i++)s.getColumn(i).width=20;
 res.set('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.set('Content-Disposition','attachment; filename="practica-'+req.module.id+'.xlsx"');res.send(Buffer.from(await w.xlsx.writeBuffer()));
});
function zipSafe(buffer){return new Promise((resolve,reject)=>yauzl.fromBuffer(buffer,{lazyEntries:true},(err,z)=>{
 if(err)return reject(Error('Archivo XLSX inválido.'));
 let total=0,count=0;z.on('error',reject);z.on('entry',e=>{total+=e.uncompressedSize;count++;if(total>20*1024*1024||count>1500||e.generalPurposeBitFlag&1){z.close();return reject(Error('Archivo demasiado complejo o cifrado.'));}z.readEntry();});z.on('end',resolve);z.readEntry();
}));}
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:2*1024*1024,files:1,fields:0}});
app.post('/api/modules/:id/practice',rateLimit({windowMs:60000,limit:5}),upload.single('file'),async(req,res)=>{
 if(!req.file||!req.file.originalname.toLowerCase().endsWith('.xlsx'))return res.status(400).json({error:'Entrega un archivo .xlsx de hasta 2 MB.'});
 let w=new ExcelJS.Workbook();
 try{await zipSafe(req.file.buffer);await w.xlsx.load(req.file.buffer);}catch{return res.status(400).json({error:'No se pudo leer el archivo. Usa un XLSX válido, sin cifrar, de hasta 2 MB y 20 MB descomprimido.'});}
 const sheet=w.getWorksheet('Entrega');if(!sheet)return res.status(400).json({error:'Conserva la hoja llamada Entrega.'});
 const answers={};for(const c of req.module.checks){let v=sheet.getCell(c.cell).value;if(v&&typeof v==='object')v=v.result;answers[c.cell]=v;}
 const report=gradeChecks(req.module.checks,answers); report.mode='rules';report.note='Se verifican resultados guardados. No se recalculan fórmulas ni se califican gráficos o formatos. Si faltan resultados, abre, recalcula y guarda desde Excel o Sheets.';
 if(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL){
 try{
 const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({model:process.env.OPENAI_MODEL,messages:[{role:'system',content:'Eres tutor de hojas de cálculo. Explica en español los hallazgos dados, en máximo 180 palabras. No cambies la nota, no inventes errores ni afirmes revisar fórmulas. Da pistas para un nuevo intento.'},{role:'user',content:JSON.stringify({module:req.module.title,score:report.score,details:report.details})}],max_completion_tokens:500})});
 if(r.ok){const body=await r.json();const reply=body.choices?.[0]?.message?.content;if(reply){report.tutor=reply;report.mode='ai';}}
 }catch{}
 }
 await save(req,'practice',report);res.json(report);
});
app.post('/api/modules/:id/exam',async(req,res)=>{
 const kind=req.body.kind;if(!['short','long'].includes(kind))return res.sendStatus(400);
 const items=req.module.questions.slice(0,kind==='short'?2:4).map(q=>{
 const options=q.options.map((text,i)=>({text,correct:i===q.correct}));for(let i=options.length-1;i>0;i--){const j=randomBytes(1)[0]%(i+1);[options[i],options[j]]=[options[j],options[i]];}return {...q,options};
 });
 const id=randomBytes(24).toString('hex');
 await db.query("DELETE FROM challenges WHERE user_id=$1 AND (expires<now() OR (module=$2 AND kind=$3))",[req.user.id,req.module.id,kind]);
 await db.query("INSERT INTO challenges VALUES($1,$2,$3,$4,$5,now()+interval '30 minutes')",[id,req.user.id,req.module.id,kind,JSON.stringify(items)]);
 res.json({id,questions:items.map(q=>({question:q.question,options:q.options.map(o=>o.text)}))});
});
app.post('/api/modules/:id/exam/submit',async(req,res)=>{
 const {id,answers}=req.body;if(typeof id!=='string'||!Array.isArray(answers))return res.sendStatus(400);
 const row=(await db.query('DELETE FROM challenges WHERE id=$1 AND user_id=$2 AND module=$3 AND expires>now() RETURNING *',[id,req.user.id,req.module.id])).rows[0];
 if(!row)return res.status(400).json({error:'Intento vencido o ya entregado. Inicia otro.'});
 const details=row.answers.map((q,i)=>({question:q.question,ok:q.options[answers[i]]?.correct===true,message:q.explanation}));
 const report={score:100*details.filter(d=>d.ok).length/details.length,details};
 // The final long evaluation incorporates the submitted project, so passing requires both.
 if(req.module.id===8&&row.kind==='long'){
 const p=(await state(req.user.id))[7].scores.practice;
 if(!Number.isFinite(p)){return res.status(400).json({error:'Entrega primero el proyecto final y vuelve a iniciar el examen.'});}
 report.score=Math.min(report.score,p);
 }
 await save(req,row.kind,report);res.json(report);
});
app.get('/health',(req,res)=>res.json({ok:true}));
app.use(express.static('public'));
app.use((err,req,res,next)=>{console.error(err.name,err.code||'request_failed');res.status(err instanceof multer.MulterError?400:500).json({error:err instanceof multer.MulterError?'El archivo supera los límites permitidos.':'No pudimos completar la solicitud. Intenta nuevamente.'});});
app.listen(process.env.PORT||3000,'0.0.0.0');
