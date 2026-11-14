# Hito 2 — Workload y decisiones de modelado MongoDB

**Base:** `apdaf_sport`  
**Colecciones:** `resenas` y `reportes_resenas`  
**Recurso:** `/api/resenas`

> **Estado del hito:** documentación alineada con la implementación actual; pendiente de revisión con Daniel y Samuel y de contrastar las preguntas con la plantilla original del kit.

## 1. Workload

Las frecuencias son estimaciones para la primera versión, porque no existen métricas reales de uso.

El workload incluye operaciones previstas. Esta Parte 1 implementa únicamente `POST /api/resenas` en MongoDB; las consultas y la moderación no implican que existan endpoints adicionales. Los actores describen el uso previsto: la ruta POST actual no incorpora middleware de autenticación y valida la existencia del UUID de usuario recibido.

| Actor | Operación | Lectura / escritura | Frecuencia estimada |
|---|---|---|---|
| Cliente | Crear una reseña (`POST /api/resenas`) | Escritura en `resenas`; lectura de `products.uuid` y `users.uuid` en PostgreSQL para validar referencias | 10–30 por día |
| Cliente o visitante | Consultar reseñas por UUID de producto (previsto) | Lectura de `resenas` filtrada por `productoId` | 100–300 por día |
| Cliente autenticado | Consultar sus reseñas | Lectura de `resenas` filtrada por `usuarioId` | 10–40 por día |
| Personal de APDAF SPORT | Responder o moderar una reseña | Escritura/actualización de `respuestaEmpresa` y `estado` en `resenas` | 5–20 por día |
| Cliente o personal | Consultar imágenes y respuesta de una reseña | Lectura del documento de `resenas` | Incluida en cada consulta de detalle |
| Cliente o personal | Crear un reporte de reseña | Escritura en `reportes_resenas`, con `resenaId` | 0–10 por día |
| Personal de APDAF SPORT | Revisar reportes pendientes | Lectura de `reportes_resenas` por `estado` y `fechaReporte`, relacionada con `resenas` | 1–10 consultas por día |
| Personal de APDAF SPORT | Resolver un reporte (previsto) | Actualización de `estado` a `revisado` o `descartado` en `reportes_resenas` | 0–10 por día |

## 2. Embeber o referenciar

Se responden tres preguntas de decisión para el modelo documental. La plantilla original del kit no está disponible en el repositorio; no se ha verificado que esta sea su redacción exacta.

| Pregunta | Decisión para APDAF SPORT |
|---|---|
| ¿Los datos se consultan juntos? | Sí, una reseña se consulta junto con sus imágenes y la respuesta de la empresa; por eso esos datos se embeben en `resenas`. |
| ¿Los datos se actualizan juntos? | Normalmente sí para el contenido de la reseña, sus imágenes y `respuestaEmpresa`; se actualizan dentro del ciclo de moderación de la misma reseña. Los reportes tienen revisión independiente y no se embeben. |
| ¿La relación y el crecimiento justifican embeber? | `imagenes` y `respuestaEmpresa` son datos dependientes de una sola reseña y de tamaño acotado; se embeben. Los reportes pueden multiplicarse, tienen otro ciclo de vida y permisos, por lo que se guardan en una colección aparte y referencian la reseña. |

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
- [x] Se respondieron tres preguntas de decisión de embeber o referenciar.
- [ ] Contrastar las preguntas con la redacción exacta de la plantilla original del kit.
- [x] Se justificó el embebido de `imagenes` y `respuestaEmpresa`.
- [x] Se documentaron las referencias lógicas a PostgreSQL.
- [x] Se documentó `reportes_resenas.resenaId → resenas._id`.
- [x] Se elaboró y enlazó el ER documental.
- [ ] Daniel y Samuel revisan que nombres, tipos y reglas coincidan con la implementación final.
