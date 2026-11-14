# ER documental MongoDB — APDAF SPORT

```mermaid
erDiagram
    RESENAS ||--o{ REPORTES_RESENAS : "resenaId -> _id"
    RESENAS {
        objectId _id PK
        int productoId "PG: productos.id"
        int usuarioId "PG: usuarios.id"
        int puntuacion
        string comentario
        array imagenes "embebido"
        object respuestaEmpresa "embebido"
        string estado
        date createdAt
        date updatedAt
    }
    REPORTES_RESENAS {
        objectId _id PK
        objectId resenaId FK
        int usuarioId "PG: usuarios.id"
        string motivo
        string detalle
        string estado
        date createdAt
        date updatedAt
    }
```

## Convenciones del diagrama

- `imagenes` y `respuestaEmpresa` están embebidos dentro de cada documento `resenas`.
- `productoId` y `usuarioId` no son claves foráneas de MongoDB: son referencias lógicas a PostgreSQL.
- `reportes_resenas.resenaId` referencia el `_id` de `resenas` dentro de MongoDB.
- `reportes_resenas` permanece como colección aparte porque sus documentos se crean, revisan y resuelven independientemente de la reseña.
