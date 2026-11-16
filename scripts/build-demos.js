import {mkdir, readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {join} from 'node:path';
import sharp from 'sharp';
import {sheetAt, columnAt} from '../public/demo-sheet.mjs';

const width = 1040;
const height = 540;
const items = JSON.parse(await readFile(new URL('../public/demos.json', import.meta.url)));
const escapeXml = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text = (x,y,value,size = 20,fill = '#203b34',weight = 400) =>
  '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+fill+'" font-weight="'+weight+'">'+escapeXml(value)+'</text>';
const rect = (x,y,w,h,fill,stroke = 'none') =>
  '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'"/>';

function wrap(value, maxLength) {
  return value.split(' ').reduce((lines, word) => {
    const last = lines.length - 1;
    if ((lines[last] + ' ' + word).length > maxLength) lines.push(word);
    else lines[last] += (lines[last] ? ' ' : '') + word;
    return lines;
  }, ['']);
}

function trendChart(series,max) {
  const coords = series.map(([name,value],i) => ({x:140+i*250,y:399-value/max*49,name,value}));
  const line = '<polyline points="'+coords.map(({x,y})=>x+','+y).join(' ')+'" fill="none" stroke="#387d56" stroke-width="3"/>';
  return line + coords.map(({x,y,name,value}) =>
    '<circle cx="'+x+'" cy="'+y+'" r="4" fill="#387d56"/>'+text(x+8,y-8,value,16)+text(x-18,409,name,16)
  ).join('');
}

function frame(demo, index) {
  const step = demo.steps[index];
  const colWidth = Math.floor(920 / demo.headers.length);
  const label = text(38,42,'CELDA / MÓDULO '+demo.id+' / PARTE '+demo.part,18,'#297450',700);
  const title = text(38,85,demo.title,33,'#203b34',700);
  const action = rect(38,111,963,52,'#e2f1e6') + text(53,143,step.cell,22,'#216844',700) +
    text(135,143,step.action,21);
  const presentRows = sheetAt(demo,index).map((cells,row) => ({cells,number:row+1}))
    .filter(({number}) => !step.hidden.includes(number));
  const grid = [
    ...demo.headers.map((_,column) => {
      const x=81+column*colWidth;
      return rect(x,181,colWidth,30,'#edf3ee','#cedbd0')+text(x+12,203,columnAt(column),15,'#486257',700);
    }),
    ...presentRows.map(({cells,number},visible) => {
      const y=211+visible*34;
      return rect(38,y,43,34,'#edf3ee','#cedbd0')+text(50,y+23,number,16,'#486257') +
        demo.headers.map((_,column) => {
          const x=81+column*colWidth;
          const selected=columnAt(column)+number===step.cell;
          return rect(x,y,colWidth,34,selected?'#d5f0dc':number===1?'#edf3ee':'#fff',selected?'#297450':'#cedbd0') +
            text(x+12,y+23,cells[column],17,'#203b34',selected||number===1?700:400);
        }).join('');
    })
  ].join('');
  const max = Math.max(...step.bars.map(([,value]) => value),1);
  const chart = step.chartType === 'line' ? trendChart(step.bars,max) : step.bars.map(([name,value],i) => {
    const y=365+i*28;
    return text(40,y+16,name,17) + rect(125,y,Math.round(380*value/max),18,'#387d56') + text(525,y+16,value,17);
  }).join('');
  const notes = wrap(step.note,88).map((line,i) => text(38,467+i*26,line,20)).join('');
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" font-family="DejaVu Sans, sans-serif">'+
    rect(0,0,width,height,'#f7faf7')+label+title+action+grid+chart+
    text(38,435,'PASO '+(index+1)+' DE '+demo.steps.length,17,'#297450',700)+notes+'</svg>');
}

export async function buildDemos(destination) {
  await mkdir(destination, {recursive:true});
  for (const demo of items) {
    const frames = [];
    for (const [index] of demo.steps.entries()) {
      frames.push(await sharp(frame(demo,index)).png().toBuffer());
    }
    await sharp(frames,{join:{animated:true}}).gif({delay:demo.steps.map(() => 4300),loop:0})
      .toFile(join(destination,'modulo-'+demo.id+'-parte-'+demo.part+'.gif'));
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await buildDemos(fileURLToPath(new URL('../public/media/', import.meta.url)));
}
