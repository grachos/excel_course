export function moduleGrade(scores, id) {
 const p=scores.practice, q=scores.short, e=scores.long;
 if (![p,q,e].every(Number.isFinite)) return {score:null,passed:false};
 const score=p*.3+q*.2+e*.5;
 return {score:Math.round(score*100)/100,passed:score>=80&&(id!==8||e>=80)};
}
export function gradeChecks(checks, answers) {
 const details=checks.map(c=>{const actual=answers[c.cell]; const ok=typeof c.expected==='number'? typeof actual==='number'&&Math.abs(actual-c.expected)<=.01:String(actual??'').trim().toLocaleLowerCase()===String(c.expected).toLocaleLowerCase();return {cell:c.cell,ok,points:ok?c.points:0,max:c.points,message:ok?'Resultado correcto.':c.hint};});
 return {score:details.reduce((s,d)=>s+d.points,0),details};
}
