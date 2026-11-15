# Celda · primera base funcional
Stack: Node 22, Express, PostgreSQL, HTML/CSS/JS. Interfaz en español.
## Ejecutar
1. npm install
2. Copiar .env.example a .env y configurar PostgreSQL y APP_ORIGIN.
3. npm test && npm run check
4. npm start
El servidor crea sus cuatro tablas al arrancar. APP_ORIGIN es el origen exacto, sin barra final. En producción usar NODE_ENV=production para cookies Secure.
## Implementado
Registro e ingreso con contraseña scrypt y sesión opaca guardada como hash; separación de datos por usuario; 8 módulos con guías y ejemplos; plantillas XLSX; revisión de resultados guardados; 2 preguntas en examen corto y 4 en evaluación de unidad; intentos persistentes; calificación ponderada 30/20/50 y secuencia de módulos; informe dentro del aula. Se usa el mejor intento de cada actividad. El módulo 8 exige evaluación final >=80 y limita su nota al resultado del proyecto.
OPENAI_API_KEY activa el tutor con gpt-6-luna por defecto. OPENAI_MODEL permite cambiarlo. El tutor envía solo los errores de la rúbrica, limita la salida a 140 tokens y omite los intentos sin errores. No envía archivos ni identidad. Sin configuración o ante error del proveedor se muestra claramente la revisión por reglas.
## Límites de esta entrega
Base de desarrollo, no curso listo para estudiantes externos. No ejecutado ni probado localmente por ausencia de entorno. Revisar resultado de GitHub Actions antes de desplegar.
No se recalculan fórmulas: se leen valores almacenados en XLSX. No se verifica todavía la integridad de resultados cacheados, equivalencia de fórmulas, gráficos, tablas dinámicas, formato ni validaciones. No usar las notas para certificación hasta ampliar el evaluador. La práctica de módulos avanzados evalúa indicadores y debe enriquecerse con rúbricas de procedimiento y revisión visual.
Banco inicial pequeño; no hay aún variantes de ejercicios por intento ni evaluación larga de 20 minutos. Los ejercicios avanzados son introductorios.
Pendientes: herramientas de instructor, revisión manual, recuperación de contraseña, verificación de correo, notificaciones por email, archivos corregidos, certificado, mayor profundidad de contenidos, conexión directa con Google/Microsoft y almacenamiento de entregas originales. Actualmente se conserva informe e historial; el archivo se procesa en memoria y no se guarda.
## Despliegue previsto
Servicio web Node en Render, build npm install --omit=dev, start npm start, health /health; PostgreSQL en la misma región; variables DATABASE_URL, APP_ORIGIN, NODE_ENV, OPENAI_API_KEY y OPENAI_MODEL. El Blueprint publicado genera OWNER_SETUP_TOKEN en Render.
## Panel del dueño
Inicia sesión en el aula con la cuenta que conservará el acceso. Abre /?activar=dueno y copia el valor de OWNER_SETUP_TOKEN desde Environment en el servicio web de Render. El código se usa una vez y el panel queda asociado al ID de esa cuenta. El reporte general y el informe de cada alumno se descargan en XLSX. El archivo individual incluye el avance por módulo, los intentos y las correcciones.
## Seguridad y operación antes de lanzamiento
Cookies HttpOnly/SameSite, verificación Origin, límite de peticiones, límite de XLSX comprimido/descomprimido y consultas parametrizadas incluidos. Incluye pruebas de integración para sesiones, aislamiento entre alumnos, revisión XLSX, desbloqueo y envío único de exámenes; ampliar pruebas de límites de subida; migraciones versionadas y backups; evaluar carga antes de uso público.
