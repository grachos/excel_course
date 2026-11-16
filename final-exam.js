import {randomBytes} from 'node:crypto';

export const MAX_FINAL_ATTEMPTS = 3;
export const FINAL_DURATION_MS = 60 * 60 * 1000;
export const FINAL_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const finalExamSchema = `
CREATE TABLE IF NOT EXISTS final_exam_sessions(
  sequence BIGSERIAL PRIMARY KEY,
  id TEXT UNIQUE NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_preview BOOLEAN NOT NULL,
  attempt_number SMALLINT NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  questions JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS final_exam_sessions_user_sequence
  ON final_exam_sessions(user_id,owner_preview,sequence DESC);
`;

function after(date,duration) {
  return new Date(date.getTime()+duration);
}

async function withUserLock(db,user,operation) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Serialize starts and submissions for this account across browser tabs and instances.
    await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
    const {rows:[{current_time}]} = await client.query('SELECT clock_timestamp() AS current_time');
    const result = await operation(client,current_time);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function resume(row,now) {
  return {
    status:200,
    body:{
      id:row.id, questions:row.questions.map(({question,options}) => ({question,options:options.map(option=>option.text)})),
      final:{attempt:row.attempt_number,maxAttempts:MAX_FINAL_ATTEMPTS,expiresAt:row.expires_at,serverNow:now}
    }
  };
}

export function startFinalExam(db,user,questions) {
  return withUserLock(db,user,async (client,now) => {
    const {rows:[last]} = await client.query(
      `SELECT id,attempt_number,questions,expires_at,finished_at FROM final_exam_sessions
       WHERE user_id=$1 AND owner_preview=$2 ORDER BY sequence DESC LIMIT 1`,
      [user.id,user.is_owner]
    );
    if (last && !last.finished_at && last.expires_at > now) return resume(last,now);
    if (last?.attempt_number === MAX_FINAL_ATTEMPTS) {
      const availableAt = after(last.finished_at ?? last.expires_at,FINAL_COOLDOWN_MS);
      if (availableAt > now) {
        return {status:429,body:{error:'Usaste los tres intentos. El examen vuelve a estar disponible después de 24 horas.',availableAt}};
      }
    }
    const attemptNumber = !last || last.attempt_number === MAX_FINAL_ATTEMPTS ? 1 : last.attempt_number + 1;
    const {rows:[created]} = await client.query(
      `INSERT INTO final_exam_sessions(id,user_id,owner_preview,attempt_number,questions,expires_at)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING id,attempt_number,questions,expires_at`,
      ['final-'+randomBytes(24).toString('hex'),user.id,user.is_owner,attemptNumber,JSON.stringify(questions),after(now,FINAL_DURATION_MS)]
    );
    return resume(created,now);
  });
}

export function finishFinalExam(db,user,id,answers,saveReport) {
  return withUserLock(db,user,async (client,now) => {
    const {rows:[exam]} = await client.query(
      'SELECT questions,expires_at,finished_at,attempt_number FROM final_exam_sessions WHERE id=$1 AND user_id=$2 AND owner_preview=$3',
      [id,user.id,user.is_owner]
    );
    if (!exam || exam.finished_at || exam.expires_at <= now) {
      return {status:400,body:{error:'Este intento ya terminó o se agotó la hora. Consulta si puedes iniciar otro.'}};
    }
    if (answers.length !== exam.questions.length ||
        answers.some((answer,index) => answer < 0 || answer >= exam.questions[index].options.length)) {
      return {status:400,body:{error:'Selecciona una respuesta válida para cada pregunta.'}};
    }
    const availableAt = exam.attempt_number === MAX_FINAL_ATTEMPTS ? after(now,FINAL_COOLDOWN_MS) : null;
    const report = await saveReport(client,exam.questions,{attempt:exam.attempt_number,maxAttempts:MAX_FINAL_ATTEMPTS,availableAt});
    if (!report) return {status:400,body:{error:'Entrega el proyecto final antes de presentar el examen.'}};
    await client.query('UPDATE final_exam_sessions SET finished_at=$2 WHERE id=$1',[id,now]);
    return {status:200,body:report};
  });
}
