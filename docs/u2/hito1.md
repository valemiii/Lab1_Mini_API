# Hito 1 — Selección de datos NoSQL y modelo documental

## Objetivo

Documentar la selección de los datos NoSQL y el modelo documental de APDAF SPORT. En
esta primera parte se define la colección principal `resenas`, la colección
complementaria `reportes_resenas` y el recurso API `POST /api/resenas`.

## Contexto de persistencia

- **PostgreSQL en Supabase:** conserva los datos transaccionales y relacionales:
  usuarios, productos, categorías, inventario, ventas, detalle de ventas y
  proveedores.
- **MongoDB:** utiliza la base de datos `apdaf_sport`.
- **Colección principal de esta parte:** `resenas`.
- **Segunda colección prevista:** `reportes_resenas`.
- **Recurso API:** `/api/resenas`.

## Selección de datos NoSQL

| Dato | Tipo NoSQL elegido | Justificación para APDAF SPORT |
|---|---|---|
| Reseñas y valoraciones de productos | Base documental | Cada reseña reúne en un mismo documento la referencia al producto, el cliente, la calificación, el comentario, la fecha y su estado. Estos campos pueden evolucionar —por ejemplo, agregando respuesta del negocio, fotos o moderación— sin modificar un esquema rígido. Se consulta por producto y se publica como una unidad en `resenas`. |
| Personalización de uniformes | Base documental | Las opciones de personalización pueden variar por producto o institución: talla, nombre, número, colores, bordado y observaciones. Un documento permite guardar únicamente las opciones elegidas y añadir nuevas alternativas sin llenar columnas que no aplican a todos los pedidos. |
| Historial de actividad de clientes | Almacén clave-valor | La actividad se identifica naturalmente por una clave como `clienteId` y contiene eventos o marcas de tiempo asociados. Este modelo favorece registrar y recuperar rápidamente la actividad reciente de un cliente, sin duplicar la información maestra que ya pertenece a PostgreSQL. |

La elección es por tipo de estructura y patrón de uso, no por reemplazar el modelo
relacional. MongoDB se aplicará inicialmente a las reseñas; los otros dos datos
quedan como alternativas NoSQL documentadas para futuras partes del proyecto.

## ¿Por qué `resenas` es la colección documental?

`resenas` es la colección principal porque las reseñas son contenido generado por
clientes que se consulta junto con su valoración. La unidad de lectura es una
reseña completa, por lo que resulta conveniente mantener en un documento sus
atributos relacionados: producto, cliente, calificación, comentario, fecha y
estado de publicación.

Además, el contenido puede crecer de forma controlada. Una reseña podría incorporar
una respuesta de APDAF SPORT, fotografías, etiquetas de moderación o una
actualización de estado sin alterar las tablas transaccionales de PostgreSQL.
`reportes_resenas` se reserva para agregaciones o resultados de análisis sobre las
reseñas, evitando mezclar datos derivados con el documento original.

## Documento de ejemplo

El siguiente documento representa el cuerpo conceptual de un `POST /api/resenas`.
`productoId` y `clienteId` son referencias a registros que permanecen en
PostgreSQL; MongoDB conserva el contenido flexible de la reseña.

```json
{
  "_id": {
    "$oid": "672f1a2b3c4d5e6f7890abcd"
  },
  "productoId": 18,
  "clienteId": 42,
  "calificacion": 5,
  "comentario": "La tela del uniforme deportivo es cómoda y la talla coincide con la guía.",
  "fecha": "2026-11-12T12:30:00.000Z",
  "estado": "pendiente",
  "respuestaNegocio": null
}
```

La calificación se expresa en una escala de 1 a 5 y `estado` permite controlar
la moderación antes de publicar la reseña. En el `POST`, `_id` y `fecha` pueden
ser generados por el servicio; se muestran aquí para documentar la forma final
del documento.

## Datos que permanecen en PostgreSQL

PostgreSQL en Supabase mantiene:

- **Usuarios**, porque son datos maestros con identidad, autenticación y
  relaciones con otras operaciones.
- **Productos y categorías**, porque forman el catálogo estructurado y las
  relaciones de clasificación.
- **Inventario**, porque requiere consistencia para existencias y disponibilidad.
- **Ventas y detalle de ventas**, porque son operaciones transaccionales que
  necesitan relaciones, integridad referencial y consultas consistentes.
- **Proveedores**, porque son entidades maestras relacionadas con el abastecimiento.

Esta separación evita duplicar información sensible o transaccional en MongoDB.
La reseña solo guarda las referencias `productoId` y `clienteId`; cuando se
requieren datos completos del producto o del usuario, el servicio puede
consultarlos en PostgreSQL. MongoDB se concentra en el contenido flexible y
documental de `resenas`.

## Alcance del Hito 1

En esta parte se entrega la documentación de la selección NoSQL y el modelo
documental. La implementación funcional prevista para la siguiente actividad es
el endpoint `POST /api/resenas`, con persistencia en la colección `resenas`.

**Revisión solicitada:** avisar a Valeria para que revise este documento y
etiquete el Hito 1 cuando confirme su contenido.
