import {partKinds} from './lessons.js';

export function activityBlocks(result, isOwner = false) {
  const {id,scores} = result;
  const blocks = {};
  const final = id === 8;
  const missing = kind => !Number.isFinite(scores[kind]);
  const firstMissing = partKinds.findIndex(missing);

  // Reviewing materials as owner does not waive assessment prerequisites.
  if (firstMissing >= 0 && !isOwner) {
    const requirement = 'Presenta primero el examen de la parte '+(firstMissing+1)+'.';
    for (const kind of partKinds.slice(firstMissing+1)) blocks[kind] = requirement;
    blocks.practice = 'Para abrir la práctica, '+requirement.charAt(0).toLowerCase()+requirement.slice(1);
  }
  const pending = partKinds.filter(missing).map(kind => 'examen de la parte '+kind.split(':')[1]);
  if (missing('practice')) pending.push(final ? 'entrega del proyecto final' : 'entrega de la práctica');
  if (pending.length) {
    blocks.long = 'Examen bloqueado. Completa primero: '+pending.join(', ')+'.';
  } else if (final && scores.practice < 80) {
    blocks.long = 'El proyecto final aún no alcanza 80/100. Mejora tu archivo y vuelve a entregarlo para habilitar el examen.';
  }
  return blocks;
}
