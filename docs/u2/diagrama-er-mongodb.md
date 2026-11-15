# ER documental MongoDB — APDAF SPORT

```mermaid
erDiagram
    PG_PRODUCTS ||--o{ RESENAS : "referencia logica productoId -> uuid"
    PG_USERS ||--o{ RESENAS : "referencia logica usuarioId -> uuid"
    PG_PRODUCTS {
        string uuid UK "PostgreSQL; PK interna id entero"
    }
    PG_USERS {
        string uuid UK "PostgreSQL; PK interna id entero"
    }
    RESENAS ||--o{ REPORTES_RESENAS : "resenaId -> _id"
    RESENAS {
        objectId _id PK
        string productoId "UUID; PG: products.uuid"
        string usuarioId "UUID; PG: users.uuid"
        int calificacion "1 a 5"
        string comentario "10 a 1000 caracteres; trim"
        array imagenes "embebido opcional: hasta 5 URL HTTP-HTTPS"
        object respuestaEmpresa "embebido opcional; sin _id propio"
        string respuestaEmpresa_mensaje "campo anidado: 1 a 1000 caracteres"
        date respuestaEmpresa_fecha "campo anidado: fecha de respuesta"
        string estado "pendiente | publicada | oculta"
        date fechaCreacion "automatica"
    }
    REPORTES_RESENAS {
        objectId _id PK
        objectId resenaId FK
        string motivo "5 a 500 caracteres"
        string estado "pendiente | revisado | descartado"
        date fechaReporte
    }
```

## Convenciones del diagrama

- `imagenes` y `respuestaEmpresa` están embebidos dentro de cada documento `resenas`.
- `respuestaEmpresa_mensaje` y `respuestaEmpresa_fecha` representan las rutas anidadas `respuestaEmpresa.mensaje` y `respuestaEmpresa.fecha`; no son campos planos ni colecciones aparte. `imagenes` contiene cadenas URL, no objetos ni archivos binarios.
- Las etiquetas `PG` distinguen referencias externas hacia PostgreSQL de la relación entre colecciones MongoDB. `productoId` y `usuarioId` son cadenas UUID que apuntan a `products.uuid` y `users.uuid`; no son claves foráneas impuestas por MongoDB. PostgreSQL conserva sus claves primarias internas enteras.
- `reportes_resenas.resenaId` referencia el `_id` de `resenas` dentro de MongoDB.
- `reportes_resenas` permanece como colección aparte porque sus documentos se crean, revisan y resuelven independientemente de la reseña.
- `_id` y `resenaId` son BSON `ObjectId`; las fechas son BSON `Date`. La relación representa una reseña con cero o varios reportes. La existencia del destino requiere control de la aplicación.
- `estrellas` es un virtual de Mongoose y no aparece como dato almacenado. Se omiten metadatos de Mongoose como `__v`.
