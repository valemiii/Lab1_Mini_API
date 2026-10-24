# Laboratorio 2 · Persistencia con Prisma para APDAF SPORT

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | G1 |
| Emprendimiento | Catálogo y pedidos de uniformes escolares APDAF SPORT |
| Integrantes | 1. Samuel Dávalos · 2. Valeria Guaiguacundo · 3. Brithany López · 4. Daniel Palacios |
| NRC | 36878 |
| Fecha | 24/10/2026 |
| Repositorio | [Lab1_Mini_API](https://github.com/valemiii/Lab1_Mini_API) |

## Descripción

Mini-API REST para administrar productos de un catálogo de uniformes escolares inspirado en APDAF SPORT. Los productos y precios del seed son datos de ejemplo y no representan inventario confirmado. El canal de atención por WhatsApp es **+593 99 717 4850**.

## Requisitos e instalación

- Node.js 20 o superior
- PostgreSQL disponible en `localhost:5433`
- npm

```bash
npm ci
```

Configura la conexión en `.env` (puedes partir de `.env.example` y sustituir los valores ficticios). No subas `.env` al repositorio. Para una base vacía, crea y aplica la migración, genera el cliente y carga los datos iniciales:

```bash
npm run db:migrate -- --name init
npm run db:generate
npm run db:seed
```

`db:seed` limpia y vuelve a cargar todos los productos y categorías de ejemplo; ejecútalo solo en una base de desarrollo. PostgreSQL debe estar disponible según `DATABASE_URL`. Después inicia la API:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`. `GET /` devuelve el estado básico; `PORT` configura el puerto. El CRUD de productos persiste en PostgreSQL.

## Endpoints

| Verbo | Ruta | Acción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/products` | Listar productos | 200 | 500 |
| GET | `/api/products/:id` | Consultar uno | 200 | 400, 404 |
| POST | `/api/products` | Crear producto | 201 | 400 |
| PUT | `/api/products/:id` | Actualizar campos enviados | 200 | 400, 404 |
| DELETE | `/api/products/:id` | Eliminar sin cuerpo | 204 | 400, 404 |
| POST | `/api/products/lote` | Crear varios productos en transacción atómica | 201 | 400, 409 |

Los SKU repetidos responden 409; las rutas inexistentes responden 404 JSON y el JSON mal formado responde 400 JSON. Los errores internos responden 500; su stack solo se incluye fuera de producción.

## Validaciones

1. `name` es obligatorio al crear y debe ser texto con al menos 3 caracteres.
2. `price` es obligatorio al crear y debe ser un número mayor o igual a cero.

En PUT esos campos se validan solo si están presentes. `institution` y `category` son opcionales. Los IDs deben ser numéricos y el registro debe existir para consultar, actualizar o eliminar.

## Arquitectura y datos

El flujo de una petición es **ruta → controlador → servicio → Prisma**. El controlador delega la lógica de negocio; el servicio aplica validaciones y persiste en PostgreSQL con Prisma. El proyecto utiliza CommonJS (`require` / `module.exports`).

El modelo Prisma define `Product` y `Category` sin relación entre ellas para este paso. `Product` tiene SKU único, precio decimal, notas opcionales y fecha de creación; conserva institución y categoría como datos descriptivos para el CRUD actual. La API genera un SKU para los productos creados sin SKU explícito. El diagrama editable está en [docs/Modelo_ER.drawio](docs/Modelo_ER.drawio), junto con la descripción en [MODELO_ER.md](MODELO_ER.md).

```text
.
├── prisma/
│   ├── migrations/         SQL versionado del esquema PostgreSQL
│   ├── schema.prisma       Modelos de PostgreSQL
│   └── seed.js             Carga productos y categorías de ejemplo
├── docs/
│   └── Modelo_ER.drawio    Diagrama ER editable
├── scripts/
│   └── smoke-test.js       Pruebas de integración HTTP
├── src/
│   ├── app.js              Configura Express, middlewares y prefijo /api
│   ├── server.js           Carga .env, conecta PostgreSQL e inicia el servidor
│   ├── controllers/        Lectura de petición y respuestas HTTP
│   ├── db/                 Cliente Prisma compartido
│   ├── middlewares/        Logger, notFound y errorHandler│   ├── routes/             Rutas HTTP de la API
│   ├── services/           Reglas de negocio, validaciones y Prisma
│   └── utils/              Error con estado HTTP├── evidencias/             Capturas y evidencias del laboratorio
├── postman/                Colección de pruebas
├── .env.example            Plantilla de variables de entorno
├── docker-compose.yml      PostgreSQL local del laboratorio
├── MODELO_ER.md            Diagrama y descripción del modelo de datos
├── PROPUESTA.md            Propuesta del emprendimiento
├── prisma.config.ts        Configuración de Prisma 7
├── package.json            Scripts y dependencias
└── README.md               Guía del proyecto
```

## Lab 2

La API persiste productos y categorías en PostgreSQL mediante Prisma 7.10.1. Configura `DATABASE_URL` en `.env` a partir de `.env.example`, inicia la base con `docker compose up -d` y ejecuta `npm run db:migrate -- --name init`, `npm run db:generate` y `npm run db:seed`. El seed limpia y carga datos de ejemplo, por lo que puede repetirse en una base de desarrollo.

`POST /api/products/lote` recibe un arreglo de productos. Si todos son válidos, responde 201 y confirma el lote completo. Un elemento inválido responde 400 y provoca rollback; un SKU ya existente responde 409 y también revierte los elementos previos del lote. El CRUD existente mantiene el flujo MVC y la única instancia compartida de Prisma está en `src/db/prisma.js`.

## Pruebas en Postman

Importa `postman/G1_Lab2.postman_collection.json` y ejecuta **Run collection** con el servidor activo. La colección cubre CRUD, validaciones, creación por lote con COMMIT/ROLLBACK, error 409 por SKU duplicado y los errores 400/404.

También puedes probar los endpoints GET desde PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/products
$products = Invoke-RestMethod http://localhost:3000/api/products
Invoke-RestMethod "http://localhost:3000/api/products/$($products[0].id)"
```

## Aporte del equipo · Lab 2

| Integrante | Qué hizo (archivos / pasos) |
|---|---|
| Valeria Guaiguacundo · Persona 1 | Continuidad del emprendimiento, propuesta y configuración inicial de datos y PostgreSQL. |
| Samuel Dávalos · Persona 2 | Servicio `src/services/product.service.js`, operaciones `create`, `update` y `remove`, validaciones y manejo de errores 400 y 404. |
| Daniel Palacios · Persona 3 | Servicio CRUD con Prisma, manejo de errores 404/409, transacción de lote y conexión del controlador y ruta `/lote`. |
| Brithany López · Persona 4 | Colección Postman del Lab 2, ejecución de pruebas CRUD y transaccionales, documentación y preparación de evidencias. |

## Evidencias

La carpeta `evidencias/` contiene la captura resumen requerida `postman-run.png`, tres capturas de detalle de la colección Postman (`1postman-run-lab2.png`, `2postman-run-lab2.png` y `3postman-run-lab2.png`), la captura de Prisma Studio (`prisma-studio.png`) y el reporte Newman (15 solicitudes, 22 aserciones, 0 fallidas). También conserva `postman-run-lab1.png` como evidencia del Laboratorio 1.

## Declaración de uso de IA

- Herramientas usadas: Copilot, Claude AI, ChatGPT y Codex.
- Uso declarado por el equipo: consulta, depuración, revisión de Prisma y preparación de casos de prueba y documentación. El equipo debe comprender y sustentar el código.
- Verificación realizada: migraciones y generación de Prisma, seed repetido dos veces, smoke test de 8 escenarios y colección Lab 2 completa mediante Newman con casos de COMMIT y ROLLBACK.


