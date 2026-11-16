import {sheetAt, columnAt} from './demo-sheet.mjs';

const safe = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let demosRequest;
function loadDemos() {
  demosRequest ??= fetch('/demos.json').then(response => {
    if (!response.ok) throw new Error('No pudimos cargar el ejemplo visual.');
    return response.json();
  }).catch(error => {demosRequest = undefined; throw error;});
  return demosRequest;
}

export async function mountCourseDemo(container, id) {
  const demo = (await loadDemos()).find(example => example.id === id);
  if (!container.isConnected || !demo) return;
  let index = 0;
  let timer = null;

  container.innerHTML = '<h2>Ejemplo visual</h2><h3>' + safe(demo.title) + '</h3>' +
    '<div class="demo-action"></div><div class="demo-board"></div>' +
    '<p class="demo-explanation" aria-live="polite"></p>' +
    '<div class="demo-controls"><button type="button" data-demo="previous">Anterior</button>' +
    '<button type="button" class="primary" data-demo="play">Reproducir</button>' +
    '<button type="button" data-demo="next">Siguiente</button>' +
    '<a class="button" href="/media/modulo-' + id + '.gif" download>Descargar GIF</a></div>';

  const playButton = container.querySelector('[data-demo=play]');
  const previous = container.querySelector('[data-demo=previous]');
  const next = container.querySelector('[data-demo=next]');
  function render() {
    const step = demo.steps[index];
    const cells = sheetAt(demo, index);
    const header = demo.headers.map((_,i) => '<th scope="col">' + columnAt(i) + '</th>').join('');
    const rows = cells.map((row, i) => {
      const rowNumber = i + 1;
      if (step.hidden.includes(rowNumber)) return '';
      return '<tr><th scope="row">' + rowNumber + '</th>' + demo.headers.map((_,column) => {
        const address = columnAt(column) + rowNumber;
        const classes = [address === step.cell ? 'demo-highlight' : '', i === 0 ? 'demo-sheet-header' : ''].join(' ');
        return '<td class="' + classes + '">' + safe(row[column]) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    const largest = Math.max(...step.bars.map(([,value]) => value), 1);
    const chart = step.bars.length ? '<div class="demo-chart" aria-label="Comparación por categoría">' +
      step.bars.map(([name,value]) => '<div><span>' + safe(name) + '</span><meter min="0" max="' + largest +
      '" value="' + value + '" aria-label="' + safe(name) + '"></meter><strong>' + value + '</strong></div>').join('') + '</div>' : '';
    container.querySelector('.demo-action').innerHTML = '<strong>' + safe(step.cell) + '</strong><code>' + safe(step.action) + '</code>';
    container.querySelector('.demo-board').innerHTML = '<table aria-label="Hoja de cálculo del ejemplo"><thead><tr><th></th>' +
      header + '</tr></thead><tbody>' + rows + '</tbody></table>' + chart;
    container.querySelector('.demo-explanation').textContent = 'Paso ' + (index + 1) + ' de ' + demo.steps.length + '. ' + step.note;
    previous.disabled = index === 0;
    next.disabled = index === demo.steps.length - 1;
    playButton.textContent = timer ? 'Pausar' : index === demo.steps.length - 1 ? 'Repetir' : 'Reproducir';
  }

  function pause() {
    clearInterval(timer);
    timer = null;
  }
  container.addEventListener('click', event => {
    const action = event.target.closest('[data-demo]')?.dataset.demo;
    if (!action) return;
    if (action === 'play' && !timer) {
      if (index === demo.steps.length - 1) index = 0;
      timer = setInterval(() => {
        if (!container.isConnected || container.closest('[hidden]')) {
          pause();
          render();
          return;
        }
        index += 1;
        if (index === demo.steps.length - 1) pause();
        render();
      }, 4300);
    } else {
      pause();
      if (action === 'previous') index = Math.max(0, index - 1);
      if (action === 'next') index = Math.min(demo.steps.length - 1, index + 1);
    }
    render();
  });
  render();
}
