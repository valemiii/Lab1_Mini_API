const mongoose = require("mongoose");
const validator = require("validator");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ESTADOS_RESENA = ["pendiente", "publicada", "oculta"];

const respuestaEmpresaSchema = new mongoose.Schema(
  {
    mensaje: {
      type: String,
      required: [true, "respuestaEmpresa.mensaje es obligatorio"],
      minlength: [1, "respuestaEmpresa.mensaje no puede estar vacío"],
      maxlength: [1000, "respuestaEmpresa.mensaje no puede superar 1000 caracteres"],
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, "respuestaEmpresa.fecha es obligatoria"],
      default: Date.now,
    },
  },
  { _id: false }
);

const resenaSchema = new mongoose.Schema(
  {
    productoId: {
      type: String,
      required: [true, "productoId es obligatorio"],
      match: [UUID_REGEX, "productoId debe tener formato UUID válido"],
    },
    usuarioId: {
      type: String,
      required: [true, "usuarioId es obligatorio"],
      match: [UUID_REGEX, "usuarioId debe tener formato UUID válido"],
    },
    calificacion: {
      type: Number,
      required: [true, "calificacion es obligatoria"],
      min: [1, "calificacion debe ser como mínimo 1"],
      max: [5, "calificacion debe ser como máximo 5"],
      validate: {
        validator: Number.isInteger,
        message: "calificacion debe ser un número entero",
      },
    },
    comentario: {
      type: String,
      required: [true, "comentario es obligatorio"],
      minlength: [10, "comentario debe tener al menos 10 caracteres"],
      maxlength: [1000, "comentario no puede superar 1000 caracteres"],
    },
    imagenes: {
      type: [
        {
          type: String,
          validate: {
            validator: (value) =>
              validator.isURL(value, {
                protocols: ["http", "https"],
                require_protocol: true,
                require_valid_protocol: true,
                require_tld: false,
              }),
            message: "cada imagen debe ser una URL HTTP o HTTPS válida",
          },
        },
      ],
      default: undefined,
      validate: {
        validator: (imagenes) => imagenes.length <= 5,
        message: "imagenes admite como máximo 5 URL",
      },
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    respuestaEmpresa: {
      type: respuestaEmpresaSchema,
      default: undefined,
    },
    estado: {
      type: String,
      enum: {
        values: ESTADOS_RESENA,
        message: "estado debe ser uno de: pendiente, publicada u oculta",
      },
      default: "pendiente",
    },
  },
  {
    collection: "resenas",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

resenaSchema.virtual("estrellas").get(function () {
  return "★".repeat(this.calificacion || 0);
});

resenaSchema.pre("validate", function () {
  if (typeof this.comentario === "string") {
    this.comentario = this.comentario.trim();
  }
});

module.exports =
  mongoose.models.Resena || mongoose.model("Resena", resenaSchema, "resenas");
