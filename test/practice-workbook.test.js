import {test} from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {modules} from '../course.js';
import {practices} from '../practice-curriculum.js';
import {populatePractice,gradePractice} from '../practice-workbook.js';

function workbook(id) {
 const w=new ExcelJS.Workbook();w.addWorksheet('Guía');
 populatePractice(w,modules[id-1]);return w;
}
test('every template contains data, instructions for all three parts, and no prefilled answers',async()=>{
 for(const module of modules) {
  const w=workbook(module.id);
  assert.equal(practices[module.id-1].steps.length,3);
  assert.ok(w.getWorksheet('Datos').rowCount>=4);
  assert.ok(w.getWorksheet('Guía').rowCount>=3);
  assert.ok(gradePractice(w,module).score<80);
  const loaded=new ExcelJS.Workbook();
  await loaded.xlsx.load(await w.xlsx.writeBuffer());
  assert.ok(loaded.getWorksheet('Datos'));
  assert.ok(loaded.getWorksheet('Entrega'));
 }
});
test('first practice grades a complete table and currency rather than three cells',()=>{
 const w=workbook(1),s=w.getWorksheet('Entrega');
 practices[0].source.forEach((row,i)=>row.forEach((v,j)=>{s.getCell(i+1,j+1).value=v;}));
 s.getCell('E2').value='C3';s.getCell('E3').value='C2:C5';
 for(const c of practices[0].format)s.getCell(c).numFmt='"$"#,##0';
 assert.equal(gradePractice(w,modules[0]).score,100);
 s.getCell('C3').numFmt='General';
 assert.ok(gradePractice(w,modules[0]).score<100);
 s.getCell('A2').value=1;
 assert.ok(gradePractice(w,modules[0]).details.some(d=>d.cell==='A2'&&!d.ok));
});
test('saved correct values alone do not satisfy formula exercises',()=>{
 for(const id of [2,3,5,6,8]) {
  const w=workbook(id),s=w.getWorksheet('Entrega'),module=modules[id-1];
  for(const c of module.checks.filter(c=>!c.type))s.getCell(c.cell).value=c.expected;
  const plain=gradePractice(w,module);
  assert.ok(plain.details.some(d=>!d.ok&&d.message.includes('fórmula')));
  for(const c of module.checks.filter(c=>c.formula)) s.getCell(c.cell).value={formula:'1',result:c.expected};
  assert.ok(gradePractice(w,module).score>plain.score);
 }
});
test('sorting, validation, and filter settings are inspected in the file',async()=>{
 const w=workbook(4),s=w.getWorksheet('Entrega');
 [['ID','Cliente','Importe','Estado'],['P01','Luis',100,'Completado'],['P02','Ana',200,'En proceso'],['P03','Ana',300,'Pendiente'],['P04','Marta',400,'Pendiente']].forEach((row,i)=>row.forEach((v,j)=>{s.getCell(i+1,j+1).value=v;}));
 s.getCell('F2').value=2;s.getCell('F3').value=700;s.autoFilter='A1:D5';
 ['Pendiente','En proceso','Completado'].forEach((v,i)=>s.getCell('H'+(i+2)).value=v);
 for(const r of [2,3,4,5])s.getCell('D'+r).dataValidation={type:'list',formulae:['$H$2:$H$4']};
 const loaded=new ExcelJS.Workbook();await loaded.xlsx.load(await w.xlsx.writeBuffer());
 assert.equal(gradePractice(loaded,modules[3]).score,100);
 loaded.getWorksheet('Entrega').getCell('D3').dataValidation={};
 assert.ok(gradePractice(loaded,modules[3]).score<100);
});
test('dashboard requires a chart object, not a cell saying chart',()=>{
 const w=workbook(8);
 assert.equal(gradePractice(w,modules[7]).details.find(d=>d.cell==='Gráfico').ok,false);
 assert.equal(gradePractice(w,modules[7],{hasChart:true}).details.find(d=>d.cell==='Gráfico').ok,true);
});

test('zero-valued formula results survive export and are graded correctly',async()=>{
 const w=workbook(8),s=w.getWorksheet('Entrega');
 s.getCell('D8').value={formula:'D2-D2',result:0};
 const loaded=new ExcelJS.Workbook();await loaded.xlsx.load(await w.xlsx.writeBuffer());
 assert.equal(gradePractice(loaded,modules[7]).details.find(d=>d.cell==='D8').ok,true);
});
