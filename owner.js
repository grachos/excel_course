import {createHash, timingSafeEqual} from 'node:crypto';
import {rateLimit} from 'express-rate-limit';
import ExcelJS from 'exceljs';
import {modules} from './course.js';
import {moduleGrade} from './grading.js';

const pageSize = 40;
const activityNames = {practice: 'Práctica', short: 'Examen corto', long: 'Evaluación de unidad'};
const moduleName = id => modules[id - 1]?.title ?? String(id);

export function progressFromScores(rows) {
  return modules.map(({id}) => {
    const scores = Object.fromEntries(rows.filter(row => row.module === id).map(row => [row.kind, row.score]));
    return {id, scores, ...moduleGrade(scores, id)};
  });
}

export async function ownerStatus(db, userId) {
  const {rows: [owner]} = await db.query('SELECT user_id FROM platform_owner WHERE singleton');
  return {isOwner: owner?.user_id === userId, ownerSetupAvailable: !owner && Boolean(process.env.OWNER_SETUP_TOKEN)};
}

const studentsQuery = `
  SELECT id,name,email,tool FROM users
  WHERE id > $1 AND ($2 = '' OR position(lower($2) in lower(name)) > 0 OR position(lower($2) in lower(email)) > 0)
  ORDER BY id LIMIT $3`;
const scoresQuery = `
  SELECT user_id,module,kind,MAX(score)::float AS score,MAX(created_at) AS last_activity
  FROM attempts WHERE user_id = ANY($1::int[])
  GROUP BY user_id,module,kind`;
const attemptsQuery = `
  SELECT id,module,kind,score::float,feedback,created_at FROM attempts
  WHERE user_id=$1 AND ($2::int IS NULL OR id<$2) ORDER BY id DESC LIMIT $3`;

async function summarize(db, users) {
  const {rows} = await db.query(scoresQuery, [users.map(user => user.id)]);
  return users.map(user => {
    const results = rows.filter(row => row.user_id === user.id);
    const progress = progressFromScores(results);
    const lastActivity = results.reduce((latest, {last_activity}) =>
      !latest || last_activity > latest ? last_activity : latest, null);
    return {...user, progress, approved: progress.filter(module => module.passed).length, lastActivity};
  });
}

const cursor = value => typeof value === 'string' && /^[1-9][0-9]{0,9}$/.test(value) &&
  Number(value) <= 2147483647 ? Number(value) : null;

function reportSheet(workbook, name, columns) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns.map(([header, width]) => ({header, width}));
  return sheet;
}

const progressColumns = [
  ['Nombre', 28], ['Correo', 35], ['Herramienta', 20], ['Módulos aprobados', 23], ['Última actividad UTC', 27],
  ...modules.map(({id}) => ['Módulo ' + id + ' / 100', 20])
];
function iso(date) {
  return date?.toISOString() ?? '';
}

function addSummary(sheet, student) {
  sheet.addRow([
    student.name, student.email, student.tool === 'excel' ? 'Excel Online' : 'Google Sheets',
    student.approved, iso(student.lastActivity), ...student.progress.map(module => module.score)
  ]).commit();
}

function openReport(res, filename) {
  res.attachment(filename);
  res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return new ExcelJS.stream.xlsx.WorkbookWriter({stream: res});
}

export function mountOwner(app, db) {
  const claimLimit = rateLimit({windowMs: 15 * 60000, limit: 5});
  app.post('/api/owner/claim', claimLimit, async (req, res) => {
    const expected = process.env.OWNER_SETUP_TOKEN;
    const supplied = req.body?.token;
    const digest = value => createHash('sha256').update(value).digest();
    if (!expected || typeof supplied !== 'string' || supplied.length > 256 ||
        !timingSafeEqual(digest(expected), digest(supplied))) {
      return res.status(403).json({error: 'El código de activación no es válido.'});
    }
    const result = await db.query(
      'INSERT INTO platform_owner(user_id) VALUES($1) ON CONFLICT DO NOTHING', [req.user.id]
    );
    if (!result.rowCount) return res.status(409).json({error: 'El acceso de dueño ya fue activado.'});
    res.status(201).json({isOwner: true});
  });

  app.use('/api/owner', async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const {isOwner} = await ownerStatus(db, req.user.id);
    if (!isOwner) return res.status(403).json({error: 'Acceso exclusivo del dueño.'});
    next();
  });

  app.get('/api/owner/students', async (req, res) => {
    const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const {rows} = await db.query(studentsQuery, [cursor(req.query.after) ?? 0, search, pageSize + 1]);
    const users = rows.slice(0, pageSize);
    res.json({students: await summarize(db, users), next: rows.length > pageSize ? users.at(-1).id : null});
  });

  app.get('/api/owner/report.xlsx', rateLimit({windowMs: 60000, limit: 5}), async (req, res) => {
    const workbook = openReport(res, 'celda-avance-general.xlsx');
    const sheet = reportSheet(workbook, 'Avance general', progressColumns);
    const {rows: [{last_id}]} = await db.query('SELECT MAX(id) AS last_id FROM users');
    let after = 0;
    while (after < last_id && !res.destroyed) {
      const {rows} = await db.query(studentsQuery, [after, '', pageSize]);
      if (!rows.length) break;
      for (const student of await summarize(db, rows.filter(row => row.id <= last_id))) addSummary(sheet, student);
      after = rows.at(-1).id;
    }
    if (!res.destroyed) await workbook.commit();
  });

  app.use('/api/owner/students/:id', async (req, res, next) => {
    const {rows: [student]} = await db.query('SELECT id,name,email,tool FROM users WHERE id=$1', [cursor(req.params.id)]);
    if (!student) return res.status(404).json({error: 'No encontramos al alumno.'});
    req.student = student;
    next();
  });

  app.get('/api/owner/students/:id', async (req, res) => {
    const [student] = await summarize(db, [req.student]);
    const {rows} = await db.query(attemptsQuery, [student.id, cursor(req.query.before), pageSize + 1]);
    const attempts = rows.slice(0, pageSize);
    res.json({student, attempts, next: rows.length > pageSize ? attempts.at(-1).id : null});
  });

  app.get('/api/owner/students/:id/report.xlsx', rateLimit({windowMs: 60000, limit: 5}), async (req, res) => {
    const [student] = await summarize(db, [req.student]);
    const workbook = openReport(res, 'celda-informe-alumno-' + student.id + '.xlsx');
    const summary = reportSheet(workbook, 'Alumno', progressColumns);
    addSummary(summary, student);
    summary.commit();
    const progress = reportSheet(workbook, 'Avance por módulo', [
      ['Módulo', 35], ['Práctica', 15], ['Examen corto', 17], ['Evaluación de unidad', 24], ['Nota final', 15], ['Estado', 20]
    ]);
    for (const module of student.progress) {
      progress.addRow([moduleName(module.id), module.scores.practice, module.scores.short, module.scores.long,
        module.score, module.passed ? 'Aprobado' : module.score === null ? 'Pendiente' : 'Por mejorar']).commit();
    }
    progress.commit();
    const attempts = reportSheet(workbook, 'Intentos y correcciones', [
      ['Fecha UTC', 26], ['Módulo', 35], ['Actividad', 25], ['Nota', 12], ['Correcciones', 80], ['Explicación IA', 65]
    ]);
    let before = null;
    while (!res.destroyed) {
      const {rows} = await db.query(attemptsQuery, [student.id, before, pageSize]);
      for (const row of rows) {
        const corrections = (row.feedback?.details ?? []).filter(detail => !detail.ok)
          .map(detail => (detail.cell || detail.question) + ': ' + detail.message).join('\n');
        attempts.addRow([iso(row.created_at), moduleName(row.module), activityNames[row.kind],
          row.score, corrections, row.feedback?.tutor ?? '']).commit();
      }
      if (rows.length < pageSize) break;
      before = rows.at(-1).id;
    }
    if (!res.destroyed) await workbook.commit();
  });
}
