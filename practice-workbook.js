import {practices} from './practice-curriculum.js';
import {gradeChecks} from './grading.js';
import {gradePivot,pivotSource} from './pivot.js';

export function populatePractice(workbook,module) {
 const spec=practices[module.id-1];
 const data=workbook.addWorksheet('Datos');
 data.addRows(spec.source ?? pivotSource);
 data.getRow(1).font={bold:true};
 data.columns.forEach(column=>{column.width=22;});
 const sheet=workbook.addWorksheet('Entrega');
 if(spec.initial) sheet.addRows(spec.initial);
 for(const check of module.checks) {
  if(!check.type && /^[A-Z]+[1-9][0-9]*$/.test(check.cell)) {
   sheet.getCell(check.cell).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE7F4ED'}};
  }
 }
 for(let i=1;i<=10;i++)sheet.getColumn(i).width=22;
 const guide=workbook.getWorksheet('Guía');
 guide.getCell('A2').value=spec.title;
 for(const step of spec.steps)guide.addRow([step]);
 guide.addRow(['Completa las tres partes: los datos fuente están en Datos y tu trabajo va en Entrega.']);
 guide.addRow(['Las celdas verdes son entregables, no contienen soluciones. Conserva ambas hojas.']);
 guide.addRow(['Fórmulas: se comprueba su presencia y el resultado guardado, no se recalculan ni se certifica su equivalencia.']);
 if(module.id===1)guide.addRow(['También se verifica formato moneda en C2:C5 y la tabla completa sin celdas combinadas.']);
 if(module.id===2)guide.addRow(['También se verifica que E2:E4 usen $H$1.']);
 if(module.id===7)guide.addRow(['80 puntos: resumen dinámico; 10: interpretación H2/H3; 10: presencia de gráfico. El objeto dinámico y la presentación se revisan con el docente.']);
 guide.eachRow(row=>{row.getCell(1).alignment={wrapText:true,vertical:'top'};row.height=75;});
 return sheet;
}
const cellValue=cell=>cell.formula ? cell.result : cell.value;
const hasFormula=cell=>Boolean(cell.formula);
export function gradePractice(workbook,module,{hasChart=false}={}) {
 const sheet=workbook.getWorksheet('Entrega');
 if(!sheet)throw Error('Conserva la hoja llamada Entrega.');
 const extra=(cell,ok,max,message)=>({cell,ok,points:ok?max:0,max,message:ok?'Correcto.':message});
 if(module.id===7) {
  const base=gradePivot(sheet,module.checks);
  const interpretation=gradeChecks([
   {cell:'H2',expected:'Norte',points:5,hint:'Compara los totales por región.'},
   {cell:'H3',expected:190,points:5,hint:'Resta el total de Enero al de Febrero.'}
  ],{H2:cellValue(sheet.getCell('H2')),H3:cellValue(sheet.getCell('H3'))});
  const details=[...base.details.map(d=>({...d,points:d.points*.8,max:d.max*.8})),...interpretation.details,
   extra('Gráfico',hasChart,10,'Inserta un gráfico de columnas y conserva el objeto al exportar.')];
  return {score:Math.round(details.reduce((sum,d)=>sum+d.points,0)*100)/100,details};
 }
 const details=module.checks.map(check=>{
  if(check.type==='chart')return extra(check.cell,hasChart,check.points,check.hint);
  if(check.type==='filter') {
   const f=sheet.autoFilter;
   const range=typeof f==='string'?f: f ? String(f.from)+':'+String(f.to):'';
   return extra(check.cell,range.replaceAll('$','')==='A1:D5',check.points,check.hint);
  }
  if(check.type==='validation') {
   const allowed=['pendiente','en proceso','completado'];
   const ok=[2,3,4,5].every(row=>{
    const validation=sheet.getCell('D'+row).dataValidation;
    if(validation?.type!=='list')return false;
    const rule=String(validation.formulae?.[0]??'').replaceAll('$','').replace(/^=/,'');
    const values=rule==='H2:H4' ? [2,3,4].map(r=>cellValue(sheet.getCell('H'+r))) : rule.replaceAll('"','').split(/[,;]/);
    return allowed.every(state=>values.map(v=>String(v).trim().toLowerCase()).includes(state));
   });
   return extra(check.cell,ok,check.points,check.hint);
  }
  const cell=sheet.getCell(check.cell);
  const detail=gradeChecks([check],{[check.cell]:cellValue(cell)}).details[0];
  if(check.formula&&!hasFormula(cell))return extra(check.cell,false,check.points,'Usa una fórmula y guarda su resultado; no escribas solo la respuesta.');
  if(check.text&&typeof cell.value!=='string')return extra(check.cell,false,check.points,check.hint);
  return detail;
 });
 if(module.id===1) {
  details.push(extra('Formato moneda', ['C2','C3','C4','C5'].every(c=>/[$€£]|COP|USD/.test(sheet.getCell(c).numFmt??'')),10,'Aplica formato moneda a C2:C5.'));
  const rows=[['001','Arriendo',800000],['002','Internet',120000],['003','Servicios',180000],['004','Papelería',50000]];
  const structured=rows.every((row,i)=>row.every((v,j)=>cellValue(sheet.getCell(i+2,j+1))===v))
   && !sheet.model.merges?.length;
  details.push(extra('Tabla completa',structured,10,'Conserva códigos, conceptos e importes en A2:C5, sin combinar celdas.'));
 }
 if(module.id===2)details.push(extra('Tasa absoluta', ['E2','E3','E4'].every(c=>/\$H\$1/i.test(sheet.getCell(c).formula??'')),10,'Usa $H$1 en los tres cálculos de impuesto.'));
 if(module.id===4) {
  const rows=[['P01','Luis',100,'Completado'],['P02','Ana',200,'En proceso'],['P03','Ana',300,'Pendiente'],['P04','Marta',400,'Pendiente']];
  details.push(extra('Registros completos',rows.every((row,i)=>row.every((v,j)=>cellValue(sheet.getCell(i+2,j+1))===v))&&!cellValue(sheet.getCell('A6')),10,'Conserva los cuatro pedidos completos y elimina el duplicado.'));
 }
 const maximum=details.reduce((sum,d)=>sum+d.max,0);
 return {score:Math.round(10000*details.reduce((sum,d)=>sum+d.points,0)/maximum)/100,details};
}
