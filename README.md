# Laboratorio 1 · Mini-API MVC con CRUD

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | GXX (reemplazar por el número real) |
| Emprendimiento | Catálogo y pedidos de uniformes escolares APDAF SPORT |
| Integrantes | Completar nombres del equipo |
| NRC / fecha | Completar |
| Repositorio | Agregar el enlace compartido de GitHub |

## Cómo ejecutar

Requiere Node.js 20 o superior.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

Importa `postman/GXX_Lab1.postman_collection.json` en Postman y ejecuta **Run collection**. Las solicitudes de creación, actualización y eliminación usan la variable `createdId` para encadenar el flujo; por ello, ejecuta la colección en orden.

## Estructura MVC en capas

```text
src/
├─ app.js                 configuración Express, middleware y prefijo /api
├─ server.js              carga .env y levanta el servidor
├─ routes/                verbo + URL → controlador
├─ controllers/            lee req, delega al servicio y decide respuesta HTTP
├─ services/               reglas de negocio, validaciones y acceso al modelo
├─ models/                 campos y persistencia en archivo JSON
├─ middlewares/            logger, notFound y errorHandler
└─ utils/httpError.js      error con estado HTTP
data/products.json         datos del catálogo
```

Flujo: **ruta → controlador → servicio → modelo**. El proyecto usa CommonJS (`require` / `module.exports`). En el Laboratorio 2 se reemplaza el almacenamiento JSON por Prisma.

## Endpoints

| Verbo | Ruta | Acción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/products` | Listar | 200 | 500 |
| GET | `/api/products/:id` | Consultar uno | 200 | 400, 404 |
| POST | `/api/products` | Crear | 201 | 400 |
| PUT | `/api/products/:id` | Actualizar parcialmente | 200 | 400, 404 |
| DELETE | `/api/products/:id` | Eliminar sin cuerpo | 204 | 400, 404 |

Las rutas inexistentes responden 404 JSON. El cuerpo JSON mal formado responde 400 JSON.

## Validaciones del servicio

1. `name` es obligatorio al crear y debe ser texto con al menos 3 caracteres.
2. `price` es obligatorio al crear y debe ser número mayor o igual a cero.

En PUT se validan esos campos solo cuando se envían; el servicio conserva el resto del registro. El identificador debe ser numérico y el registro debe existir para consultar, actualizar o eliminar.

## Aporte del equipo

Completar la tabla con los aportes reales antes de entregar.

| Integrante | Qué hizo (archivos / pasos) |
|---|---|
| Completar | Completar |

## Declaración de uso de IA

Completar con las herramientas realmente utilizadas, para qué se usaron y qué verificó o corrigió el equipo. No dejar esta sección vacía en la entrega.

## Entrega

Antes de comprimir, reemplaza `GXX` por el número de grupo en el nombre de la carpeta y archivos, completa los datos del equipo, ejecuta y captura la colección de Postman, y agrega esas evidencias en `evidencias/`. El ZIP debe incluir el código, `PROPUESTA.md`, este README y evidencias; excluye `node_modules/` y `.env`.
