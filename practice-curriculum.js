const value=(cell,expected,hint,extra={})=>({cell,expected,hint,points:10,...extra});
const formula=(cell,expected,hint)=>value(cell,expected,hint,{formula:true});
export const practices = [
 {
  title:'Presupuesto de una oficina',
  source:[['Código','Concepto','Valor'],['001','Arriendo',800000],['002','Internet',120000],['003','Servicios',180000],['004','Papelería',50000]],
  steps:[
   'Parte 1: crea en Entrega la tabla A1:C5 con los datos de Datos. Identifica encabezados y conserva una fila por gasto.',
   'Parte 2: guarda los códigos como texto para conservar los ceros; los importes deben ser números. Aplica formato moneda a C2:C5.',
   'Parte 3: comprueba que no haya celdas combinadas ni filas vacías en la tabla. En E2 escribe la dirección del importe de Internet y en E3 el rango de los cuatro importes.'
  ],
  checks:[value('A1','Código','Escribe Código en A1.'),value('B1','Concepto','Escribe Concepto en B1.'),value('C1','Valor','Escribe Valor en C1.'),value('A2','001','Conserva 001 como texto.',{text:true}),value('C2',800000,'Registra el arriendo como número.'),value('C3',120000,'Registra Internet como número.'),value('C4',180000,'Registra Servicios como número.'),value('C5',50000,'Registra Papelería como número.'),value('E2','C3','Ubica el importe de Internet.'),value('E3','C2:C5','Incluye las cuatro filas del rango.')],
  format:['C2','C3','C4','C5']
 },
 {
  title:'Cotización con impuesto',
  source:[['Producto','Cantidad','Precio'],['Cuaderno',3,12000],['Carpeta',2,8000],['Agenda',4,5000]],
  initial:[['Producto','Cantidad','Precio','Subtotal','Impuesto','Total'],['Cuaderno',3,12000],['Carpeta',2,8000],['Agenda',4,5000]],
  steps:[
   'Parte 1: calcula D2:D4 multiplicando cantidad por precio; escribe 0,19 en H1 y calcula E2:E4 como subtotal por tasa.',
   'Parte 2: usa la referencia absoluta $H$1 en E2:E4 y copia la fórmula; calcula F2:F4 sumando subtotal e impuesto.',
   'Parte 3: suma los tres totales en F5, verifica que no haya errores y en H3 escribe la referencia mixta que fija la fila 1 de H pero permite cambiar de columna.'
  ],
  checks:[formula('D2',36000,'Multiplica B2 por C2.'),formula('D3',16000,'Revisa las referencias al copiar.'),formula('D4',20000,'Incluye la tercera venta.'),formula('E2',6840,'Usa la tasa de H1 con referencia absoluta.'),formula('E3',3040,'Mantén fija la tasa.'),formula('E4',3800,'Mantén fija la tasa.'),formula('F2',42840,'Suma subtotal e impuesto.'),formula('F3',19040,'Suma subtotal e impuesto.'),formula('F5',85680,'Incluye los tres totales.'),value('H3','H$1','Fija solo la fila de H1.')],
  absolute:['E2','E3','E4']
 },
 {
  title:'Resumen de ventas con datos faltantes',
  source:[['Día','Ventas'],['Lunes',10],['Martes',20],['Miércoles',0],['Jueves',30],['Viernes',null]],
  initial:[['Día','Ventas'],['Lunes',10],['Martes',20],['Miércoles',0],['Jueves',30],['Viernes',null]],
  steps:[
   'Parte 1: calcula en D2 SUMA de B2:B6. En D6 calcula SUMA de B2:B3 y en D7 SUMA de B4:B6.',
   'Parte 2: en D3 calcula PROMEDIO de B2:B6, en D8 PROMEDIO de B2:B3 y en D9 PROMEDIO de B4:B6. Conserva el cero del miércoles y el viernes vacío: no significan lo mismo.',
   'Parte 3: calcula en D4 MIN, D5 MAX y D10 la diferencia entre máximo y mínimo. En D11 escribe Pendiente para indicar que aún falta el dato del viernes.'
  ],
  checks:[formula('D2',60,'Suma el rango completo.'),formula('D3',15,'Incluye el cero y excluye la celda vacía.'),formula('D4',0,'El cero también es un dato.'),formula('D5',30,'Busca el valor máximo.'),formula('D6',30,'Suma lunes y martes.'),formula('D7',30,'Suma miércoles a viernes.'),formula('D8',15,'Promedia lunes y martes.'),formula('D9',15,'Promedia cero y treinta sin contar el vacío.'),formula('D10',30,'Resta el mínimo al máximo.'),value('D11','Pendiente','No inventes un valor para el viernes.')]
 },
 {
  title:'Depuración de pedidos',
  source:[['ID','Cliente','Importe','Estado'],['P03','Ana',300,'Pendiente'],['P01','Luis',100,'Completado'],['P02','Ana',200,'En proceso'],['P02','Ana',200,'En proceso'],['P04','Marta',400,'Pendiente']],
  steps:[
   'Parte 1: copia Datos en Entrega y elimina únicamente el duplicado por ID. Ordena toda la tabla por Importe de menor a mayor. Deben quedar cuatro pedidos en A2:D5, conservando cada cliente y estado.',
   'Parte 2: activa el autofiltro en A1:D5, filtra Pendiente y observa los dos pedidos. Quita el criterio para mostrar todos; conserva los botones de filtro.',
   'Parte 3: configura validación de lista en D2:D5 con Pendiente, En proceso y Completado. Escribe los valores permitidos en H2:H4 y usa ese rango como origen. En F2 registra cuántos pedidos Pendiente hay y en F3 su importe total.'
  ],
  checks:[value('A2','P01','Ordena la tabla completa por importe.'),value('B2','Luis','Conserva la relación ID-cliente.'),value('A3','P02','Elimina solo el ID duplicado.'),value('B3','Ana','Dos clientes pueden compartir nombre.'),value('A4','P03','Ordena sin separar columnas.'),value('A5','P04','Conserva el pedido de mayor importe.'),value('F2',2,'Cuenta los pedidos Pendiente.'),value('F3',700,'Suma los importes Pendiente.'),{cell:'Filtro A1:D5',type:'filter',points:10,hint:'Activa el autofiltro de toda la tabla.'},{cell:'Validación D2:D5',type:'validation',points:10,hint:'Configura una lista con los tres estados en D2:D5.'}]
 },
 {
  title:'Seguimiento de alumnos',
  source:[['Alumno','Nota'],['Ana',75],['Luis',80],['Marta',95],['Pedro',60],['Sara',90]],
  initial:[['Alumno','Nota','Estado'],['Ana',75],['Luis',80],['Marta',95],['Pedro',60],['Sara',90]],
  steps:[
   'Parte 1: escribe en C2:C6 una fórmula SI que muestre Aprobado cuando la nota sea >=80 y Revisar en otro caso.',
   'Parte 2: usa CONTAR.SI en E2 para contar aprobados y E3 para contar quienes requieren revisión.',
   'Parte 3: usa SUMAR.SI en E4 para sumar notas >=80 y E5 para sumar notas <80. En E6 comprueba con una fórmula que la suma de ambos grupos coincide con el total de notas.'
  ],
  checks:[formula('C2','Revisar','Comprueba la rama falsa de SI.'),formula('C3','Aprobado','Incluye la nota igual a 80.'),formula('C4','Aprobado','Comprueba la rama verdadera.'),formula('C5','Revisar','Comprueba las notas bajas.'),formula('C6','Aprobado','Copia la fórmula manteniendo la fila correcta.'),formula('E2',3,'Cuenta notas >=80.'),formula('E3',2,'Cuenta notas <80.'),formula('E4',265,'Suma solo notas >=80.'),formula('E5',135,'Suma solo notas <80.'),formula('E6',0,'Calcula suma de grupos menos total: debe ser cero.')]
 },
 {
  title:'Pedidos contra catálogo',
  source:[['Código','Producto','Precio'],['P01','Teclado',90000],['P02','Ratón',45000],['P03','Monitor',600000]],
  initial:[['Código pedido','Cantidad','Producto','Precio','Importe'],['P02',2],['P01',1],['P99',1],['P03',3]],
  steps:[
   'Parte 1: conserva Datos como catálogo. Relaciona el código de cada pedido con el catálogo; no uses su posición de fila como clave.',
   'Parte 2: en C2:C5 recupera Producto y en D2:D5 Precio con BUSCARX o una búsqueda exacta equivalente. Fija los rangos al copiar.',
   'Parte 3: si falta P99, muestra No encontrado en producto y precio. Calcula E2 y E3 multiplicando cantidad por precio. Revisa que el código ausente no reciba el precio de otro producto.'
  ],
  checks:[formula('C2','Ratón','Busca P02 por coincidencia exacta.'),formula('C3','Teclado','Busca P01.'),formula('C4','No encontrado','Gestiona el código ausente.'),formula('C5','Monitor','Incluye el último producto del catálogo.'),formula('D2',45000,'Recupera el precio de P02.'),formula('D3',90000,'Recupera el precio de P01.'),formula('D4','No encontrado','No inventes un precio para P99.'),formula('D5',600000,'Recupera el precio de P03.'),formula('E2',90000,'Multiplica cantidad por precio.'),formula('E3',90000,'Multiplica cantidad por precio.')]
 },
 {
  title:'Ventas por región y mes',
  steps:[
   'Parte 1: revisa Datos!A1:C9: encabezados únicos, una venta por fila e importes numéricos.',
   'Parte 2: crea una tabla dinámica en Entrega!A1 con Región en Filas, Mes en Columnas y SUMA de Importe en Valores. Prueba un filtro y vuelve a mostrar todas las regiones, meses y totales.',
   'Parte 3: en H2 escribe la región con mayor total y en H3 cuánto creció el total de Febrero frente a Enero. Inserta un gráfico de columnas que compare Enero y Febrero por región, sin incluir los totales generales.'
  ]
 },
 {
  title:'Tablero de ventas y decisión',
  source:[['Región','Mes','Ventas'],['Norte','Enero',150],['Sur','Enero',90],['Centro','Enero',75],['Norte','Febrero',180],['Sur','Febrero',200],['Centro','Febrero',125]],
  steps:[
   'Parte 1: responde «¿Cómo evolucionaron las ventas y qué región lidera?». En D2 calcula ventas totales; D3 participación de Norte como decimal; D4 región líder; D5 total Enero y D6 total Febrero.',
   'Parte 2: en D7 calcula el crecimiento de Febrero respecto a Enero como decimal. Crea en A10:C13 un resumen por región y mes e inserta un gráfico de columnas que compare los dos meses. Aplica porcentaje a D3 y D7.',
   'Parte 3: en D8 calcula la diferencia entre el total del resumen y D2 (debe ser cero). Documenta en D9 el rango fuente Datos!A1:C7. En D10 escribe el mes con más ventas y en A16 redacta una conclusión con cifras y una acción recomendada.'
  ],
  checks:[formula('D2',820,'Incluye las seis ventas.'),formula('D3',330/820,'Divide ventas de Norte entre el total.'),value('D4','Norte','Compara los totales por región.'),formula('D5',315,'Suma Enero.'),formula('D6',505,'Suma Febrero.'),formula('D7',190/315,'Calcula (Febrero-Enero)/Enero.'),formula('D8',0,'Reconcilia el resumen con el total.'),value('D9','Datos!A1:C7','Documenta el rango fuente completo.'),value('D10','Febrero','Identifica el mes de mayor venta.'),{cell:'Gráfico',type:'chart',points:10,hint:'Inserta un gráfico y conserva el objeto al exportar a XLSX.'}]
 }
];
export function enrichPractice(module) {
 const spec=practices[module.id-1];
 return {...module,task:spec.title+'. '+spec.steps.join(' '),
  checks:spec.checks ?? module.checks,
  reviewNote:'Descarga la plantilla actualizada. Se revisan resultados guardados y los controles indicados en la guía; cuando se pide fórmula, escribir solo el resultado no basta. Guarda desde Excel o Sheets antes de subir. La presentación del gráfico y la calidad de la conclusión requieren revisión del docente.'};
}
