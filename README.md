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
- PostgreSQL disponible en `localhost:5433`
- npm

```bash
npm ci
```

Configura la conexión en `.env` (puedes partir de `.env.example`). Para usar la instancia PostgreSQL compartida con el proyecto `espe-expressjs`, debe estar ejecutándose en `localhost:5433` con las credenciales indicadas. Prepara la tabla de productos e importa los datos de ejemplo una sola vez:

```bash
npm run db:push
npm run db:seed
```

`db:seed` no sobrescribe productos existentes. Después inicia la API:

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

Las rutas inexistentes responden 404 JSON y el JSON mal formado responde 400 JSON. Los errores internos responden 500; su stack solo se incluye fuera de producción.

## Validaciones

1. `name` es obligatorio al crear y debe ser texto con al menos 3 caracteres.
2. `price` es obligatorio al crear y debe ser un número mayor o igual a cero.

En PUT esos campos se validan solo si están presentes. `institution` y `category` son opcionales. Los IDs deben ser numéricos y el registro debe existir para consultar, actualizar o eliminar.

## Arquitectura y datos

El flujo de una petición es **ruta → controlador → servicio → modelo**. El controlador delega la lógica de negocio y no lee archivos; el servicio aplica validaciones y el modelo persiste en PostgreSQL con Prisma. El proyecto utiliza CommonJS (`require` / `module.exports`).

```text
.
├── prisma/
│   ├── schema.prisma       Modelos de PostgreSQL
│   └── seed.js             Importación inicial de productos
├── scripts/
│   └── smoke-test.js       Pruebas de integración HTTP
├── src/
│   ├── app.js              Configura Express, middlewares y prefijo /api
│   ├── server.js           Carga .env, conecta PostgreSQL e inicia el servidor
│   ├── controllers/        Lectura de petición y respuestas HTTP
│   ├── db/                 Cliente Prisma compartido
│   ├── middlewares/        Logger, notFound y errorHandler
│   ├── models/             Acceso a datos PostgreSQL
│   ├── routes/             Rutas HTTP de la API
│   ├── services/           Reglas de negocio y validaciones
│   └── utils/              Error con estado HTTP
├── data/
│   └── products.json       Datos de ejemplo para el seed inicial
├── evidencias/             Capturas y evidencias del laboratorio
├── postman/                Colección de pruebas
├── .env.example            Plantilla de variables de entorno
├── docker-compose.yml      PostgreSQL local del laboratorio
├── MODELO_ER.md            Diagrama y descripción del modelo de datos
├── PROPUESTA.md            Propuesta del emprendimiento
├── prisma.config.ts        Configuración de Prisma 7
├── package.json            Scripts y dependencias
└── README.md               Guía del proyecto
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
| Valeria Guaiguacundo · Persona 1 | Propuesta del emprendimiento y mapa frontend–backend en `PROPUESTA.md`; modelo adaptado en `src/models/product.model.js`; datos de ejemplo en `data/products.json`. Modelo Product; Reestructuración de carpetas; Sincronizar con PostgreSQL; Cambio de puerto de Postgres y credenciales|
| Samuel Dávalos · Persona 2 | Servicio `src/services/product.service.js`, operaciones `create`, `update` y `remove`, validaciones y manejo de errores 400 y 404. |
| Daniel Palacios · Persona 3 | Controlador `src/controllers/product.controller.js`, cinco endpoints conectados en `src/routes/product.routes.js` y montaje de rutas en `src/routes/index.js`. |
| Brithany López · Persona 4 | Logger y manejador de errores en `src/middlewares/`; colección CRUD y casos de error en `postman/G1_Lab1.postman_collection.json`. |

## Declaración de uso de IA

- Herramientas usadas: Copilot, Claude AI y ChatGPT.
- Uso declarado por el equipo: consulta, depuración y ayuda con comandos.
- Verificación declarada por el equipo: métodos de enrutamiento, CRUD e información del emprendimiento.

## Entrega

Antes de comprimir, usa el nombre `G1_Lab1_CatalogoUniformesAPDAF.zip`. La entrega incluye el código, `PROPUESTA.md`, este README y la colección exportada, sin `node_modules/` ni `.env`.
