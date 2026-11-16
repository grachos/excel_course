import {randomBytes} from 'node:crypto';
export async function startUnitExam(db,user,moduleId,kind,items) {
 const client=await db.connect();
 try {
  await client.query('BEGIN');
  await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[user.id]);
  let {rows:[row]}=await client.query(
   'SELECT *,clock_timestamp() AS server_now FROM challenges WHERE user_id=$1 AND module=$2 AND kind=$3 AND owner_preview=$4 AND expires>clock_timestamp() ORDER BY expires DESC LIMIT 1',
   [user.id,moduleId,kind,user.is_owner]);
  if(!row) {
   const id=randomBytes(24).toString('hex');
   const minutes=kind==='long'?60:30;
   const result=await client.query(
    "INSERT INTO challenges(id,user_id,module,kind,answers,expires,owner_preview) VALUES($1,$2,$3,$4,$5,clock_timestamp()+($6 * interval '1 minute'),$7) RETURNING *,clock_timestamp() AS server_now",
    [id,user.id,moduleId,kind,JSON.stringify(items),minutes,user.is_owner]);
   row=result.rows[0];
  }
  await client.query('COMMIT');
  return {id:row.id,questions:row.answers.map(q=>({question:q.question,options:q.options.map(o=>o.text)})),
   timing:{expiresAt:row.expires,serverNow:row.server_now}};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
