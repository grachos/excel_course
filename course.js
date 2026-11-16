const q=(question,options,correct,explanation)=>({question,options,correct,explanation});
export const modules=[
{title:'Tu primera hoja',level:'Básico',goal:'Organiza un presupuesto y reconoce celdas, rangos y tipos de datos.',guide:['Una celda se identifica por columna y fila: B3 está en la columna B y fila 3. Un rango como B2:B5 incluye ambas celdas y todas las intermedias.','Escribe cantidades como números. El formato moneda cambia su presentación, no su valor. Usa encabezados claros y una fila por concepto.','Ejemplo: registra Arriendo y 800000 en A2 y B2. Aplica formato moneda a B2. Evita combinar celdas en una tabla que luego filtrarás.'],task:'En Entrega, escribe Concepto en A1, Valor en B1 y 800000 como número en B2. Aplica moneda a B2 para practicar; en esta versión se califican los valores.',checks:[['A1','Concepto',30,'Escribe el encabezado Concepto en A1.'],['B1','Valor',30,'B1 debe identificar la columna de valores.'],['B2',800000,40,'Introduce 800000 como número, sin escribir la moneda dentro del texto.']],questions:[q('¿Dónde está B3?',['Columna B, fila 3','Columna 3, fila B','Hoja B'],0,'La letra indica la columna y el número la fila.'),q('¿Qué cambia el formato moneda?',['La presentación','El valor numérico','La fórmula'],0,'El formato cambia cómo se ve el dato.'),q('¿Qué es B2:B5?',['Un rango','Una hoja','Un archivo'],0,'Los dos puntos delimitan un rango.'),q('¿Cómo organizarías gastos?',['Un concepto por fila','Todos en una celda','Sin encabezados'],0,'Una fila por registro facilita el análisis.')]},
{title:'Fórmulas que trabajan por ti',level:'Básico',goal:'Calcula importes y distingue referencias relativas y absolutas.',guide:['Las fórmulas empiezan con =. Si B2 contiene cantidad y C2 precio, =B2*C2 calcula el importe.','Al copiar =B2*C2 hacia abajo se obtiene =B3*C3. Para fijar una tasa guardada en H1 utiliza $H$1.','Ejemplo: 3 unidades a 12000 dan 36000. Con una tasa de 0,1, =D2*$H$1 calcula 3600.'],task:'En Entrega calcula D2=3*12000, D3=2*8000 y D4=D2+D3. Usa fórmulas. La revisión inicial valida resultados guardados; no certifica todavía la equivalencia de fórmulas.',checks:[['D2',36000,30,'Multiplica cantidad por precio.'],['D3',16000,30,'Calcula 2 por 8000.'],['D4',52000,40,'Suma ambos importes.']],questions:[q('¿Con qué comienza una fórmula?',['=','#','@'],0,'Las fórmulas empiezan con =.'),q('¿Qué referencia permanece fija?',['$H$1','H1','H$2 sin fijar columna'],0,'Los dos signos $ fijan fila y columna.'),q('Al copiar B2 una fila abajo se convierte en…',['B3','B2','C2'],0,'La fila cambia en una referencia relativa.'),q('¿Qué operación calcula un importe?',['Cantidad por precio','Cantidad más precio','Precio menos fila'],0,'Multiplica cantidad por precio.')]},
{title:'Funciones esenciales',level:'Básico',goal:'Resume cifras con SUMA, PROMEDIO, MIN y MAX.',guide:['Una función recibe argumentos: =SUMA(B2:B4) suma un rango. En interfaces en inglés se llama SUM.','PROMEDIO calcula la media. MIN y MAX encuentran los extremos. No confundas una celda vacía con un cero.','Ejemplo: para 10, 20 y 30, la suma es 60, el promedio 20, el mínimo 10 y el máximo 30.'],task:'En Entrega registra en B2:B4 los valores 10, 20 y 30. Calcula en D2 la suma, D3 el promedio y D4 el máximo.',checks:[['D2',60,30,'Suma los tres valores.'],['D3',20,40,'Divide la suma entre tres observaciones.'],['D4',30,30,'Identifica el valor mayor.']],questions:[q('¿Qué función obtiene la media?',['PROMEDIO','SUMA','MAX'],0,'PROMEDIO obtiene la media aritmética.'),q('¿Qué hace MAX?',['Devuelve el mayor','Cuenta filas','Ordena datos'],0,'MAX devuelve el máximo.'),q('¿SUMA(B2:B4) incluye B4?',['Sí','No','Solo si está vacía'],0,'El rango incluye ambos extremos.'),q('¿Cuál es el promedio de 2 y 8?',['5','10','6'],0,'(2+8)/2 = 5.')]},
{title:'Datos limpios y ordenados',level:'Intermedio',goal:'Usa filtros y validación sin perder la relación entre columnas.',guide:['Ordena siempre la tabla completa: ordenar una única columna puede separar nombres de sus valores.','Un filtro oculta temporalmente filas; no las elimina. La validación limita entradas permitidas, como una lista de estados.','Antes de eliminar duplicados define la clave: dos clientes pueden compartir nombre y tener identificaciones diferentes.'],task:'En Entrega escribe en A2:A4 los estados Pendiente, En proceso y Completado. Crea una lista de validación como práctica adicional. Se califican los tres estados, no la configuración de validación.',checks:[['A2','Pendiente',30,'Usa el primer estado indicado.'],['A3','En proceso',40,'Comprueba el nombre del estado intermedio.'],['A4','Completado',30,'Usa el estado de cierre.']],questions:[q('¿Un filtro elimina registros?',['No','Sí','Solo números'],0,'Oculta filas temporalmente.'),q('¿Qué debes ordenar?',['Toda la tabla','Solo nombres','Solo importes'],0,'Ordena toda la tabla para conservar cada registro.'),q('¿Para qué sirve validar datos?',['Limitar entradas','Borrar fórmulas','Sumar columnas'],0,'Permite definir valores aceptados.'),q('¿Qué identifica mejor un cliente?',['Un identificador único','Solo su nombre','El color de la fila'],0,'Una clave única evita confusiones.')]},
{title:'Decisiones con datos',level:'Intermedio',goal:'Aplica SI, SUMAR.SI y CONTAR.SI.',guide:['SI evalúa una condición y devuelve un valor para verdadero y otro para falso. Ejemplo: =SI(B2>=80;"Aprobado";"Revisar").','SUMAR.SI suma valores que cumplen una condición. CONTAR.SI cuenta coincidencias.','Los separadores dependen de la configuración regional: algunas hojas usan ; y otras ,. En inglés las funciones son IF, SUMIF y COUNTIF.'],task:'Para las notas 75, 80 y 95, escribe en D2 cuántas son >=80, en D3 su suma y en D4 el estado Aprobado para 80.',checks:[['D2',2,30,'El límite 80 también aprueba.'],['D3',175,40,'Suma únicamente 80 y 95.'],['D4','Aprobado',30,'Usa >=80, no >80.']],questions:[q('¿80 cumple >=80?',['Sí','No','Depende del formato'],0,'El símbolo incluye igualdad.'),q('¿CONTAR.SI suma importes?',['No, cuenta coincidencias','Sí','Solo monedas'],0,'Cuenta las celdas que cumplen el criterio.'),q('¿SI tiene resultado para falso?',['Sí','No','Solo en Excel'],0,'Puedes especificar ambas ramas.'),q('¿Cuántos de 79,80,90 aprueban?',['2','1','3'],0,'80 y 90 cumplen >=80.')]},
{title:'Conecta tus tablas',level:'Intermedio',goal:'Cruza un catálogo con pedidos mediante una clave.',guide:['Una búsqueda relaciona tablas usando una clave estable, como el código de producto.','BUSCARX / XLOOKUP busca una clave y devuelve el dato asociado. Para códigos utiliza coincidencia exacta y trata explícitamente los ausentes.','Ejemplo: P01 → Teclado → 90000. Al buscar P01 debes obtener el precio asociado; no el de la fila anterior.'],task:'Catálogo: P01 cuesta 90000; P02 cuesta 45000. En Entrega escribe en D2 el precio de P02, D3 el de P01 y D4 No encontrado para P99.',checks:[['D2',45000,30,'Relaciona P02 con su propio precio.'],['D3',90000,30,'Relaciona P01 con su propio precio.'],['D4','No encontrado',40,'Gestiona la clave ausente sin inventar un precio.']],questions:[q('¿Qué clave conviene usar?',['Código único','Color','Posición visual'],0,'Un código único identifica el producto.'),q('¿Qué coincidencia usar con códigos?',['Exacta','Aproximada siempre','Cualquiera'],0,'La coincidencia exacta evita productos equivocados.'),q('¿Qué hacer si falta la clave?',['Mostrar ausencia','Inventar cero como precio','Usar otra fila'],0,'Distingue ausencia de un precio real.'),q('¿Qué devuelve una búsqueda?',['El dato asociado a una clave','Todos los colores','Una contraseña'],0,'Relaciona una clave con su dato.')]},
{
  "title": "Tablas dinámicas y gráficos",
  "level": "Avanzado · introducción",
  "goal": "Construye una tabla dinámica por región y mes, comprueba los totales y convierte el resumen en un gráfico.",
  "guide": [
    "Una tabla dinámica agrupa muchas filas y responde preguntas como «¿cuánto vendió cada región por mes?». La fuente debe tener una fila de encabezados y los importes deben ser números.",
    "En Filas va la categoría que quieres comparar (Región). En Columnas va el segundo grupo (Mes). En Valores va el número que quieres agregar (Importe); elige SUMA. Si aparece CONTAR, revisa que los importes sean numéricos y cambia la agregación.",
    "En Filtros puedes restringir el análisis. Prueba mostrar una región y vuelve a seleccionar todas antes de entregar. Si editas la fuente, actualiza la tabla en Excel. En Sheets, verifica que el rango siga incluyendo todas las filas.",
    "Opcional: selecciona las regiones y los dos meses, excluye los totales generales e inserta un gráfico de columnas para comparar los meses."
  ],
  "platformSteps": {
    "excel": [
      "En la hoja Datos selecciona A1:C9. Ve a Insertar → Tabla dinámica. Crea tu propia tabla en Hoja existente y selecciona Entrega!A1.",
      "En el panel de campos, arrastra Región a Filas, Mes a Columnas e Importe a Valores. En la configuración de Importe selecciona Suma y deja visibles los totales generales por fila y columna.",
      "Guarda o descarga una copia .xlsx con las hojas Datos y Entrega. Si cambiaste los datos, actualiza primero la tabla dinámica."
    ],
    "sheets": [
      "En la hoja Datos selecciona A1:C9. Ve a Insertar → Tabla dinámica. Selecciona Hoja existente y elige Entrega!A1.",
      "En el editor, añade Región a Filas, Mes a Columnas e Importe a Valores. En Resumir por elige SUMA y deja marcados los totales de filas y columnas.",
      "Ve a Archivo → Descargar → Microsoft Excel (.xlsx). Conserva la hoja Entrega con el resumen completo."
    ]
  },
  "task": "Descarga la plantilla nueva del módulo 7, que trae los ocho registros de ventas. Crea la tabla dinámica en Entrega!A1 con Región en Filas, Mes en Columnas y SUMA de Importe en Valores. Deja visibles Enero, Febrero, las tres regiones y los totales generales. Sube el archivo .xlsx con la tabla en la hoja Entrega.",
  "reviewNote": "La nota verifica los valores y encabezados guardados en Entrega, sin depender del orden de regiones o meses. La revisión automática no comprueba el objeto de tabla dinámica ni el gráfico.",
  "checks": [
    [
      "norte:enero",
      150,
      8,
      "Suma los importes de Norte en enero."
    ],
    [
      "norte:febrero",
      180,
      8,
      "Suma los importes de Norte en febrero."
    ],
    [
      "norte:total",
      330,
      4,
      "Activa el total general de Norte."
    ],
    [
      "sur:enero",
      90,
      8,
      "Suma los importes de Sur en enero."
    ],
    [
      "sur:febrero",
      200,
      8,
      "Suma los importes de Sur en febrero."
    ],
    [
      "sur:total",
      290,
      4,
      "Activa el total general de Sur."
    ],
    [
      "centro:enero",
      75,
      8,
      "Suma los importes de Centro en enero."
    ],
    [
      "centro:febrero",
      125,
      8,
      "Suma los importes de Centro en febrero."
    ],
    [
      "centro:total",
      200,
      4,
      "Activa el total general de Centro."
    ],
    [
      "total:enero",
      315,
      10,
      "Activa los totales generales y revisa la suma de enero."
    ],
    [
      "total:febrero",
      505,
      10,
      "Activa los totales generales y revisa la suma de febrero."
    ],
    [
      "total:total",
      820,
      20,
      "Comprueba que el total general incluya las ocho ventas."
    ]
  ],
  questions:[q("¿Qué campo va en Filas para comparar regiones?",["Región","Mes","Importe"],0,"Región define los grupos que identifican cada fila."),q("¿Qué función resume el dinero vendido?",["SUMA de Importe","CONTAR de Importe","PROMEDIO de Mes"],0,"SUMA agrega los importes dentro de cada grupo."),q("¿Qué aporta poner Mes en Columnas?",["Una columna por mes","Elimina importes duplicados","Cambia el formato de moneda"],0,"Cada mes se convierte en una categoría de columnas."),q("Si aparecen solo las ventas de una región, ¿qué debes revisar?",["Los filtros activos","El ancho de las celdas","El número de colores"],0,"Un filtro puede ocultar regiones sin cambiar la fuente.")]
},
{title:'Tu primer tablero',level:'Proyecto final',goal:'Integra indicadores y explica una conclusión.',guide:['Define primero la pregunta del tablero: ¿cuánto vendimos y qué región lidera? Escoge indicadores que respondan esa pregunta.','Comprueba totales, filtra periodos y documenta las fuentes. Un tablero bonito con cálculos incorrectos no sirve para decidir.','Con Norte=250 y Sur=200, el total es 450 y la región líder es Norte. El porcentaje de Norte es 250/450.'],task:'Entrega un resumen con D2=total 450, D3=participación de Norte como decimal y D4=región líder. Añade un gráfico para revisión posterior. El proyecto se evalúa inicialmente por estos indicadores.',checks:[['D2',450,30,'Suma las ventas de ambas regiones.'],['D3',250/450,40,'Divide Norte entre el total; guarda el decimal, luego aplica porcentaje.'],['D4','Norte',30,'Compara 250 frente a 200.']],questions:[q('¿Qué debes definir primero?',['La pregunta del análisis','El color','El tamaño del logo'],0,'La pregunta guía los indicadores.'),q('¿Cómo calcular participación?',['Parte / total','Total / parte','Parte + total'],0,'La participación es una fracción del total.'),q('¿Qué revisar antes de presentar?',['Totales y fuentes','Solo tipografía','Solo título'],0,'La consistencia sustenta las conclusiones.'),q('¿Un formato porcentaje cambia el dato?',['No','Sí, lo multiplica internamente','Elimina decimales siempre'],0,'El formato cambia la presentación.')] }
].map((m,i)=>({...m,id:i+1,checks:m.checks.map(([cell,expected,points,hint])=>({cell,expected,points,hint}))}));
