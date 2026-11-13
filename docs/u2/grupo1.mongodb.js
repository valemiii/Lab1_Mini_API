// Hito 2 · Playground MongoDB de APDAF SPORT · Grupo G1
// Ejecutar en mongosh conectado al entorno local:
//   mongosh "mongodb://localhost:27018" docs/u2/grupo1.mongodb.js
//
// Las referencias productoId y usuarioId apuntan a PostgreSQL. El $lookup de
// este ejercicio solo une reportes_resenas con resenas dentro de MongoDB.

use("apdaf_sport");

const uuidPattern = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$";
const urlPattern = "^https?:\\/\\/[^\\s]+$";

// El playground es repetible: se reinician únicamente estas dos colecciones
// de práctica antes de volver a crear el validador y los datos de ejemplo.
db.resenas.drop();
db.reportes_resenas.drop();

db.createCollection("resenas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "productoId",
        "usuarioId",
        "calificacion",
        "comentario",
        "fechaCreacion",
        "estado",
      ],
      properties: {
        productoId: {
          bsonType: "string",
          pattern: uuidPattern,
          description: "UUID del producto en PostgreSQL",
        },
        usuarioId: {
          bsonType: "string",
          pattern: uuidPattern,
          description: "UUID del usuario en PostgreSQL",
        },
        calificacion: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
          description: "Número entero entre 1 y 5",
        },
        comentario: {
          bsonType: "string",
          minLength: 10,
          maxLength: 1000,
          description: "Comentario de 10 a 1000 caracteres",
        },
        imagenes: {
          bsonType: "array",
          maxItems: 5,
          items: {
            bsonType: "string",
            pattern: urlPattern,
          },
          description: "Hasta cinco URLs http/https",
        },
        fechaCreacion: {
          bsonType: "date",
        },
        respuestaEmpresa: {
          bsonType: "object",
          required: ["mensaje", "fecha"],
          properties: {
            mensaje: { bsonType: "string", minLength: 1, maxLength: 1000 },
            fecha: { bsonType: "date" },
          },
        },
        estado: {
          bsonType: "string",
          enum: ["pendiente", "publicada", "oculta"],
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});

const resenasValidas = [
  {
    productoId: "11111111-1111-4111-8111-111111111111",
    usuarioId: "22222222-2222-4222-8222-222222222222",
    calificacion: NumberInt(5),
    comentario: "La tela es cómoda y la talla coincide con la guía.",
    imagenes: ["https://apdafsport.com/img/camisa-1.jpg"],
    fechaCreacion: ISODate("2026-11-13T15:00:00Z"),
    estado: "publicada",
  },
  {
    productoId: "33333333-3333-4333-8333-333333333333",
    usuarioId: "44444444-4444-4444-8444-444444444444",
    calificacion: NumberInt(4),
    comentario: "Buen acabado y entrega según lo solicitado.",
    fechaCreacion: ISODate("2026-11-13T15:05:00Z"),
    respuestaEmpresa: {
      mensaje: "Gracias por compartir tu experiencia.",
      fecha: ISODate("2026-11-13T16:00:00Z"),
    },
    estado: "pendiente",
  },
];

const insercionValida = db.resenas.insertMany(resenasValidas);
print("\nInserciones válidas: " + insercionValida.insertedIds.length);
printjson(insercionValida);

function camposQueFallaron(error) {
  const campos = new Set();

  function recorrer(detalle) {
    if (!detalle || typeof detalle !== "object") return;
    if (detalle.propertyName) campos.add(detalle.propertyName);
    if (detalle.fieldName) campos.add(detalle.fieldName);
    if (Array.isArray(detalle.details)) detalle.details.forEach(recorrer);
  }

  recorrer(error?.errInfo?.details);
  return [...campos];
}

function probarInsercionRechazada(nombre, documento, campoEsperado) {
  try {
    db.resenas.insertOne(documento);
    print("ERROR: la inserción " + nombre + " fue aceptada inesperadamente");
  } catch (error) {
    const campos = camposQueFallaron(error);
    print("\nInserción rechazada: " + nombre);
    print("Campo que falló: " + (campos.join(", ") || campoEsperado));
    print("Mensaje: " + error.message);
  }
}

probarInsercionRechazada(
  "calificación fuera de rango",
  {
    productoId: "55555555-5555-4555-8555-555555555555",
    usuarioId: "66666666-6666-4666-8666-666666666666",
    calificacion: NumberInt(6),
    comentario: "Este comentario tiene la longitud suficiente.",
    fechaCreacion: ISODate("2026-11-13T15:10:00Z"),
    estado: "pendiente",
  },
  "calificacion",
);

probarInsercionRechazada(
  "estado no permitido",
  {
    productoId: "77777777-7777-4777-8777-777777777777",
    usuarioId: "88888888-8888-4888-8888-888888888888",
    calificacion: NumberInt(3),
    comentario: "Este comentario también tiene la longitud suficiente.",
    fechaCreacion: ISODate("2026-11-13T15:15:00Z"),
    estado: "borrador",
  },
  "estado",
);

db.createCollection("reportes_resenas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["resenaId", "motivo", "estado", "fechaReporte"],
      properties: {
        resenaId: { bsonType: "objectId" },
        motivo: { bsonType: "string", minLength: 5, maxLength: 500 },
        estado: { bsonType: "string", enum: ["pendiente", "revisado", "descartado"] },
        fechaReporte: { bsonType: "date" },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});

const resenas = db.resenas.find().sort({ fechaCreacion: 1 }).toArray();
const reportesInsertados = db.reportes_resenas.insertMany([
  {
    resenaId: resenas[0]._id,
    motivo: "Comentario reportado para revisión.",
    estado: "pendiente",
    fechaReporte: ISODate("2026-11-13T16:10:00Z"),
  },
  {
    resenaId: resenas[1]._id,
    motivo: "La reseña necesita una comprobación.",
    estado: "revisado",
    fechaReporte: ISODate("2026-11-13T16:15:00Z"),
  },
]);

print("\nReportes insertados: " + reportesInsertados.insertedIds.length);
printjson(reportesInsertados);

const reportesConResena = db.reportes_resenas
  .aggregate([
    {
      $lookup: {
        from: "resenas",
        localField: "resenaId",
        foreignField: "_id",
        as: "resena",
      },
    },
    { $unwind: "$resena" },
    {
      $project: {
        _id: 1,
        resenaId: 1,
        motivo: 1,
        estado: 1,
        fechaReporte: 1,
        "resena.productoId": 1,
        "resena.usuarioId": 1,
        "resena.calificacion": 1,
        "resena.comentario": 1,
        "resena.estado": 1,
      },
    },
  ])
  .toArray();

print("\nResultado del $lookup + $unwind: " + reportesConResena.length + " reportes con su reseña original");
printjson(reportesConResena);

print("\nConteos finales:");
printjson({
  resenas: db.resenas.countDocuments(),
  reportes_resenas: db.reportes_resenas.countDocuments(),
});
