# Preparación del entorno U2

Guía para iniciar el entorno local de APDAF SPORT antes de implementar el playground de MongoDB y el endpoint de reseñas.

## Requisitos detectados

- Node.js **20.19 o posterior** (Mongoose 9 requiere `>=20.19`). En el entorno de preparación se detectó Node **26.3.0** y npm **11.16.0**.
- Docker Engine/Desktop con Docker Compose. Se detectaron Docker **29.8.2** y Compose **5.5.1**, pero el daemon no estaba iniciado durante la preparación; inicia Docker Desktop antes de levantar el contenedor.
- El puerto local **27017** ya lo ocupa un proceso `mongod`; Compose publica MongoDB en **27018** para no detener ni interferir con ese proceso.

## Instalación y configuración

Desde la raíz del repositorio:

```powershell
npm ci
Copy-Item .env.example .env
```

Completa `.env` con la URL privada de PostgreSQL en Supabase y un `JWT_SECRET` local de al menos 32 caracteres. No compartas ni subas `.env`; Git lo excluye. Las credenciales de Mongo del ejemplo son solo locales y pueden cambiarse, siempre que coincidan con las variables del servicio.

Después de configurar el entorno, genera el cliente Prisma si hace falta:

```powershell
npm run db:generate
```

## MongoDB y API

Levanta únicamente MongoDB (el Compose existente conserva también un servicio PostgreSQL local opcional; no lo necesitas si utilizas Supabase):

```powershell
docker compose up -d mongodb
docker compose ps mongodb
npm run dev
```

La API solo empieza a escuchar después de conectar MongoDB y Prisma/PostgreSQL. Los mensajes esperados son:

```text
Conexión a MongoDB establecida (apdaf_sport).
Conexión a PostgreSQL establecida (Prisma).
Servidor ejecutándose en puerto 3000
```

Si MongoDB no está disponible o `MONGODB_URI` falta, se informa el error y la API termina sin abrir el puerto HTTP.

El `.env.example` usa una URI para ejecutar Node en el **host** (`localhost:27018`). El proyecto no tiene un servicio Compose para la API; si posteriormente Node se ejecuta dentro de Compose, debe usar el nombre del servicio y el puerto interno: `mongodb:27017`, no `localhost:27018`.

## Compass y MongoDB for VS Code

Con el contenedor activo, en MongoDB Compass o la extensión MongoDB for VS Code crea una conexión nueva y utiliza la URI local indicada por `MONGODB_URI` en tu `.env`; también puedes reemplazar `localhost` por `127.0.0.1`. No pegues ni publiques una URI que contenga credenciales. La base acordada es `apdaf_sport`; MongoDB la crea al guardar el primer documento. Las colecciones previstas en `docs/u2/hito1.md` son `resenas` y `reportes_resenas`.

Cada integrante debe levantar y configurar su propio entorno local; no compartan archivos `.env` ni dependan del contenedor de otra persona.

## Conexión y relevo

- `src/db/mongo.js` contiene `connectMongo()` y `disconnectMongo()`.
- `src/server.js` carga dotenv, conecta MongoDB y Prisma, y solo entonces llama a `listen`.
- El código usa **CommonJS** (`require`/`module.exports`).
- Daniel puede guardar `grupoN.mongodb.js` en `scripts/` y usar la conexión de `src/db/mongo.js` para acceder a `mongoose.connection.db` después de conectarse; no necesita abrir una conexión paralela.
- Samuel puede reutilizar la conexión que inicia `src/server.js`, definir su ruta en `src/routes/` y registrarla en `src/routes/index.js`. `src/app.js` ya monta ese router bajo `/api`, por lo que el recurso previsto queda en `/api/resenas`.
- Ya existen reseñas de Unidad 1 en PostgreSQL: `POST` y `GET /api/products/:id/reviews`, y `DELETE /api/reviews/:id`; están en `src/routes/review.routes.js`, `src/controllers/review.controller.js` y `src/services/review.service.js`. El nuevo `/api/resenas` no debe reemplazarlas ni duplicarlas accidentalmente.

## Referencias a PostgreSQL y datos de prueba

En el Prisma actual, `Product.id` y `User.id` son `Int` autoincrementales (`prisma/schema.prisma`). El documento de diseño de Bri muestra `productoId: 18` y `clienteId: 42`, es decir, números, no UUID. Además, `clienteId` debe acordarse como referencia a `User.id` o a `Customer.id`: el esquema tiene ambos modelos y ambos IDs son enteros independientes; autenticación y reseñas existentes usan `User.id`. No cambies el esquema ni el documento aprobado sin acordarlo con el equipo.

`prisma/seed.js` prepara el producto `APD-CAM-001` y los usuarios de prueba `admin@apdaf.com` y `ana@correo.com`; Prisma asigna los IDs al crear los registros, así que hay que consultarlos en la base activa y no asumir los números del ejemplo de Bri. El seed actual borra registros de pedidos, usuarios, clientes, productos y categorías antes de recrearlos. **No lo ejecutes contra Supabase compartido** sin autorización y respaldo. Samuel necesitará IDs reales de un producto y un usuario existentes para validar las referencias cruzadas.
