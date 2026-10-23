/*
 * Laboratorio 1 · Mini-API MVC con CRUD
 * Desarrollo Web Avanzado (A0R04) · ESPE
 * Grupo: G1 · Emprendimiento: Catálogo y pedidos de uniformes escolares APDAF SPORT
 * Integrantes: Samuel Dávalos, Valeria Guaiguacundo, Brithany López y Daniel Palacios
 * NRC: 36878 · Fecha: 19/10/2026
 */
const express = require("express");
const routes = require("./routes");
const logger = require("./middlewares/logger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// El logger precede al parser para registrar también solicitudes con JSON inválido.
app.use(logger);
app.use(express.json()); // reemplaza a body-parser: llena req.body con el JSON recibido

// 2. Rutas: todas cuelgan del prefijo /api (ver routes/index.js)
app.get("/", (req, res) => res.json({ api: "Lab 1 · Mini-API MVC", estado: "ok" }));
app.use("/api", routes);

// 3. Middlewares que actúan DESPUÉS: ruta no encontrada y manejo de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
