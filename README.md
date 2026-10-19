# Laboratorio 1 · Catálogo de uniformes APDAF SPORT

Mini-API REST desarrollada para **Desarrollo Web Avanzado (A0R04), ESPE**. El proyecto adapta la plantilla MVC del laboratorio para administrar productos de uniformes escolares inspirados en el catálogo público de [APDAF SPORT](https://apdafsport.com/).

La propuesta del emprendimiento, el mapa frontend–backend, las entidades y los endpoints iniciales están documentados en [`PROPUESTA.md`](./PROPUESTA.md).

> Los productos y precios de `data/products.json` son ejemplos basados en el catálogo visible al preparar el laboratorio; no representan inventario confirmado. El número de WhatsApp está pendiente de confirmar: la página indica que el canal está en configuración.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y ejecución

Desde la carpeta raíz del proyecto:

```bash
npm ci
```

Opcionalmente, crea el archivo local `.env` a partir del ejemplo. En PowerShell:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`. La ruta raíz `GET /` devuelve el estado básico de la aplicación. La variable `PORT` permite cambiar el puerto; `DATA_FILE` indica el archivo JSON usado por el modelo.

## Estado de los endpoints

Los endpoints implementados actualmente son:

| Verbo | Ruta | Estado | Descripción |
|---|---|---|---|
| GET | `/api/products` | Implementado · 200 | Lista los productos del catálogo. |
| GET | `/api/products/:id` | Implementado · 200 | Consulta un producto por su identificador; responde 400 si el ID no es numérico y 404 si no existe. |

La propuesta también contempla `POST /api/products` (201) para agregar productos. La creación, actualización (`PUT`) y eliminación (`DELETE`) aún están pendientes en los controladores, servicios y rutas; por eso, las peticiones CRUD correspondientes de la colección Postman todavía no se pueden ejecutar con éxito.

## Modelo y datos de ejemplo

La entidad principal del laboratorio es **Producto**, definida por estos campos:

| Campo | Descripción |
|---|---|
| `id` | Identificador numérico del producto. |
| `name` | Nombre de la prenda o accesorio. |
| `institution` | Institución a cuyo catálogo pertenece. |
| `category` | Categoría del producto, por ejemplo uniforme diario o deportivo. |
| `price` | Precio de ejemplo en dólares estadounidenses. |

Los registros iniciales están en [`data/products.json`](./data/products.json). El modelo [`src/models/product.model.js`](./src/models/product.model.js) limita los campos que se aceptan al guardar un producto.

Las otras entidades planteadas para los siguientes laboratorios son **Institución** y **Pedido**; sus relaciones propuestas están descritas en [`PROPUESTA.md`](./PROPUESTA.md).

## Estructura del proyecto

```text
src/
├── app.js                 # Configura Express, middlewares y prefijo /api
├── server.js              # Carga .env e inicia el servidor
├── routes/                # Rutas de la API
├── controllers/           # Peticiones HTTP y respuestas
├── services/              # Lógica de negocio y acceso a datos
├── models/                # Campos y persistencia JSON
├── middlewares/           # Registro, errores y rutas no encontradas
└── utils/                 # Utilidades, como HttpError
data/
└── products.json          # Datos de ejemplo
postman/
└── GXX_Lab1.postman_collection.json
```

Flujo de las peticiones: **ruta → controlador → servicio → modelo**. El proyecto usa CommonJS (`require` y `module.exports`). En el Laboratorio 2, la persistencia JSON se reemplazará por Prisma.

## Probar la API

Importar `postman/GXX_Lab1.postman_collection.json` en Postman. Mientras se completa el CRUD, ejecuta únicamente las peticiones GET para listar productos y consultar un producto. Las demás peticiones de la colección corresponden a operaciones aún pendientes.

Desde PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/products
Invoke-RestMethod http://localhost:3000/api/products/1
```

## Trabajo pendiente del equipo

- Acordar con **Samuel** las dos validaciones del producto antes de implementarlas.
- Completar las operaciones POST, PUT y DELETE de acuerdo con el flujo MVC existente.
- Confirmar el número oficial de WhatsApp antes de incluirlo en la aplicación.

## Integrantes y datos del curso

Completar estos datos con el equipo:

| Dato | Valor |
|---|---|
| Grupo | G1 |
| Integrantes | 1. Samuel Dávalos · 2. Valeria Guaiguacundo · 3. Brithany López · 4. Daniel Palacios | 
| NRC | 36878 |
| Fecha | 19/10/2026 |
| Repositorio | [Lab1_Mini_API](https://github.com/valemiii/Lab1_Mini_API) |

## Declaración de uso de IA


- Herramienta(s) usada(s): Copilot, Claude AI, ChatGPT
- Para qué se usó: Consulta, depuración, uso de comandos
- Qué verificó o corrigió el equipo: Métodos de enrutamiento, CRUD e información del emprendimiento
