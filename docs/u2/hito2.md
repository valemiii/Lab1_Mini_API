# Hito 2 — Workload y decisiones de modelado MongoDB

**Base:** `apdaf_sport`  
**Colecciones:** `resenas` y `reportes_resenas`  
**Recurso:** `/api/resenas`

> **Estado del hito:** documentación alineada con la implementación actual y revisada por Valeria; contrastada con `LabU2_Kit.zip` (Descargas), plantillas de Hitos 1 y 2 y colección de Hito 3.

## 1. Workload

Las frecuencias son estimaciones para la primera versión, porque no existen métricas reales de uso.

El workload incluye operaciones previstas. Esta Parte 1 implementa únicamente `POST /api/resenas` en MongoDB; las consultas y la moderación no implican que existan endpoints adicionales. Los actores describen el uso previsto: la ruta POST actual no incorpora middleware de autenticación y valida la existencia del UUID de usuario recibido.

| Actor | Operación | Lectura o escritura | Frecuencia (por día/hora) | Datos que usa |
|---|---|---|---|---|
| Cliente | Crear reseña (implementada: POST) | Escritura MongoDB y lectura PostgreSQL | 10–30/día | resenas; products.uuid, users.uuid |
| Visitante | Consultar por producto (prevista) | Lectura | 100–300/día | productoId, comentario, calificacion, imagenes, respuestaEmpresa, estado |
| Cliente | Consultar sus reseñas (prevista) | Lectura | 10–40/día | usuarioId y documento resenas |
| Personal | Responder/moderar (prevista) | Escritura | 5–20/día | respuestaEmpresa, estado |
| Cliente | Crear reporte (prevista; ejemplo en playground) | Escritura | 0–10/día | resenaId, motivo, estado, fechaReporte |
| Personal | Revisar reportes (prevista; lookup en playground) | Lectura | 1–10/día | reportes_resenas y resenas |
| Personal | Resolver reporte (prevista) | Escritura | 0–10/día | reportes_resenas.estado |

Todas las frecuencias anteriores son estimaciones, no mediciones. Imágenes y respuesta se leen en las consultas previstas de reseñas, sin frecuencia adicional.

## 2. Embeber o referenciar

Comparación realizada con las seis columnas exactas de la plantilla del kit:

| Relación | Cardinalidad | ¿Se lee junto? | ¿Cambia seguido? | ¿Crece sin límite? | Decisión |
|---|---|---|---|---|---|
| Reseña e imágenes | 1:0..5 | Sí, detalle previsto | No, contenido dependiente | No, máximo 5 URL | Embebida: arreglo imagenes |
| Reseña y respuesta de la empresa | 1:0..1 | Sí, detalle previsto | Ocasionalmente, al responder | No, un objeto y mensaje hasta 1000 caracteres | Embebida: respuestaEmpresa sin _id |
| Reseña y producto de PostgreSQL | N:1 | Solo UUID al crear; detalle de producto separado | Stock y datos cambian independientemente | No dentro de la reseña; muchas reseñas por producto | Referenciada lógicamente: productoId → products.uuid |
| Reseña y usuario de PostgreSQL | N:1 | Solo UUID al crear; perfil separado | Perfil cambia independientemente | No dentro de la reseña; muchas reseñas por usuario | Referenciada lógicamente: usuarioId → users.uuid |
| Reseña y reportes de reseña | 1:N | Al revisar reportes mediante lookup | Sí, revisión independiente prevista | Sí, sin límite definido de reportes | Referenciada entre colecciones: reportes_resenas.resenaId → resenas._id |

### Decisiones resultantes

- **Embeber `imagenes`:** arreglo opcional de hasta cinco cadenas URL HTTP/HTTPS. Se muestra con la reseña, tiene crecimiento acotado y no necesita una entidad independiente. Se embeben las URL, no los archivos binarios.
- **Embeber `respuestaEmpresa`:** objeto opcional con `mensaje` y `fecha`, sin `_id` propio. Corresponde como máximo a una respuesta de esa reseña y se consulta en el mismo detalle; su tamaño está acotado por el límite de 1000 caracteres del mensaje.
- **Referenciar `productoId` y `usuarioId`:** cadenas UUID con referencias lógicas a `products.uuid` y `users.uuid` en PostgreSQL. Sus claves primarias internas `id` siguen siendo enteros. El servicio consulta ambos UUID antes de guardar; MongoDB no impone integridad referencial entre motores ni duplica los datos maestros.
- **Referenciar `reportes_resenas.resenaId → resenas._id`:** ambos campos son BSON `ObjectId`. Los reportes tienen ciclo de vida independiente y evitan que un arreglo de reportes crezca dentro de la reseña. El playground obtiene `_id` de reseñas existentes y demuestra la relación mediante `$lookup` y `$unwind`. El tipo del validador no garantiza por sí solo la existencia de la reseña; un futuro servicio de reportes deberá comprobarla.

El playground define `reportes_resenas` con `_id`, `resenaId`, `motivo` (5–500 caracteres), `estado` (`pendiente`, `revisado`, `descartado`) y `fechaReporte` de tipo fecha. No incluye `usuarioId`, `detalle`, `createdAt`, `updatedAt` ni un campo de resolución. En `resenas`, el enum es `pendiente`, `publicada`, `oculta`.

## 3. ER documental de MongoDB

El diagrama se encuentra en [diagrama-er-mongodb.md](./diagrama-er-mongodb.md). Distingue las referencias lógicas externas hacia PostgreSQL con la etiqueta `PG` y muestra los datos embebidos dentro de `resenas`.

## 4. Revisión y control de consistencia

- [x] Se documentó el workload con actor, operación, lectura/escritura y frecuencia estimada.
- [x] Se completaron las cinco relaciones con las seis columnas exactas del kit.
- [x] Se contrastó la tabla con la plantilla original de `LabU2_Kit.zip`.
- [x] Se justificó el embebido de `imagenes` y `respuestaEmpresa`.
- [x] Se documentaron las referencias lógicas a PostgreSQL.
- [x] Se documentó `reportes_resenas.resenaId → resenas._id`.
- [x] Se elaboró y enlazó el ER documental.
- [x] Valeria revisó nombres, tipos y reglas y autorizó su revisión como sustitución de la revisión pendiente con Daniel y Samuel. No se registra una aprobación de ellos.
