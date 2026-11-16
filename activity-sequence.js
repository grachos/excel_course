import {partKinds} from './lessons.js';

export function activityBlocks(result, isOwner) {
  const {id,scores,passed} = result;
  const blocks = {};
  const final = id === 8;
  const missing = kind => !Number.isFinite(scores[kind]);

  if (!isOwner && !passed && missing('short')) {
    const firstMissing = partKinds.findIndex(missing);
    if (firstMissing >= 0) {
      const requirement = 'Presenta primero el examen de la parte '+(firstMissing+1)+'.';
      for (const kind of partKinds.slice(firstMissing+1)) blocks[kind] = requirement;
      blocks.practice = 'Para abrir la práctica, '+requirement.charAt(0).toLowerCase()+requirement.slice(1);
      blocks.long = 'Para abrir '+(final?'el examen final':'la evaluación de unidad')+', '+requirement.charAt(0).toLowerCase()+requirement.slice(1);
    }
  }

  if (!isOwner && !blocks.long && missing('practice')) {
    blocks.long = final
      ? 'Aún no has entregado el proyecto final. Sube tu archivo .xlsx en «Manos a la hoja».'
      : 'Primero entrega la práctica para habilitar la evaluación de unidad.';
  } else if (!isOwner && final && !blocks.long && scores.practice < 80) {
    blocks.long = 'El proyecto final aún no alcanza 80/100. Mejora tu archivo y vuelve a entregarlo para habilitar el examen.';
  } else if (isOwner && final && missing('practice')) {
    blocks.long = 'Entrega primero el proyecto final de prueba para abrir el examen.';
  }

  return blocks;
}
