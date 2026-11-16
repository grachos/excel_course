import {randomInt} from 'node:crypto';

export function shuffle(list) {
  for (let i=list.length-1;i>0;i--) {
    const j=randomInt(i+1);
    [list[i],list[j]]=[list[j],list[i]];
  }
  return list;
}

// Balance correct positions within each option-count group, then randomize
// assignments. Store this exact order with the attempt for reliable grading.
export function prepareQuestions(bank) {
  const groups=new Map();
  for (const question of bank) {
    const size=question.options.length;
    if (!groups.has(size)) groups.set(size,[]);
    groups.get(size).push(question);
  }
  const positions=new Map();
  for (const [size,questions] of groups) {
    const cycle=shuffle(Array.from({length:size},(_,i)=>i));
    const targets=shuffle(questions.map((_,i)=>cycle[i%size]));
    questions.forEach((question,i)=>positions.set(question,targets[i]));
  }
  return bank.map(question=>{
    const options=shuffle(question.options.map((text,index)=>({text,correct:index===question.correct})));
    const from=options.findIndex(option=>option.correct);
    const to=positions.get(question);
    [options[from],options[to]]=[options[to],options[from]];
    return {question:question.question,explanation:question.explanation,options};
  });
}
