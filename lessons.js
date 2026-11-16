import {modules} from './course.js';

const partsByModule = [
  [
    {
      "title": "Celdas, rangos y hojas",
      "lesson": "Cada celda tiene una dirección: letra de columna y número de fila. Un rango incluye ambos extremos. Separa datos, cálculos y resultados en hojas cuando el archivo crece.",
      "example": "En A2 escribe Transporte y en B2 escribe 12500. Selecciona A1:B2 para incluir las dos columnas y el encabezado. Cambia el nombre de la hoja a Presupuesto.",
      "questions": [
        {
          "question": "¿Qué rango abarca desde A2 hasta B5?",
          "options": [
            "A2:B5",
            "A2,B5",
            "B2:C5"
          ],
          "correct": 0,
          "explanation": "A2:B5 reúne dos columnas y cuatro filas."
        },
        {
          "question": "¿Dónde está C4?",
          "options": [
            "Columna C, fila 4",
            "Columna 4, fila C",
            "Hoja C, fila 4"
          ],
          "correct": 0,
          "explanation": "La primera parte indica la columna."
        },
        {
          "question": "¿Qué acción ayuda a reconocer la hoja al volver?",
          "options": [
            "Ponerle un nombre descriptivo",
            "Combinar todas sus celdas",
            "Dejar el nombre inicial"
          ],
          "correct": 0,
          "explanation": "El nombre de la hoja explica su contenido."
        }
      ]
    },
    {
      "title": "Tipos de datos y formato",
      "lesson": "Un número se puede sumar; el texto representa etiquetas o códigos. El formato modifica lo que ves. Un porcentaje de 15 % representa el número 0,15. Conserva como texto identificadores que empiezan en cero.",
      "example": "Escribe 12500 y aplica formato de moneda. En otra celda escribe 0,15 y aplica porcentaje. Observa que puedes usar ambos valores en cálculos.",
      "questions": [
        {
          "question": "¿Qué valor representa 15 %?",
          "options": [
            "0,15",
            "15",
            "150"
          ],
          "correct": 0,
          "explanation": "Porcentaje significa dividir entre cien."
        },
        {
          "question": "¿Cómo conservas el cero inicial de un código 0012?",
          "options": [
            "Guárdalo como texto",
            "Aplica moneda",
            "Convierte a fecha"
          ],
          "correct": 0,
          "explanation": "El código identifica un registro y no se usa como cantidad."
        },
        {
          "question": "¿Qué cambia al aplicar moneda a 12500?",
          "options": [
            "La presentación",
            "El importe original",
            "El nombre de la columna"
          ],
          "correct": 0,
          "explanation": "El formato no altera el valor de la celda."
        }
      ]
    },
    {
      "title": "Estructura y revisión de una tabla",
      "lesson": "Usa una fila de encabezados y una fila por movimiento. Mantén cada columna con un solo tipo de dato. Una celda vacía y un cero tienen significados distintos.",
      "example": "En vez de escribir «Taxi 12500» en una celda, usa Concepto y Valor. Registra cada viaje por separado y revisa que los montos se puedan sumar.",
      "questions": [
        {
          "question": "¿Cómo registras tres viajes del mismo día?",
          "options": [
            "Tres filas, una por viaje",
            "Una celda con toda la información",
            "Tres encabezados"
          ],
          "correct": 0,
          "explanation": "Cada registro necesita su propia fila."
        },
        {
          "question": "¿Qué representa un importe vacío?",
          "options": [
            "Un valor sin registrar",
            "Un cero confirmado",
            "Un importe negativo"
          ],
          "correct": 0,
          "explanation": "Un dato faltante requiere revisión."
        },
        {
          "question": "¿Por qué separar concepto e importe?",
          "options": [
            "Para filtrar y sumar por separado",
            "Para reducir el tamaño del archivo",
            "Para evitar encabezados"
          ],
          "correct": 0,
          "explanation": "Cada columna conserva su significado."
        }
      ]
    }
  ],
  [
    {
      "title": "Arma y comprueba fórmulas",
      "lesson": "Una fórmula empieza con = y combina operaciones o referencias. Las potencias, la multiplicación y la división se calculan antes de la suma y resta. Los paréntesis indican el orden que necesitas.",
      "example": "Si B2 es 300 y C2 es 20, escribe =B2*(1-C2/100). El resultado 240 descuenta 20 % del precio.",
      "questions": [
        {
          "question": "¿Qué vale =2+3*4?",
          "options": [
            "14",
            "20",
            "24"
          ],
          "correct": 0,
          "explanation": "Primero se multiplica 3 por 4."
        },
        {
          "question": "¿Cómo obligas a sumar primero?",
          "options": [
            "=(2+3)*4",
            "=2+3*4",
            "=2+(3*4)"
          ],
          "correct": 0,
          "explanation": "Los paréntesis agrupan la suma."
        },
        {
          "question": "¿Qué ventaja tiene =B2*C2 frente a =3*2000?",
          "options": [
            "Se actualiza cuando cambian las celdas",
            "Siempre redondea",
            "Impide editar la hoja"
          ],
          "correct": 0,
          "explanation": "Las referencias enlazan el resultado a sus datos."
        }
      ]
    },
    {
      "title": "Referencias relativas, absolutas y mixtas",
      "lesson": "B2 cambia al copiar una fórmula. $B$2 fija la fila y la columna. $B2 fija solo la columna y B$2 fija solo la fila.",
      "example": "Coloca una tasa de 0,19 en H1. Si D2 contiene el subtotal, escribe =D2*$H$1 y copia hacia abajo. La siguiente fila usa D3 y la misma tasa.",
      "questions": [
        {
          "question": "Al copiar =D2*$H$1 hacia abajo, ¿qué queda?",
          "options": [
            "=D3*$H$1",
            "=D3*H2",
            "=D2*$H$1"
          ],
          "correct": 0,
          "explanation": "Solo se desplaza la referencia relativa."
        },
        {
          "question": "¿Qué fija B$2?",
          "options": [
            "La fila 2",
            "La columna B",
            "Toda la referencia"
          ],
          "correct": 0,
          "explanation": "El signo $ actúa sobre la parte que le sigue."
        },
        {
          "question": "¿Qué usarías para una tasa que todos comparten?",
          "options": [
            "$H$1",
            "H1",
            "H$2"
          ],
          "correct": 0,
          "explanation": "La referencia absoluta preserva la celda origen."
        }
      ]
    },
    {
      "title": "Detecta errores antes de copiar",
      "lesson": "Prueba la primera fórmula con un cálculo manual y revisa una fila diferente después de copiar. Si divides entre cero, inspecciona el denominador antes de ocultar el error.",
      "example": "Si el subtotal es 40000 y la tasa es 10 %, espera 4000. Si la segunda fila da cero, revisa si la fórmula se desplazó hasta una celda de tasa vacía.",
      "questions": [
        {
          "question": "Si todas las filas menos la primera pierden la tasa, ¿qué revisas?",
          "options": [
            "La referencia absoluta de la tasa",
            "El color de las celdas",
            "El nombre de la pestaña"
          ],
          "correct": 0,
          "explanation": "Una referencia relativa puede ir a una celda vacía."
        },
        {
          "question": "¿Qué revisas ante un error de división?",
          "options": [
            "El denominador y su valor",
            "La fuente tipográfica",
            "El ancho de columna"
          ],
          "correct": 0,
          "explanation": "Un denominador cero no permite calcular la división."
        },
        {
          "question": "¿Qué prueba confirma el copiado?",
          "options": [
            "Revisar la fórmula y el resultado de otra fila",
            "Revisar solo la primera fila",
            "Convertir todos los resultados en texto"
          ],
          "correct": 0,
          "explanation": "Comprueba que cambió la entrada y se mantuvieron los datos fijos."
        }
      ]
    }
  ],
  [
    {
      "title": "Rangos y SUMA",
      "lesson": "SUMA agrega las cantidades numéricas en un rango. El rango debe incluir todas las filas de la tabla y excluir los totales previos. Si un importe quedó como texto, puede omitirse de la suma.",
      "example": "Para 18, 22 y 30 en B2:B4, usa =SUMA(B2:B4) para obtener 70.",
      "questions": [
        {
          "question": "¿Cuánto suma 18 + 22 + 30?",
          "options": [
            "70",
            "52",
            "72"
          ],
          "correct": 0,
          "explanation": "Se incluyen los tres valores."
        },
        {
          "question": "¿Qué revisar si el total ignora una venta?",
          "options": [
            "El rango y el tipo numérico de la venta",
            "El color del resultado",
            "El nombre de la función en otra pestaña"
          ],
          "correct": 0,
          "explanation": "Una fila fuera del rango o guardada como texto puede quedar excluida."
        },
        {
          "question": "¿Qué pasa si sumas de nuevo un subtotal dentro del rango?",
          "options": [
            "Duplicas parte de los importes",
            "Corriges los datos faltantes",
            "Cambias a un promedio"
          ],
          "correct": 0,
          "explanation": "El subtotal ya incluye los registros individuales."
        }
      ]
    },
    {
      "title": "PROMEDIO y datos faltantes",
      "lesson": "PROMEDIO divide por la cantidad de valores numéricos. Los ceros cuentan y las celdas vacías normalmente no. Decide si un dato vacío significa que falta medir o si realmente es cero.",
      "example": "Con 10, vacío y 20, la media es 15. Al registrar un cero real en la celda vacía, pasa a 10.",
      "questions": [
        {
          "question": "¿Cuál es la media de 10, 0 y 20?",
          "options": [
            "10",
            "15",
            "30"
          ],
          "correct": 0,
          "explanation": "Hay tres observaciones, incluido el cero."
        },
        {
          "question": "¿Cuál es la media de 10, vacío y 20?",
          "options": [
            "15",
            "10",
            "20"
          ],
          "correct": 0,
          "explanation": "La celda vacía no agrega una observación."
        },
        {
          "question": "¿Qué representa un punto de venta sin reporte?",
          "options": [
            "Un dato faltante que conviene confirmar",
            "Un cero automáticamente",
            "La media de la semana"
          ],
          "correct": 0,
          "explanation": "Asignar cero sin comprobarlo distorsiona el indicador."
        }
      ]
    },
    {
      "title": "MIN, MAX y elección del indicador",
      "lesson": "MIN y MAX devuelven los extremos. Sirven para revisar anomalías. Distingue contar registros, sumar unidades y obtener la venta mayor; son preguntas diferentes.",
      "example": "Con ventas 9, 12 y 44, MAX entrega 44 y MIN entrega 9. Si 44 parece atípico, revísalo en la fuente antes de presentar.",
      "questions": [
        {
          "question": "¿Qué función ve la venta más baja?",
          "options": [
            "MIN",
            "MAX",
            "PROMEDIO"
          ],
          "correct": 0,
          "explanation": "MIN devuelve el valor mínimo."
        },
        {
          "question": "¿Qué describe MAX(9,12,44)?",
          "options": [
            "La mayor observación: 44",
            "El total: 65",
            "La cantidad: 3"
          ],
          "correct": 0,
          "explanation": "MAX no suma ni cuenta."
        },
        {
          "question": "Si aparece un máximo inesperado, ¿qué haces primero?",
          "options": [
            "Verificar el dato original",
            "Borrarlo de inmediato",
            "Cambiarlo por el promedio"
          ],
          "correct": 0,
          "explanation": "La fuente permite confirmar si es un error."
        }
      ]
    }
  ],
  [
    {
      "title": "Ordena registros completos",
      "lesson": "Ordena toda la tabla para que nombre, código e importe permanezcan juntos. Mantén el encabezado fuera de las filas ordenadas.",
      "example": "Selecciona el rango completo de pedidos y ordénalo por importe descendente. Comprueba que el número de pedido se movió junto a su importe.",
      "questions": [
        {
          "question": "¿Qué se rompe al ordenar solo la columna Importe?",
          "options": [
            "La relación con cada pedido",
            "La posibilidad de guardar",
            "El formato de moneda siempre"
          ],
          "correct": 0,
          "explanation": "Cada fila debe seguir describiendo el mismo pedido."
        },
        {
          "question": "¿Qué orden muestra primero el valor mayor?",
          "options": [
            "Descendente",
            "Ascendente",
            "Por color"
          ],
          "correct": 0,
          "explanation": "El orden descendente va de mayor a menor."
        },
        {
          "question": "¿Qué haces con la fila de encabezados?",
          "options": [
            "Indicas que el rango tiene encabezado",
            "La ordenas como un pedido",
            "La duplicas en cada fila"
          ],
          "correct": 0,
          "explanation": "Los encabezados describen las columnas."
        }
      ]
    },
    {
      "title": "Filtra y vuelve a ver todo",
      "lesson": "Un filtro limita las filas visibles. Puedes combinar condiciones de columna. Si el resultado queda vacío, revisa tanto el criterio actual como otros filtros aplicados.",
      "example": "Filtra Estado = Pendiente y luego Región = Norte. Limpia Región para volver a ver todos los pendientes.",
      "questions": [
        {
          "question": "¿Qué muestran los dos filtros del ejemplo?",
          "options": [
            "Pendientes de Norte",
            "Todos los pendientes más todas las filas de Norte",
            "Todas las filas"
          ],
          "correct": 0,
          "explanation": "Una fila debe cumplir ambas condiciones."
        },
        {
          "question": "¿Qué ocurre al limpiar un filtro?",
          "options": [
            "Vuelven a verse las filas compatibles con los filtros que quedan",
            "Se borran filas",
            "Se reescriben valores"
          ],
          "correct": 0,
          "explanation": "El filtro afecta visibilidad."
        },
        {
          "question": "Si el filtro no devuelve datos, ¿qué revisas?",
          "options": [
            "Criterios y filtros activos",
            "El tamaño de fuente",
            "La fecha de creación del archivo"
          ],
          "correct": 0,
          "explanation": "Otro criterio puede excluir las filas esperadas."
        }
      ]
    },
    {
      "title": "Valida entradas y detecta duplicados",
      "lesson": "Una lista desplegable evita variantes como «Pend.» y «Pendiente». Para eliminar duplicados, define primero la clave de negocio. Haz una copia si la eliminación es irreversible.",
      "example": "Define Pendiente, En proceso y Completado. Para revisar pedidos repetidos, compara el ID de pedido antes de borrar filas.",
      "questions": [
        {
          "question": "¿Qué controla una lista desplegable?",
          "options": [
            "Los valores permitidos en una celda",
            "La suma de importes",
            "El orden de las hojas"
          ],
          "correct": 0,
          "explanation": "La lista normaliza la captura."
        },
        {
          "question": "Dos clientes se llaman Ana. ¿Son duplicados?",
          "options": [
            "Hay que comparar sus identificadores",
            "Sí, el nombre basta",
            "Nunca, aunque coincida el ID"
          ],
          "correct": 0,
          "explanation": "El nombre no identifica de forma única."
        },
        {
          "question": "¿Qué respaldo conviene antes de quitar duplicados?",
          "options": [
            "Una copia de la tabla original",
            "Cambiar toda la hoja a texto",
            "Eliminar los encabezados"
          ],
          "correct": 0,
          "explanation": "La copia permite recuperar registros si la clave era incorrecta."
        }
      ]
    }
  ],
  [
    {
      "title": "SI: define la regla y sus dos resultados",
      "lesson": "SI evalúa una condición y devuelve un resultado si se cumple y otro si no. Escribe primero la regla en palabras y prueba el valor exacto del límite.",
      "example": "Para una meta de 85 usa =SI(B2>=85;\"Cumple\";\"Revisar\"). Prueba 84, 85 y 86, incluidos ambos lados del umbral.",
      "questions": [
        {
          "question": "¿85 cumple >=85?",
          "options": [
            "Sí",
            "No",
            "Solo si no tiene formato"
          ],
          "correct": 0,
          "explanation": "El operador incluye la igualdad."
        },
        {
          "question": "¿Qué devuelve SI si no se cumple >=85?",
          "options": [
            "Revisar",
            "Cumple",
            "85"
          ],
          "correct": 0,
          "explanation": "Se usa el argumento de la rama falsa."
        },
        {
          "question": "¿Qué tres valores prueban bien el límite?",
          "options": [
            "84, 85, 86",
            "10, 20, 30",
            "Solo 85 tres veces"
          ],
          "correct": 0,
          "explanation": "Se prueban ambos lados y la igualdad."
        }
      ]
    },
    {
      "title": "CONTAR.SI: mide cuántos cumplen",
      "lesson": "CONTAR.SI devuelve el número de coincidencias. El criterio puede ser una palabra o una comparación entre comillas.",
      "example": "Para los valores 74, 85 y 91, usa =CONTAR.SI(B2:B4;\">=85\") para obtener 2.",
      "questions": [
        {
          "question": "¿Qué devuelve CONTAR.SI con dos coincidencias?",
          "options": [
            "2",
            "La suma de ambos importes",
            "El valor mayor"
          ],
          "correct": 0,
          "explanation": "La función cuenta registros."
        },
        {
          "question": "¿Qué criterio distingue 85 o más?",
          "options": [
            "\">=85\"",
            "\">85\"",
            "\"85\""
          ],
          "correct": 0,
          "explanation": "Solo >= incluye los valores iguales o superiores."
        },
        {
          "question": "¿Dónde va el rango de valores en CONTAR.SI?",
          "options": [
            "Primer argumento",
            "Segundo argumento",
            "Fuera de los paréntesis"
          ],
          "correct": 0,
          "explanation": "El primer argumento indica las celdas que se evalúan."
        }
      ]
    },
    {
      "title": "SUMAR.SI: suma únicamente lo que coincide",
      "lesson": "SUMAR.SI compara un rango con un criterio y agrega el importe de las filas que coinciden. Si usas una columna para filtrar y otra para sumar, ambos rangos deben cubrir las mismas filas.",
      "example": "Si A2:A4 contiene categorías y B2:B4 importes, usa =SUMAR.SI(A2:A4;\"Libros\";B2:B4).",
      "questions": [
        {
          "question": "¿Qué rango se suma en el ejemplo?",
          "options": [
            "B2:B4",
            "A2:A4",
            "Las dos columnas completas"
          ],
          "correct": 0,
          "explanation": "El tercer argumento indica los registros numéricos."
        },
        {
          "question": "¿Qué problema hay con A2:A4 y B3:B5?",
          "options": [
            "Las filas de criterio y suma quedan desalineadas",
            "No se puede sumar ninguna columna",
            "Dos rangos nunca se permiten"
          ],
          "correct": 0,
          "explanation": "Cada criterio debe corresponder a su importe."
        },
        {
          "question": "¿Qué función calcula ingresos de una categoría?",
          "options": [
            "SUMAR.SI",
            "CONTAR.SI",
            "MAX"
          ],
          "correct": 0,
          "explanation": "Se pide totalizar importes."
        }
      ]
    }
  ],
  [
    {
      "title": "Relaciona registros con una clave",
      "lesson": "Una búsqueda relaciona una columna de claves con otra de resultados. Elige un código único, con el mismo tipo de dato y sin espacios sobrantes en ambos lugares.",
      "example": "En un catálogo, P03 identifica un solo producto. Compara un código de pedido con ese catálogo antes de calcular el importe.",
      "questions": [
        {
          "question": "¿Qué campo usarías como clave?",
          "options": [
            "Código único",
            "Color del producto",
            "Posición de la fila"
          ],
          "correct": 0,
          "explanation": "El código identifica un registro aunque se reordene la fuente."
        },
        {
          "question": "¿Qué revisar si dos códigos aparentemente iguales no coinciden?",
          "options": [
            "Espacios y tipo de dato",
            "El color de fondo",
            "La altura de fila"
          ],
          "correct": 0,
          "explanation": "Las diferencias invisibles pueden causar ausencia de coincidencia."
        },
        {
          "question": "¿Por qué son un problema dos precios para P03?",
          "options": [
            "La búsqueda dejará de identificar un precio inequívoco",
            "La fórmula siempre suma los dos",
            "El código se vuelve fecha"
          ],
          "correct": 0,
          "explanation": "La clave debe indicar un solo registro."
        }
      ]
    },
    {
      "title": "BUSCARX / XLOOKUP paso a paso",
      "lesson": "Indica qué buscas, dónde está la clave y qué columna devuelve el resultado. Usa rangos alineados y una referencia fija al copiar. Según idioma, el nombre visible puede ser BUSCARX o XLOOKUP.",
      "example": "Si A2:A8 contiene códigos, B2:B8 precios y D2 el código solicitado, usa BUSCARX(D2;$A$2:$A$8;$B$2:$B$8;\"No encontrado\").",
      "questions": [
        {
          "question": "¿Cuál es el rango de retorno en el ejemplo?",
          "options": [
            "$B$2:$B$8",
            "$A$2:$A$8",
            "D2"
          ],
          "correct": 0,
          "explanation": "El rango de retorno contiene los precios."
        },
        {
          "question": "¿Qué mantienes fijo al copiar hacia abajo?",
          "options": [
            "Los rangos del catálogo",
            "El código D2 de cada fila",
            "El resultado numérico"
          ],
          "correct": 0,
          "explanation": "El catálogo permanece y el código de entrada varía."
        },
        {
          "question": "¿Qué modo corresponde a códigos?",
          "options": [
            "Coincidencia exacta",
            "Aproximación sin importar orden",
            "Comodines por defecto"
          ],
          "correct": 0,
          "explanation": "Cada código tiene identidad propia."
        }
      ]
    },
    {
      "title": "Maneja códigos ausentes",
      "lesson": "Un código ausente no es un precio de cero. Devuelve «No encontrado», revisa el catálogo y evita mezclar esos casos con importes válidos.",
      "example": "Escribe P99, que no está en el catálogo. Verifica que el mensaje sea claro y que no puedas interpretar esa fila como venta gratuita.",
      "questions": [
        {
          "question": "¿Cómo marcas una clave que falta?",
          "options": [
            "No encontrado",
            "Precio 0",
            "Precio de la fila anterior"
          ],
          "correct": 0,
          "explanation": "Así se distingue ausencia de un valor real."
        },
        {
          "question": "Si el código sí existe pero no se encuentra, ¿qué haces?",
          "options": [
            "Comprobar formato y espacios",
            "Aceptar un precio aproximado",
            "Sumar todo el catálogo"
          ],
          "correct": 0,
          "explanation": "La corrección requiere que ambas claves coincidan."
        },
        {
          "question": "¿Qué conviene hacer con una fila sin precio antes de cerrar el total?",
          "options": [
            "Revisarla y resolver la ausencia",
            "Adivinar un precio",
            "Eliminar el catálogo"
          ],
          "correct": 0,
          "explanation": "Los importes incompletos afectan el indicador."
        }
      ]
    }
  ],
  [
    {
      "title": "Prepara la fuente de una tabla dinámica",
      "lesson": "Cada columna necesita encabezado y las medidas deben ser numéricas. Incluye todas las ventas del periodo. Una estructura en la que cada fila es una venta facilita el agrupamiento.",
      "example": "Abre la hoja Datos. Busca Región, Mes e Importe. Comprueba que hay ocho operaciones, incluida la última del rango.",
      "questions": [
        {
          "question": "¿Cuál es la unidad de cada fila?",
          "options": [
            "Una venta",
            "El total del mes",
            "La configuración de una fórmula"
          ],
          "correct": 0,
          "explanation": "Cada fila es un registro que se agregará."
        },
        {
          "question": "¿Qué comprobación evita omitir la venta final?",
          "options": [
            "Verificar que el rango llega hasta la última fila",
            "Cambiar el gráfico de color",
            "Mostrar resultados como texto"
          ],
          "correct": 0,
          "explanation": "El resumen solo conoce el rango fuente."
        },
        {
          "question": "¿Por qué Importe debe ser numérico?",
          "options": [
            "Para poder sumarlo como cantidad",
            "Para que se convierta en texto",
            "Para agruparlo como fecha"
          ],
          "correct": 0,
          "explanation": "La suma agrupa medidas numéricas."
        }
      ]
    },
    {
      "title": "Coloca Filas, Columnas, Valores y Filtros",
      "lesson": "Filas y Columnas definen grupos. Valores define la medida y su operación. Filtros restringe temporalmente lo que ves. Puedes encontrar estas áreas en el panel de campos de Excel o en el editor de Sheets.",
      "example": "Para responder cuánto vendió cada región por mes, coloca Región en Filas, Mes en Columnas e Importe en Valores con SUMA.",
      "questions": [
        {
          "question": "¿Qué va en Columnas para comparar periodos?",
          "options": [
            "Mes",
            "Importe",
            "Región"
          ],
          "correct": 0,
          "explanation": "Cada mes aparece como una columna."
        },
        {
          "question": "¿Qué eliges en Valores para ingresos totales?",
          "options": [
            "SUMA de Importe",
            "CONTAR de Importe",
            "CONTAR de Región"
          ],
          "correct": 0,
          "explanation": "CONTAR mide operaciones; SUMA mide el importe."
        },
        {
          "question": "¿Qué control permite ver solo Norte?",
          "options": [
            "Filtro de Región",
            "Formato de moneda",
            "Orden ascendente de Mes"
          ],
          "correct": 0,
          "explanation": "Un filtro restringe las filas visibles del resumen."
        }
      ]
    },
    {
      "title": "Valida totales y comunica el resultado",
      "lesson": "Compara el total general con la suma de la fuente. Si cambias la fuente, actualiza el resumen o confirma el alcance del rango. Excluye totales generales al crear un gráfico de categorías.",
      "example": "Si dos categorías suman 200 y 350, el total es 550. Grafica solo ambas categorías para evitar que 550 parezca una tercera categoría.",
      "questions": [
        {
          "question": "Si los totales no cuadran, ¿qué revisas?",
          "options": [
            "Rango, filtros y agregación",
            "Color de fondo",
            "Nombre del archivo"
          ],
          "correct": 0,
          "explanation": "Esos ajustes cambian los datos resumidos."
        },
        {
          "question": "¿Qué excluyes de un gráfico de categorías?",
          "options": [
            "La fila Total general",
            "Todas las categorías",
            "La serie de importes"
          ],
          "correct": 0,
          "explanation": "El total agrupa todas las categorías."
        },
        {
          "question": "¿Qué gráfico compara regiones por mes?",
          "options": [
            "Columnas agrupadas",
            "Un único gráfico circular con todos los totales",
            "Un mapa sin valores"
          ],
          "correct": 0,
          "explanation": "Las columnas permiten comparar series por periodo."
        }
      ]
    }
  ],
  [
    {
      "title": "Define la pregunta y los indicadores",
      "lesson": "Un tablero responde una pregunta concreta. Cada indicador debe tener unidad, periodo y una definición reproducible. Elige solo métricas que ayuden a tomar una decisión.",
      "example": "Pregunta: ¿qué región aportó más al trimestre? Muestra ventas totales, participación de la región líder y el nombre de esa región.",
      "questions": [
        {
          "question": "¿Con qué empiezas el tablero?",
          "options": [
            "La pregunta de negocio",
            "El color de los botones",
            "El gráfico más llamativo"
          ],
          "correct": 0,
          "explanation": "La pregunta define indicadores y visualizaciones."
        },
        {
          "question": "¿Cómo calculas participación?",
          "options": [
            "Categoría dividida entre total",
            "Total dividido entre categoría",
            "Categoría más total"
          ],
          "correct": 0,
          "explanation": "La porción se mide respecto al conjunto."
        },
        {
          "question": "¿Qué acompañaría al indicador de ventas?",
          "options": [
            "La unidad y el periodo",
            "Una contraseña",
            "El ancho de la hoja"
          ],
          "correct": 0,
          "explanation": "El lector necesita saber qué mide y cuándo."
        }
      ]
    },
    {
      "title": "Elige un gráfico y verifica el mensaje",
      "lesson": "Usa barras para categorías y líneas para una secuencia temporal. Mantén títulos informativos y unidades claras. Escoge el rango correcto para evitar duplicar totales.",
      "example": "Compara dos regiones con barras. Para una serie mensual ordenada, usa una línea que muestre ascensos y descensos.",
      "questions": [
        {
          "question": "¿Qué gráfico ayuda a ver tendencia mensual?",
          "options": [
            "Línea",
            "Tarjeta de un solo valor",
            "Tabla sin meses"
          ],
          "correct": 0,
          "explanation": "Una línea muestra el cambio a lo largo del tiempo."
        },
        {
          "question": "¿Por qué conviene incluir la unidad en el eje?",
          "options": [
            "Aclara qué representan los valores",
            "Hace que el total suba",
            "Reemplaza las etiquetas"
          ],
          "correct": 0,
          "explanation": "Pesos, unidades y porcentajes se interpretan distinto."
        },
        {
          "question": "¿Qué ocurre si incluyes el total como otra región?",
          "options": [
            "Distorsiona la comparación",
            "Aumenta el detalle de cada región",
            "Recalcula el origen"
          ],
          "correct": 0,
          "explanation": "El total agrupa las regiones y no es una categoría comparable."
        }
      ]
    },
    {
      "title": "Comprueba, documenta y entrega el proyecto",
      "lesson": "Antes de presentar, verifica los totales contra la fuente, confirma filtros y señala si faltan datos. Acompaña el tablero con una conclusión breve y sostenible con evidencia.",
      "example": "Si Costa aporta 300 de un total de 500, explica: «Costa concentró 60 % del total del periodo». Revisa que el filtro de fecha esté visible.",
      "questions": [
        {
          "question": "¿Qué prueba asegura que el tablero coincide con los registros?",
          "options": [
            "Conciliar totales con la fuente",
            "Cambiar títulos a negrita",
            "Copiar el gráfico"
          ],
          "correct": 0,
          "explanation": "La comparación revela omisiones o dobles conteos."
        },
        {
          "question": "¿Qué conclusión concuerda con 300 de 500?",
          "options": [
            "Costa aportó 60 %",
            "Costa aportó 30 %",
            "Costa aportó 150 %"
          ],
          "correct": 0,
          "explanation": "300 dividido entre 500 es 0,60."
        },
        {
          "question": "¿Qué explicas si hay datos faltantes?",
          "options": [
            "La limitación y su efecto posible",
            "Un total inventado",
            "Solo el nombre del autor"
          ],
          "correct": 0,
          "explanation": "Los lectores deben saber qué parte del resultado está incompleta."
        }
      ]
    }
  ]
];

const officialExamples = [
  [
    "Primeros pasos en Excel",
    "https://support.microsoft.com/es-es/accessibility/excel/basic-tasks-using-a-screen-reader-with-excel",
    "Formato de números, fechas y monedas",
    "https://support.google.com/docs/answer/56470?hl=es"
  ],
  [
    "Ejemplos de fórmulas de Excel para la Web",
    "https://support.microsoft.com/en-us/excel/overview-of-formulas-in-excel-for-the-web",
    "Añadir fórmulas y funciones",
    "https://support.google.com/docs/answer/46977?hl=es"
  ],
  [
    "Ejemplos de la función SUMA",
    "https://support.microsoft.com/en-us/excel/functions/sum-function",
    "Ejemplo de suma, promedio y recuento",
    "https://support.google.com/docs/answer/66032?hl=es"
  ],
  [
    "Ordenar el rango completo en Excel",
    "https://support.microsoft.com/en-us/excel/sort-data-in-a-range-or-table-in-excel",
    "Filtrar datos con una hoja de ejemplo",
    "https://support.google.com/docs/answer/3540681?hl=es"
  ],
  [
    "Ejemplos de SUMAR.SI",
    "https://support.microsoft.com/en-us/excel/functions/sumif-function",
    "Ejemplos de SUMAR.SI",
    "https://support.google.com/docs/answer/3093583?hl=es"
  ],
  [
    "Ejemplos de BUSCARX",
    "https://support.microsoft.com/en-gb/excel/functions/xlookup-function",
    "Ejemplos de XLOOKUP",
    "https://support.google.com/docs/answer/12405947?hl=es"
  ],
  [
    "Crear una tabla dinámica en Excel",
    "https://support.microsoft.com/en-gb/excel/get-started/create-a-pivottable-to-analyze-worksheet-data",
    "Crear una tabla dinámica en Google Sheets",
    "https://support.google.com/docs/answer/1272900?hl=es"
  ],
  [
    "Construir un gráfico en Excel para la Web",
    "https://support.microsoft.com/en-us/excel/get-started/create-a-chart-from-start-to-finish",
    "Crear y editar gráficos",
    "https://support.google.com/docs/answer/63824?hl=es"
  ]
];

const appliedQuestions = [
  [
    {
      "question": "Un código de cliente 0027 se convirtió en 27. ¿Cómo evitas que se pierda el prefijo al capturarlo?",
      "options": [
        "Guarda la columna como texto antes de escribir el código",
        "Aplica formato de moneda",
        "Redondea el valor"
      ],
      "correct": 0,
      "explanation": "El identificador se conserva completo cuando la columna se trata como texto."
    },
    {
      "question": "Compras registradas en una sola celda mezclan fecha, proveedor e importe. ¿Qué diseño facilita el análisis?",
      "options": [
        "Una columna por campo y una fila por compra",
        "Una hoja por importe",
        "Una celda por proveedor con todos sus importes"
      ],
      "correct": 0,
      "explanation": "Una tabla estructurada permite sumar y filtrar por campo."
    }
  ],
  [
    {
      "question": "En H1 está el impuesto y en F2:F10 los subtotales. ¿Qué fórmula de G2 puedes copiar hacia abajo?",
      "options": [
        "=F2*$H$1",
        "=$F$2*H1",
        "=$F$2*$H$1"
      ],
      "correct": 0,
      "explanation": "El subtotal cambia por fila y el impuesto permanece fijo."
    },
    {
      "question": "Un precio de 100 recibe primero un descuento del 20 % y luego un recargo del 10 %. ¿Cuánto queda?",
      "options": [
        "88",
        "90",
        "110"
      ],
      "correct": 0,
      "explanation": "100 × 0,80 × 1,10 = 88."
    }
  ],
  [
    {
      "question": "Tres sucursales reportan 50, 0 y 100 unidades; una cuarta aún no reporta. ¿Cuál es la media de valores confirmados?",
      "options": [
        "50",
        "37,5",
        "75"
      ],
      "correct": 0,
      "explanation": "La media usa tres valores confirmados, incluido el cero."
    },
    {
      "question": "El rango incluye valores 10, 20 y un subtotal 30. ¿Cuál es el total correcto de los registros?",
      "options": [
        "30",
        "60",
        "20"
      ],
      "correct": 0,
      "explanation": "El subtotal 30 ya resume los dos registros."
    }
  ],
  [
    {
      "question": "Filtras Pendiente y Sur. Deseas ver todos los pendientes. ¿Qué haces?",
      "options": [
        "Quitar el filtro Sur y conservar Pendiente",
        "Quitar Pendiente y conservar Sur",
        "Borrar todas las filas filtradas"
      ],
      "correct": 0,
      "explanation": "Así mantienes la condición de estado y abres todas las regiones."
    },
    {
      "question": "Un pedido aparece dos veces con el mismo ID pero importes distintos. ¿Qué haces primero?",
      "options": [
        "Investigar la discrepancia antes de eliminar",
        "Borrar la última fila automáticamente",
        "Cambiar los importes a cero"
      ],
      "correct": 0,
      "explanation": "Coincidir en ID permite detectar el conflicto, pero aún hay que confirmar el registro válido."
    }
  ],
  [
    {
      "question": "Debes calcular el total de ventas de la región Centro. ¿Qué campos usa SUMAR.SI?",
      "options": [
        "Región como criterio e Importe como rango de suma",
        "Importe como criterio y Mes como rango de suma",
        "Solo el rango Región"
      ],
      "correct": 0,
      "explanation": "Cada región se contrasta con Centro y se suman los importes coincidentes."
    },
    {
      "question": "Con calificaciones 79, 80 y 95, ¿cuántas cumplen el criterio >=80?",
      "options": [
        "2",
        "1",
        "3"
      ],
      "correct": 0,
      "explanation": "80 y 95 cumplen la condición."
    }
  ],
  [
    {
      "question": "Un código de pedido está en C4. El catálogo tiene códigos en A2:A20 y precios en D2:D20. ¿Qué rangos corresponden?",
      "options": [
        "Buscar C4 en A2:A20 y devolver D2:D20",
        "Buscar C4 en D2:D20 y devolver A2:A20",
        "Buscar todo C4:C20 en los precios"
      ],
      "correct": 0,
      "explanation": "La clave y el valor de retorno ocupan columnas distintas."
    },
    {
      "question": "¿Por qué dos filas con el mismo código y precios distintos invalidan el catálogo para una búsqueda exacta?",
      "options": [
        "El código deja de identificar un único precio",
        "BUSCARX siempre suma ambos precios",
        "La tabla se vuelve solo lectura"
      ],
      "correct": 0,
      "explanation": "El resultado depende de qué coincidencia se devuelve."
    }
  ],
  [
    {
      "question": "Una tabla dinámica muestra 8, pero los importes de origen suman 820. ¿Qué revisarías?",
      "options": [
        "Si Valores usa CONTAR en vez de SUMA",
        "El tamaño del texto de las etiquetas",
        "Si la moneda tiene decimales"
      ],
      "correct": 0,
      "explanation": "El 8 puede ser la cantidad de ventas en lugar de su importe total."
    },
    {
      "question": "Quieres comparar ventas por región y por mes en un mismo resumen. ¿Cómo organizas los campos?",
      "options": [
        "Región en Filas, Mes en Columnas y SUMA de Importe en Valores",
        "Importe en Filas, Región en Valores y Mes como título",
        "Mes en Filtros e Importe en Filas, sin Valores"
      ],
      "correct": 0,
      "explanation": "Los dos campos categóricos crean el cruce y el importe se agrega."
    }
  ],
  [
    {
      "question": "Costa suma 420 y Centro 280. ¿Qué porcentaje representa Costa del total?",
      "options": [
        "60 %",
        "42 %",
        "66,7 %"
      ],
      "correct": 0,
      "explanation": "420 / 700 = 0,60."
    },
    {
      "question": "El tablero indica que la venta subió, pero cambió el filtro de un mes a tres. ¿Cómo compruebas la conclusión?",
      "options": [
        "Compara periodos equivalentes y revisa los filtros",
        "Acepta el gráfico sin revisar",
        "Cambia el color de la serie"
      ],
      "correct": 0,
      "explanation": "La duración de cada periodo debe ser comparable."
    }
  ]
];

const finalQuestions = [
  {
    "question": "Tu lista tiene una columna Código con valor 0042 y otra Importe con 42000. ¿Cómo las guardas?",
    "options": [
      "Código como texto e Importe como número",
      "Ambas como números",
      "Ambas como moneda"
    ],
    "correct": 0,
    "explanation": "El código debe conservar su prefijo, mientras el importe necesita operaciones."
  },
  {
    "question": "Se registran 12 compras de 4 proveedores. ¿Cuántas filas de datos debería tener la tabla?",
    "options": [
      "12",
      "4",
      "1"
    ],
    "correct": 0,
    "explanation": "Cada fila representa una compra, aunque el proveedor se repita."
  },
  {
    "question": "Para una fórmula copiada hacia abajo, B2 es el importe y F1 contiene una tasa fija. ¿Cuál es correcta?",
    "options": [
      "=B2*$F$1",
      "=$B$2*F1",
      "=B2*F1"
    ],
    "correct": 0,
    "explanation": "La fila del importe cambia y la celda de tasa debe quedar fija."
  },
  {
    "question": "En B2 hay 80, en C2 hay 20 y quieres dividir la suma por 4. ¿Qué fórmula entrega 25?",
    "options": [
      "=(B2+C2)/4",
      "=B2+C2/4",
      "=B2/(C2+4)"
    ],
    "correct": 0,
    "explanation": "Los paréntesis obligan a sumar antes de dividir."
  },
  {
    "question": "Cuatro observaciones son 6, 12, cero y una celda vacía. ¿Cuál es el promedio de las registradas?",
    "options": [
      "6",
      "4,5",
      "9"
    ],
    "correct": 0,
    "explanation": "La suma es 18 y hay tres valores numéricos."
  },
  {
    "question": "El panel debe detectar el menor valor observado de 3, 28 y 16. ¿Qué operación elegirías?",
    "options": [
      "MIN",
      "MAX",
      "PROMEDIO"
    ],
    "correct": 0,
    "explanation": "MIN identifica 3, el menor valor."
  },
  {
    "question": "Al filtrar Completado desaparece una venta pendiente. ¿Cómo la vuelves a ver?",
    "options": [
      "Quita el filtro del estado",
      "Elimina filas ocultas",
      "Crea otro pedido"
    ],
    "correct": 0,
    "explanation": "La fila sigue en los datos aunque el filtro la oculte."
  },
  {
    "question": "El estado se escribe como Abierto, abierto y Ab. ¿Qué usarías para evitar variantes nuevas?",
    "options": [
      "Validación con lista desplegable",
      "Ordenar por importe",
      "Formato de fecha"
    ],
    "correct": 0,
    "explanation": "Una lista restringe los valores capturados."
  },
  {
    "question": "Las notas son 68, 70 y 94. ¿Qué devuelve CONTAR.SI con criterio >=70?",
    "options": [
      "2",
      "1",
      "164"
    ],
    "correct": 0,
    "explanation": "El 70 y el 94 cumplen la condición."
  },
  {
    "question": "Oeste vendió 10 y 30, Este vendió 50. ¿Qué devuelve SUMAR.SI para Oeste?",
    "options": [
      "40",
      "2",
      "90"
    ],
    "correct": 0,
    "explanation": "Solo suma los importes de Oeste."
  },
  {
    "question": "El código P07 existe pero llega como « P07 ». ¿Qué revisarías antes de cambiar la coincidencia?",
    "options": [
      "Los espacios sobrantes en el código",
      "El orden de la columna precio",
      "La escala del gráfico"
    ],
    "correct": 0,
    "explanation": "La búsqueda exacta compara la clave completa."
  },
  {
    "question": "Si no existe una clave de producto, ¿cómo conservas la distinción entre falta de precio y precio de cero?",
    "options": [
      "Usa el resultado alternativo «No encontrado»",
      "Devuelve 0 en ambos casos",
      "Usa el precio más cercano"
    ],
    "correct": 0,
    "explanation": "Un mensaje indica una búsqueda sin coincidencia."
  },
  {
    "question": "Una tabla dinámica muestra cantidad de pedidos, pero piden el total facturado. ¿Qué cambias?",
    "options": [
      "Configura SUMA de Importe en Valores",
      "Cambia el encabezado a Facturación",
      "Ordena Región alfabéticamente"
    ],
    "correct": 0,
    "explanation": "Hay que sumar el dinero en vez de contar registros."
  },
  {
    "question": "El total del resumen bajó luego de ocultar una región mediante el filtro. ¿Cómo compruebas el total consolidado?",
    "options": [
      "Quita el filtro y contrasta con la suma de la fuente",
      "Añade manualmente el valor anterior",
      "Cambia la fuente de letra"
    ],
    "correct": 0,
    "explanation": "El filtro puede afectar qué registros se agregan."
  },
  {
    "question": "Un tablero compara ventas por mes de enero a junio. ¿Qué visual favorece entender la tendencia?",
    "options": [
      "Una línea con meses en orden",
      "Un gráfico circular por mes",
      "Una barra de total sin fechas"
    ],
    "correct": 0,
    "explanation": "La línea conecta una secuencia temporal."
  },
  {
    "question": "La región Norte aporta 90 de un total de 360. ¿Qué dato publicarías como participación?",
    "options": [
      "25 %",
      "40 %",
      "90 %"
    ],
    "correct": 0,
    "explanation": "90 dividido entre 360 equivale a 0,25."
  }
];

export const partKinds = ['part:1','part:2','part:3'];

export function moduleOutline(module) {
  const [excelTitle,excelUrl,sheetsTitle,sheetsUrl] = officialExamples[module.id - 1];
  return {
    examples: [
      {platform:'Excel Online',title:excelTitle,url:excelUrl},
      {platform:'Google Sheets',title:sheetsTitle,url:sheetsUrl}
    ],
    parts: partsByModule[module.id - 1].map(({title,lesson,example},i) => ({
      kind:partKinds[i],title,lesson,example
    })),
    unitQuestionCount: module.id === 8 ? finalQuestions.length
      : module.questions.length + appliedQuestions[module.id - 1].length
  };
}

export function examQuestions(moduleId, kind) {
  const part = partKinds.indexOf(kind);
  if (part >= 0) return partsByModule[moduleId - 1][part].questions;
  if (kind !== 'long') return null;
  if (moduleId === 8) return finalQuestions;
  return [...modules[moduleId - 1].questions, ...appliedQuestions[moduleId - 1]];
}
