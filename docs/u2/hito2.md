# Hito 2 — Workload y decisiones de modelado MongoDB

**Base:** `apdaf_sport`  
**Colecciones:** `resenas` y `reportes_resenas`  
**Recurso:** `/api/resenas`

> **Estado del hito:** documentación completada para el diseño de la Parte 1. La implementación del POST no es un prerrequisito de esta documentación.

## 1. Workload

Las frecuencias son estimaciones para la primera versión, porque no existen métricas reales de uso.

| Actor | Operación | Lectura / escritura | Frecuencia estimada |
|---|---|---|---|
| Cliente autenticado | Crear una reseña (`POST /api/resenas`) | Escritura en `resenas`; valida `productoId` y `usuarioId` contra PostgreSQL | 10–30 por día |
| Cliente o visitante | Consultar reseñas por producto (`GET /api/resenas?productoId=42`) | Lectura de `resenas` | 100–300 por día |
| Cliente autenticado | Consultar sus reseñas | Lectura de `resenas` filtrada por `usuarioId` | 10–40 por día |
| Personal de APDAF SPORT | Responder o moderar una reseña | Escritura/actualización de `respuestaEmpresa` y `estado` en `resenas` | 5–20 por día |
| Cliente o personal | Consultar imágenes y respuesta de una reseña | Lectura del documento de `resenas` | Incluida en cada consulta de detalle |
| Cliente o personal | Crear un reporte de reseña | Escritura en `reportes_resenas`, con `resenaId` | 0–10 por día |
| Personal de APDAF SPORT | Revisar reportes pendientes | Lectura de `reportes_resenas` por estado y fecha | 1–10 consultas por día |
| Personal de APDAF SPORT | Resolver un reporte | Actualización de `estado`, resolución y fecha en `reportes_resenas` | 0–10 por día |

## 2. Embeber o referenciar

Se responden las tres preguntas de decisión usadas para el modelo documental:

| Pregunta | Decisión para APDAF SPORT |
|---|---|
| ¿Los datos se consultan juntos? | Sí, una reseña se consulta junto con sus imágenes y la respuesta de la empresa; por eso esos datos se embeben en `resenas`. |
| ¿Los datos se actualizan juntos? | Normalmente sí para el contenido de la reseña, sus imágenes y `respuestaEmpresa`; se actualizan dentro del ciclo de moderación de la misma reseña. Los reportes tienen revisión independiente y no se embeben. |
| ¿La relación y el crecimiento justifican embeber? | `imagenes` y `respuestaEmpresa` son datos dependientes de una sola reseña y de tamaño acotado; se embeben. Los reportes pueden multiplicarse, tienen otro ciclo de vida y permisos, por lo que se guardan en una colección aparte y referencian la reseña. |

### Decisiones resultantes

- **Embeber `imagenes`:** forman parte del contenido de una reseña, se muestran con ella y no necesitan ser consultadas como entidad independiente.
- **Embeber `respuestaEmpresa`:** corresponde como máximo a la respuesta de esa reseña, se consulta en el mismo detalle y mantiene la respuesta junto con el estado moderado.
- **Referenciar `productoId` y `usuarioId`:** son referencias lógicas a `products.id`/`productos.id` y `users.id`/`usuarios.id` en PostgreSQL. MongoDB no duplica el nombre, precio, correo ni demás datos maestros.
- **Referenciar `reportes_resenas.resenaId → resenas._id`:** ambos documentos están en MongoDB, pero el reporte tiene ciclo de vida independiente. La aplicación debe validar que la reseña exista y mantener la consistencia de esta referencia.

## 3. ER documental de MongoDB

El diagrama se encuentra en [diagrama-er-mongodb.md](./diagrama-er-mongodb.md). Distingue las referencias lógicas externas hacia PostgreSQL con la etiqueta `PG` y muestra los datos embebidos dentro de `resenas`.

## 4. Revisión y control de consistencia

- [x] Se documentó el workload con actor, operación, lectura/escritura y frecuencia estimada.
- [x] Se respondieron las tres preguntas de embeber o referenciar.
- [x] Se justificó el embebido de `imagenes` y `respuestaEmpresa`.
- [x] Se documentaron las referencias lógicas a PostgreSQL.
- [x] Se documentó `reportes_resenas.resenaId → resenas._id`.
- [x] Se elaboró y enlazó el ER documental.
- [ ] Daniel y Samuel revisan que nombres, tipos y reglas coincidan con la implementación final.
