# Preparación del entorno U2

Guía para iniciar el entorno local de APDAF SPORT y ejecutar el playground y el POST de reseñas ya implementados.

## Regla del proyecto: conservar `.env.example`

Por indicación de Valeria, `.env.example` debe conservarse exactamente como ella lo dejó. No editarlo, completar sus marcadores, normalizarlo ni reemplazar sus valores durante tareas de configuración, documentación o verificación. Cualquier modificación requiere una nueva autorización explícita de Valeria.

La configuración de cada instalación se realiza únicamente en su `.env` local, excluido de Git. No sobrescribir una configuración local existente ni publicar credenciales. Si una plantilla del laboratorio solicita cambios en `.env.example`, documentar la diferencia sin modificar el archivo.

## Playground aislado de Parte 1

El script reinicia exclusivamente `resenas` y `reportes_resenas` de la base reservada `apdaf_u2_playground_test`; nunca ejecutarlo sobre la base de evidencias. Selecciona esa base explícitamente en su código. Las credenciales siguientes son ejemplos del Docker Compose, no necesariamente las del servicio local existente:

```powershell
mongosh "mongodb://apdaf_admin:apdaf_local_password@localhost:27018/apdaf_u2_playground_test?authSource=admin" --file docs/u2/grupo1.mongodb.js
```

Si solo está disponible mongosh dentro del contenedor existente `espe-mongo`, ejecutar desde PowerShell:

```powershell
docker cp docs/u2/grupo1.mongodb.js espe-mongo:/tmp/apdaf-u2-parte1-playground.js
docker exec espe-mongo sh -c 'mongosh --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --file /tmp/apdaf-u2-parte1-playground.js'
```

Usar un archivo con `--file`, no pegarlo en el REPL: la agregación encadenada ocupa varias líneas. Resultado esperado: dos inserciones válidas, rechazos por `calificacion` y `estado`, dos reportes y dos resultados de `$lookup` con `$unwind`. Las referencias UUID del playground son ilustrativas y no consultan PostgreSQL. La colección Postman y sus resultados nuevos están descritos en [valeria-pruebas-evidencias.md](./valeria-pruebas-evidencias.md).

## Requisitos detectados

- Node.js **20.19 o posterior** (Mongoose 9 requiere `>=20.19`). En el entorno de preparación se detectó Node **26.3.0** y npm **11.16.0**.
- Docker Engine/Desktop con Docker Compose. Se detectaron Docker **29.8.2** y Compose **5.5.1**, pero el daemon no estaba iniciado durante la preparación; inicia Docker Desktop antes de levantar el contenedor.
- El puerto local **27017** ya lo ocupa un proceso `mongod`; Compose publica MongoDB en **27018** para no detener ni interferir con ese proceso.

## Instalación y configuración

Desde la raíz del repositorio:

```powershell
npm ci
# Solo si no existe .env; conservar la configuración local existente.
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
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

El `.env.example` publicado actualmente contiene marcadores: hay que sustituirlos por valores locales. El proyecto no tiene un servicio Compose para la API; Node ejecutado en Windows conecta al puerto publicado (`localhost:27018`). Si posteriormente Node se ejecuta dentro de Compose, debe usar el nombre del servicio y el puerto interno: `mongodb:27017`, no `localhost:27018`.

## Conflictos con servicios Docker ya existentes

En el entorno de Valeria se comprobó que:

| Recurso | Servicio que ya lo utiliza | Consecuencia |
|---|---|---|
| Nombre `lab2-postgres` | Contenedor previo, publicado en 5432 | Compose no puede crear otro contenedor con ese nombre. |
| Puerto 5433 | `espe-postgres` | El PostgreSQL de este Compose no puede publicar el mismo puerto. |
| Puerto 27018 | `espe-mongo` | El MongoDB de este Compose no puede arrancar en el mismo puerto. |
| Puerto 3000 | Otra ejecución de la API, cuando está activa | Una segunda ejecución produce `EADDRINUSE`. |

`docker compose config --quiet` pasa: la configuración es válida, pero `docker compose up -d` no puede completar el arranque mientras esos recursos estén ocupados. No se eliminó ni renombró ningún contenedor previo y no se borraron volúmenes. El contenedor nuevo `grupal-mongodb-1` quedó creado pero detenido por el conflicto.

Para este equipo se reutilizaron los servicios existentes autorizados. Comprobarlos sin modificarlos:

```powershell
docker ps --format "{{.Names}} {{.Status}} {{.Ports}}"
docker compose ps -a
```

Si están detenidos, iniciar solo los contenedores existentes de esta instalación:

```powershell
docker start espe-postgres espe-mongo
```

Configurar `.env` con PostgreSQL en `localhost:5433`, base `lab2_apdaf`, y MongoDB en `127.0.0.1:27018`, base `apdaf_sport`, con `authSource=admin`. Usar las credenciales locales de esos servicios; no necesariamente coinciden con las credenciales de ejemplo del Compose del proyecto. No publicar `.env`.

La base `lab2_apdaf` se creó y se aplicaron siete migraciones. Si se prepara otro entorno vacío, crear primero la base autorizada y luego ejecutar:

```powershell
npm run db:generate
npm run db:deploy
npm run dev
```

Mantener una sola ejecución de la API en el puerto 3000. Detener con Ctrl+C únicamente la ejecución propia duplicada. En una máquina sin conflictos se puede usar `docker compose up -d`; en esta máquina la alternativa verificada es reutilizar los servicios anteriores. No ejecutar `docker compose down -v` ni eliminar contenedores ajenos para liberar puertos.

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

En Prisma, `Product.id` y `User.id` siguen siendo `Int` autoincrementales. Ambos modelos también tienen `uuid` único. El POST MongoDB recibe `productoId` y `usuarioId` como cadenas UUID y consulta `products.uuid` y `users.uuid`; no utiliza `Customer.id` ni un campo `clienteId`. Hitos 1 y 2 ya documentan este contrato.

Consultar UUID existentes con `SELECT uuid FROM products LIMIT 1;` y `SELECT uuid FROM users LIMIT 1;`. El seed actual borra registros antes de recrearlos: **no ejecutarlo contra Supabase compartido** sin autorización y respaldo. Para las pruebas de Valeria se crearon registros locales identificables sin ejecutar ese seed. Sus UUID y las evidencias están en [valeria-pruebas-evidencias.md](./valeria-pruebas-evidencias.md).
