export async function migrateUnitAttempts(db) {
 const client=await db.connect();
 try {
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(61984722)");
  await client.query("CREATE TABLE IF NOT EXISTS course_migrations(name TEXT PRIMARY KEY)");
  const done=await client.query("SELECT 1 FROM course_migrations WHERE name='unit-attempts-v1'");
  if(!done.rowCount) {
   await client.query(`
    WITH recent AS (
     SELECT id,user_id,module,owner_preview,created_at,
       row_number() OVER(PARTITION BY user_id,module,owner_preview ORDER BY id DESC) AS position
     FROM attempts WHERE kind='long' AND module BETWEEN 1 AND 7
       AND created_at>clock_timestamp()-interval '24 hours'
    ), numbered AS (
     SELECT *,row_number() OVER(PARTITION BY user_id,module,owner_preview ORDER BY id) AS attempt_number
     FROM recent WHERE position<=3
    )
    INSERT INTO final_exam_sessions(id,user_id,module,owner_preview,attempt_number,questions,expires_at,finished_at)
    SELECT 'unit-history-'||id,user_id,module,owner_preview,attempt_number,'[]'::jsonb,created_at,created_at
    FROM numbered ORDER BY id ON CONFLICT(id) DO NOTHING
   `);
   await client.query("INSERT INTO course_migrations(name) VALUES('unit-attempts-v1')");
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
