# Valeria: pruebas y evidencias del Hito 3

Revisión del 14 de noviembre de 2026. Seguimiento: [Issue #17](https://github.com/valemiii/Lab1_Mini_API/issues/17).
Entrega parcial: no se declara completo el Hito 3 ni la entrega grupal.

## Preparación y resultados reales

- Rama creada desde `main`, actualizado por avance rápido con `origin/main` tras `git fetch origin`. Base: `7f78795`.
- El POST de Samuel y el playground de Daniel están integrados. Se conserva PostgreSQL, Prisma y la Unidad 1.
- `npm ci --no-audit --no-fund`: finalizó correctamente (138 paquetes). Avisó de scripts de instalación de Prisma pendientes de autorización.
- Lockfile: mongoose 9.11.4 y validator 13.15.35. Las dependencias ya estaban fijadas a esas versiones exactas; no fue necesario cambiarlas.
- Sintaxis del arranque, modelo y servicio: correcta. Las tres solicitudes JSON y sus scripts Postman también tienen sintaxis válida. Esto no equivale a ejecutar la colección.
- Inspección de `server.js`: espera MongoDB y PostgreSQL antes de `listen`; el bloque de error termina el proceso. Falta comprobarlo con servicios reales.
- `.env` no existe localmente, no está rastreado y está excluido por `.gitignore`. `.env.example` incluye `MONGODB_URI` con `authSource=admin` y credenciales locales de ejemplo. Sus otros marcadores requieren configuración local.
- `docker compose up -d mongodb`: no pudo iniciarse inicialmente porque el motor no estaba activo; el intento restringido posterior encontró permisos insuficientes. No se borraron volúmenes ni se ejecutó el seed.
- `npm run dev`: no inició inicialmente porque faltaba generar Prisma. `npm run db:generate` después generó correctamente Prisma Client 6.19.3. El arranque posterior con `node src/server.js` terminó con código 1 por ausencia de `JWT_SECRET`, sin iniciar escucha HTTP.
- Docker Desktop se inició en segundo plano. El intento con acceso al motor creó el contenedor `grupal-mongodb-1`, su volumen y red, pero no pudo arrancarlo: el puerto 27018 ya pertenece a `espe-mongo`. No se detuvo ni modificó ese servicio; el nuevo contenedor quedó detenido. Resolver localmente usando la conexión existente autorizada o acordando otro puerto, sin borrar datos.
- No hay credenciales configuradas ni UUID confirmados de PostgreSQL. No se inventaron referencias.
- No se ejecutaron Runner/Newman, pruebas HTTP ni regresión de la Unidad 1. No se afirma que estén en verde.
- No se dispone de herramienta de interacción con Compass: captura real pendiente.
- Repositorio público según GitHub API. El Issue #17 no tenía comentarios al revisarlo. No se verificó acceso efectivo del docente.

## Colección y ejecución reproducible

Archivo: `postman/G1_U2_Hito3_Valeria.postman_collection.json`.
El kit no está disponible en el repositorio. Es una colección equivalente adaptada de la colección existente de Samuel, sin modificar su archivo.

1. Configurar un `.env` local con PostgreSQL, JWT_SECRET de al menos 32 caracteres y MongoDB. No publicarlo.
2. Iniciar Docker y ejecutar `docker compose up -d mongodb`. Ejecutar `npm ci`, `npm run db:generate` y `npm run dev`. No ejecutar el seed sobre la base compartida.
3. Consultar registros existentes en PostgreSQL: `SELECT uuid FROM products LIMIT 1;` y `SELECT uuid FROM users LIMIT 1;`. Configurar `productoId`, `usuarioId` y `baseUrl` en Postman. No exportar secretos.
4. Importar la colección de Valeria y ejecutar sus tres solicitudes juntas en Collection Runner. Alternativa con Newman instalado: `newman run postman/G1_U2_Hito3_Valeria.postman_collection.json --env-var baseUrl=http://localhost:3000 --env-var productoId=UUID_REAL_PRODUCTO --env-var usuarioId=UUID_REAL_USUARIO --reporters cli,json --reporter-json-export RUTA_LOCAL_RESULTADO.json`.
5. Confirmar 201 con `_id`, referencias, imágenes, calificación, fecha, estado, virtual `estrellas` y comentario sin espacios exteriores. Confirmar 400 con campo y mensaje específico para calificación 6 y comentario corto. Los dos casos inválidos reutilizan referencias válidas.
6. Revisar el informe antes de publicarlo: puede contener cuerpos e identificadores. Registrar conteos reales de solicitudes, aserciones y fallos; no sustituirlo por peticiones sueltas.
7. Abrir Compass con la conexión local, base `apdaf_sport`, colección `resenas`. Filtrar `{ _id: ObjectId("ID_DEVUELTO") }` usando `resenaCreadaId` de Postman. Mostrar documento, comentario normalizado y fecha; el virtual no se almacena en MongoDB. Guardar captura real como `docs/u2/valeria-compass-resenas.png`, sin URI ni datos personales innecesarios.

El POST MongoDB actual no exige token en su ruta; esta colección respeta esa configuración y no modifica controles. El módulo previo `/products/:id/reviews` es distinto, usa PostgreSQL y exige autenticación para crear. No se trasladan sus reglas automáticamente. La colección crea una reseña válida por ejecución y no elimina documentos ajenos.

## Pendientes externos: Bri, Issue #14

No se modificaron sus documentos ni el ER.

1. Crear `hito2.md` con workload: actor, operación, lectura/escritura y frecuencia; incluir creación/consulta de reseñas y revisión de reportes. Identificar estimaciones.
2. Completar tabla de embeber/referenciar con las tres preguntas exactas de la plantilla, no disponible aquí.
3. Justificar `imagenes` y `respuestaEmpresa` embebidos.
4. Explicar UUID lógicos `productoId` y `usuarioId` hacia PostgreSQL y `reportes_resenas.resenaId → resenas._id` dentro de MongoDB.
5. Elaborar y enlazar ER MongoDB con embebidos, reportes aparte y referencias externas distinguibles.
6. Corregir Hito 1: `clienteId` numérico → `usuarioId` UUID; `productoId` numérico → UUID; `fecha` → `fechaCreacion`; `respuestaNegocio` → `respuestaEmpresa`.
7. Alinear la descripción de reportes: el playground implementa moderación con motivo/estado, no resultados de análisis.
8. Revisar nombres, tipos y reglas con Daniel y Samuel.

Estos pendientes no bloquean ejecutar Postman, capturar Compass o publicar este PR si el entorno funciona.

## Coordinación y cierre pendiente de Valeria

- Compartir con Samuel y Daniel la disponibilidad real de MongoDB y UUID existentes cuando se confirme el entorno. No se enviaron mensajes ni comentarios externos.
- Confirmar con Samuel el alcance de autenticación de `/api/resenas`, que actualmente acepta `usuarioId` del cuerpo sin middleware de autenticación; no se cambió su ruta.
- Daniel usa validador BSON `int` para calificación; Samuel usa Number entero de Mongoose. Verificar compatibilidad con la colección validada al ejecutar de verdad. No se ejecutó el playground porque elimina las dos colecciones de práctica al comenzar.
- No se confirmó ningún fallo funcional mediante ejecución de bases; las observaciones anteriores quedan para sus responsables, sin completar su implementación.
- Completar Runner, captura y regresión U1 con el entorno configurado.
- No hay etiquetas locales ni remotas `u2-hito-1`, `u2-hito-2` o `u2-hito-3` al revisar. No se crearon etiquetas: faltan verificaciones y documentación. Tras merge, verificar el commit final y publicar `u2-hito-3` solo cuando esté completo; Hitos 1 y 2 también requieren revisión de sus entregables antes de etiquetar.
- PR borrador con `Refs #17`, sin cerrar el Issue y sin merge automático. Enviar manualmente el enlace en Moodle; no se realizó entrega.
