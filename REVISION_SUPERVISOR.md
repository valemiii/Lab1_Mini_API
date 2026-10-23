# Revisión del supervisor

**Revisor:** DanielPalacios98  
**Fecha:** 22/10/2026  
**Repositorio:** `valemiii/Lab1_Mini_API`

## Ramas revisadas

- `main`: integración final del equipo.
- `origin/docs/actualiza-readme`: documentación y ajustes de entrega; integrada en `main`.
- `origin/persona-4-middlewares-pruebas`: middlewares, pruebas y aportes; integrada en `main`.

No se encontraron otras ramas remotas pendientes de integrar al momento de la revisión.

## Resultado técnico

La API se instaló desde cero con `npm ci` sin vulnerabilidades reportadas. Se verificaron los endpoints de la colección y los siguientes estados HTTP: `200`, `201`, `204`, `400` y `404`.

También se comprobó que:

- el CRUD mantiene la separación ruta → controlador → servicio → modelo;
- las validaciones de `name` y `price` responden 400 con mensaje;
- el JSON mal formado responde 400;
- una ruta inexistente responde 404 en JSON;
- DELETE responde 204 sin cuerpo;
- el registro creado durante la prueba se eliminó y no alteró los datos iniciales.

## Observaciones cerradas

- Se reemplazaron los marcadores `GXX` por `G1`.
- Se renombró la colección a `postman/G1_Lab1.postman_collection.json`.
- Se corrigió `createdId` para usar una variable de colección de Postman.
- Se completó la cabecera de `src/app.js` y la referencia de entrega del README.

## Dictamen

El proyecto queda listo para la entrega del Laboratorio 1 conforme a la rúbrica técnica. Las capturas de Postman y logger deben generarse desde la interfaz de Postman si el docente las exige como evidencia visual; la API ya fue verificada por solicitudes equivalentes.
