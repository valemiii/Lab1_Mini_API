# Hito 1 — Selección de datos NoSQL y modelo documental

**Proyecto:** APDAF SPORT · Grupo G1  
**Base NoSQL propuesta:** MongoDB, base `apdaf_sport`  
**Colección principal:** `resenas`  
**Recurso API previsto:** `/api/resenas`  
**Alcance de esta parte:** documentar el modelo y preparar `POST /api/resenas`.

> **Estado del hito:** documentación alineada con el modelo Mongoose y el playground actuales y revisada por Valeria. El POST y la conexión MongoDB ya están implementados y cuentan con evidencias de prueba.

## 1. Selección de datos y tipo NoSQL

| Dato | ¿Por qué no encaja bien en una tabla? | Tipo NoSQL | Razón |
|---|---|---|---|
| Reseñas y valoraciones de productos | Las imágenes opcionales y la respuesta anidada exigirían tablas dependientes y joins para leer una unidad. | Documental | Una reseña reúne valoración, comentario, imágenes y una eventual respuesta de la empresa. Se consultarían juntos en el detalle previsto; actualmente `/api/resenas` solo implementa POST. El documento conserva el contenido dependiente en una unidad. |
| Personalización de uniformes | Las opciones variables por prenda producen columnas vacías o tablas auxiliares por variante. | Documental | Una solicitud puede contener talla, medidas, bordado, colores y observaciones. Un documento permite conservar esas opciones anidadas y agregar nuevas personalizaciones. Caso propuesto, sin implementación en esta parte. |
| Historial de actividad de clientes | Cada tipo de actividad tiene metadatos distintos, difíciles de representar en columnas fijas. | Documental | La actividad se registra como eventos con fecha, tipo y metadatos variables. El formato documental admite distintos tipos de evento y facilita consultas por cliente y período; su retención y particionado se definirían si el volumen crece. |

## 2. ¿Por qué `resenas` es la colección documental?

`resenas` es el primer caso de uso de esta parte porque una reseña es una unidad natural de lectura y escritura: se crea con una valoración y comentario, se consulta junto con sus imágenes y puede incorporar una respuesta de APDAF SPORT. El documento evita joins para esos datos dependientes y conserva la flexibilidad necesaria para moderación y contenido multimedia. La colección `reportes_resenas` se mantiene separada porque los reportes tienen otro ciclo de vida, permisos y frecuencia de revisión.

## 3. Documento de ejemplo

El siguiente ejemplo representa el documento almacenado mediante JSON extendido de MongoDB. Los UUID son ilustrativos: el POST requiere UUID de registros existentes en PostgreSQL. `_id` y las fechas se generan automáticamente cuando corresponde; no es necesario enviarlos al crear la reseña.

```json
{
  "_id": { "$oid": "665f1a2b9c7d4e0012345678" },
  "productoId": "11111111-1111-4111-8111-111111111111",
  "usuarioId": "22222222-2222-4222-8222-222222222222",
  "calificacion": 5,
  "comentario": "La tela es cómoda y la talla coincide con la guía.",
  "imagenes": [
    "https://cdn.example.com/resenas/665f1a2b-1.jpg"
  ],
  "respuestaEmpresa": {
    "mensaje": "¡Gracias por compartir tu experiencia!",
    "fecha": { "$date": "2026-11-14T18:30:00.000Z" }
  },
  "estado": "pendiente",
  "fechaCreacion": { "$date": "2026-11-14T17:45:00.000Z" }
}
```

Para mantener reglas simples y consistentes, `estado` usa estos valores:

- `pendiente`: reseña creada y todavía no moderada.
- `publicada`: reseña visible para los usuarios.
- `oculta`: reseña que no se muestra públicamente.

Estos valores coinciden con el enum del modelo Mongoose y del playground. Valeria autorizó su revisión final como sustitución de la revisión pendiente con Daniel y Samuel; no se atribuye aprobación a ellos. `calificacion` es un entero obligatorio de 1 a 5 y `comentario` tiene entre 10 y 1000 caracteres después del recorte de espacios. `imagenes` es opcional y admite hasta cinco URL HTTP/HTTPS. `respuestaEmpresa` es un objeto embebido opcional con `mensaje` de 1 a 1000 caracteres y `fecha`. `fechaCreacion` se asigna automáticamente y `estado` vale `pendiente` por defecto. El virtual `estrellas` se calcula al devolver JSON y no se almacena.

## 4. Datos que permanecen en PostgreSQL

PostgreSQL y Prisma conservan los datos transaccionales de Unidad 1: usuarios (`users`), productos (`products`), categorías (`categories`), perfiles (`customers`), pedidos (`orders`) y sus detalles (`order_items`), entre otros. El stock permanece en `products`. Estas operaciones requieren integridad referencial, claves únicas y transacciones consistentes. Proveedores y abastecimiento son parte del dominio previsto, pero el esquema Prisma actual no define una tabla de proveedores.

MongoDB guarda `productoId` y `usuarioId` como cadenas UUID que referencian lógicamente `products.uuid` y `users.uuid`. Las claves primarias internas de esas tablas siguen siendo enteros. El servicio comprueba ambos UUID antes de guardar; no hay una clave foránea automática entre motores ni se duplican los datos maestros. La configuración permite conservar Supabase o usar PostgreSQL local para pruebas.

## 5. Revisión y pendientes

- [x] Se documentó la tabla de tres datos NoSQL y su justificación.
- [x] Se justificó `resenas` como colección documental.
- [x] Se incluyó un JSON de ejemplo.
- [x] Se documentaron los datos que permanecen en PostgreSQL.
- [x] Revisión final de Valeria; publicación de la etiqueta sobre el commit verificado después de integrar esta revisión. No implica cerrar automáticamente el Issue #14, que también cubre el Hito 2.
- [x] POST implementado; evidencias de Runner y Compass en [valeria-pruebas-evidencias.md](./valeria-pruebas-evidencias.md).
