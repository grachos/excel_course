export function moduleGrade(scores, id) {
 const p=scores.practice, q=scores.short, e=scores.long;
 if (![p,q,e].every(Number.isFinite)) return {score:null,passed:false};
 const unitScore=id===8 ? Math.min(p,e) : e;
 const score=p*.3+q*.2+unitScore*.5;
 return {score:Math.round(score*100)/100,passed:score>=80&&(id!==8||(e>=80&&p>=80))};
}
export function gradeChecks(checks, answers) {
 const details=checks.map(c=>{const actual=answers[c.cell]; const ok=typeof c.expected==='number'? typeof actual==='number'&&Math.abs(actual-c.expected)<=.01:String(actual??'').trim().toLocaleLowerCase()===String(c.expected).toLocaleLowerCase();return {cell:c.cell,ok,points:ok?c.points:0,max:c.points,message:ok?'Resultado correcto.':c.hint};});
 return {score:details.reduce((s,d)=>s+d.points,0),details};
}

export function includePartAverage(scores, partKinds) {
 const partScores = partKinds.map(kind => scores[kind]);
 if (!partScores.every(Number.isFinite)) return scores;
 const average = partScores.reduce((total, score) => total + score, 0) / partScores.length;
 return {...scores, short: Math.max(scores.short ?? 0, average)};
}
