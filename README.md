# Laboratorio 1 · Mini-API MVC con CRUD

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | G1 |
| Emprendimiento | Catálogo y pedidos de uniformes escolares APDAF SPORT |
| Integrantes | 1. Samuel Dávalos · 2. Valeria Guaiguacundo · 3. Brithany López · 4. Daniel Palacios |
| NRC | 36878 |
| Fecha | 19/10/2026 |
| Repositorio | [Lab1_Mini_API](https://github.com/valemiii/Lab1_Mini_API) |

## Descripción

Mini-API REST para administrar productos de un catálogo de uniformes escolares inspirado en APDAF SPORT. Los productos y precios de `data/products.json` son ejemplos basados en el catálogo público y no representan inventario confirmado. El canal de atención por WhatsApp es **+593 99 717 4850**.

## Requisitos e instalación

- Node.js 20 o superior
- npm

```bash
npm ci
```

Opcionalmente, copia `.env.example` a `.env` (en PowerShell: `Copy-Item .env.example .env`; en macOS/Linux: `cp .env.example .env`). Inicia el servidor:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`. `GET /` devuelve el estado básico; `PORT` configura el puerto y `DATA_FILE` la ruta del archivo JSON.

## Endpoints

| Verbo | Ruta | Acción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/products` | Listar productos | 200 | 500 |
| GET | `/api/products/:id` | Consultar uno | 200 | 400, 404 |
| POST | `/api/products` | Crear producto | 201 | 400 |
| PUT | `/api/products/:id` | Actualizar campos enviados | 200 | 400, 404 |
| DELETE | `/api/products/:id` | Eliminar sin cuerpo | 204 | 400, 404 |

Las rutas inexistentes responden 404 JSON y el JSON mal formado responde 400 JSON. Los errores internos responden 500; su stack solo se incluye fuera de producción.

## Validaciones

1. `name` es obligatorio al crear y debe ser texto con al menos 3 caracteres.
2. `price` es obligatorio al crear y debe ser un número mayor o igual a cero.

En PUT esos campos se validan solo si están presentes. `institution` y `category` son opcionales. Los IDs deben ser numéricos y el registro debe existir para consultar, actualizar o eliminar.

## Arquitectura y datos

El flujo de una petición es **ruta → controlador → servicio → modelo**. El controlador delega la lógica de negocio y no lee archivos; el servicio aplica validaciones y el modelo persiste en JSON. El proyecto utiliza CommonJS (`require` / `module.exports`). En el Laboratorio 2, el almacenamiento JSON se reemplazará por Prisma.

```text
src/
├── app.js                 Configura Express, middlewares y prefijo /api
├── server.js              Carga .env e inicia el servidor
├── routes/                Rutas HTTP de la API
├── controllers/           Lectura de petición y respuestas HTTP
├── services/              Reglas de negocio y validaciones
├── models/                Campos y persistencia JSON
├── middlewares/           Logger, notFound y errorHandler
└── utils/httpError.js     Error con estado HTTP
data/products.json         Productos de ejemplo
postman/                   Colección de pruebas
```

## Pruebas en Postman

Importa `postman/G1_Lab1.postman_collection.json` y ejecuta **Run collection** con el servidor activo. La colección contiene 13 solicitudes para CRUD, validaciones y errores. Ejecuta las solicitudes en orden: la creación guarda `createdId` como variable de colección para que actualización y eliminación usen el registro creado.

También puedes probar los endpoints GET desde PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/products
Invoke-RestMethod http://localhost:3000/api/products/1
```

## Aporte del equipo

| Integrante | Qué hizo (archivos / pasos) |
|---|---|
| Valeria Guaiguacundo · Persona 1 | Propuesta del emprendimiento y mapa frontend–backend en `PROPUESTA.md`; modelo adaptado en `src/models/product.model.js`; datos de ejemplo en `data/products.json`. |
| Samuel Dávalos · Persona 2 | Servicio `src/services/product.service.js`, operaciones `create`, `update` y `remove`, validaciones y manejo de errores 400 y 404. |
| Daniel Palacios · Persona 3 | Controlador `src/controllers/product.controller.js`, cinco endpoints conectados en `src/routes/product.routes.js` y montaje de rutas en `src/routes/index.js`. |
| Brithany López · Persona 4 | Logger y manejador de errores en `src/middlewares/`; colección CRUD y casos de error en `postman/G1_Lab1.postman_collection.json`. |

## Declaración de uso de IA

- Herramientas usadas: Copilot, Claude AI y ChatGPT.
- Uso declarado por el equipo: consulta, depuración y ayuda con comandos.
- Verificación declarada por el equipo: métodos de enrutamiento, CRUD e información del emprendimiento.

## Entrega

Antes de comprimir, usa el nombre `G1_Lab1_CatalogoUniformesAPDAF.zip`. La entrega incluye el código, `PROPUESTA.md`, este README y la colección exportada, sin `node_modules/` ni `.env`.
