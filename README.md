# Laboratorio 3 · Relaciones, autenticación y despliegue APDAF SPORT

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | G1 |
| Emprendimiento | Catálogo y pedidos de uniformes escolares APDAF SPORT |
| Integrantes | Samuel Dávalos · Valeria Guaiguacundo · Brithany López · Daniel Palacios |
| NRC | 36878 |
| Repositorio | [Lab1_Mini_API](https://github.com/valemiii/Lab1_Mini_API) |

## Descripción

API REST para administrar el catálogo y pedidos de uniformes escolares APDAF SPORT. Este repositorio continúa el Lab 2 y ahora integra relaciones de Prisma, autenticación JWT con bcrypt, autorización por rol, pedidos con descuento transaccional de stock y consultas administrativas. Los productos y precios semilla son datos demostrativos, no inventario confirmado.

## Requisitos y ejecución local

- Node.js 20.19 o superior y npm.
- PostgreSQL 17 disponible según `DATABASE_URL` en `.env`.
- Copia `.env.example` a `.env` y configura la URL local y un `JWT_SECRET` aleatorio de al menos 32 caracteres. `.env` nunca se sube a GitHub.
- Si ya tienes PostgreSQL activo en `localhost:5433`, úsalo. No levantes otro contenedor que compita por el mismo puerto.

```bash
npm ci
npx prisma migrate deploy
npm run db:generate
npm run db:seed
npm run dev
```

La API local queda en `http://localhost:3000`. `GET /` devuelve el estado. `npm run db:seed` elimina y recarga los datos de demostración, así que úsalo solo en una base local del laboratorio. El seed crea estas credenciales de prueba: `admin@apdafsport.com` / `Admin123*` y `cliente@apdafsport.com` / `Cliente123*`. No reutilices esas claves fuera de esta práctica.

## Modelo y decisiones de relaciones

El esquema de Prisma contiene User, Customer, Category, Product, Order y OrderItem. Se implementa la relación 1:1 User–Customer, 1:N Customer–Order y N:M Order–Product mediante OrderItem, que guarda cantidad y precio unitario histórico. Category–Product es 1:N. `MODELO_ER.md` documenta cardinalidades y políticas de borrado.

Los enums `Role` y `OrderStatus`, los precios `Decimal(10,2)`, las fechas `DateTime`, los mapeos snake_case y los índices se encuentran en `prisma/schema.prisma`. El stock se actualiza condicionalmente dentro de una transacción y no puede quedar negativo.

Políticas `onDelete`: User–Customer `Cascade` (el perfil depende de su cuenta); Category–Product `SetNull` (conserva el producto); Customer–Order `Restrict` (conserva historial); Order–OrderItem `Cascade` (el detalle depende del pedido); Product–OrderItem `Restrict` (protege el detalle histórico).

## Endpoints

| Método | Ruta | Acceso | Resultado principal |
|---|---|---|---|
| POST | `/api/auth/register` | Público | 201 crea cuenta y perfil; 400 validación; 409 correo repetido |
| POST | `/api/auth/login` | Público | 200 token; 401 credenciales inválidas |
| GET | `/api/auth/me` | Token | 200 perfil público; 401 falta token; 403 token inválido/expirado |
| GET | `/api/products` | Público | 200 catálogo |
| GET | `/api/products/:id` | Público | 200 producto; 404 no existe |
| POST, PUT, DELETE | `/api/products` y `/api/products/:id` | ADMIN | CRUD protegido; 201/200/204, 400/404/409 |
| POST | `/api/products/lote` | ADMIN | 201 lote atómico; 400/409 rollback |
| POST | `/api/orders` | USER autenticado | 201 pedido; 400 entrada inválida; 404 producto inexistente; 409 stock insuficiente |
| GET | `/api/orders` | USER autenticado | Pedidos propios con ítems y productos |
| PATCH | `/api/orders/:id/cancel` | USER propietario | Cancela pedido pendiente y devuelve stock; 403/404/409 según caso |
| GET | `/api/admin/orders` | ADMIN | Filtros `status`, `from`, `to`, paginación `page`, `limit`, `count` |
| PATCH | `/api/admin/orders/:id/status` | ADMIN | Actualiza estado del pedido |
| GET | `/api/admin/reports/top-products` | ADMIN | Agrupación de productos y unidades vendidas |

Las rutas administrativas y escrituras del catálogo requieren `Authorization: Bearer <token>`. Los errores de autenticación usan 401/403 y los conflictos de unicidad, relaciones o disponibilidad usan 409. No se devuelve nunca el hash de contraseña.

## Transacción y consultas

`POST /api/orders` recibe `{"items":[{"productId":1,"quantity":2}]}`. En una transacción comprueba cada producto y descuenta stock mediante `updateMany` condicionado por `stock >= quantity`. Si un producto no existe responde 404; si no hay stock responde 409 y se revierte el pedido y cualquier descuento previo. `PATCH /api/orders/:id/cancel` verifica propietario y estado pendiente; la transición condicional evita devolver stock dos veces.

El administrador puede filtrar pedidos por estado y fechas, paginar con `skip`/`take`, obtener el conteo y recibir `include` de cliente e ítems. El reporte usa `groupBy` para sumar unidades por producto, excluyendo pedidos cancelados.

## Postman

Importa `postman/G1_Lab3.postman_collection.json`, selecciona `baseUrl` y ejecuta la colección en orden después de cargar el seed. La colección comprueba registro y login, roles, COMMIT, ROLLBACK por stock insuficiente, cancelación, filtros y `groupBy`. El último resultado local de Newman está en `evidencias/newman-lab3-run.txt` (25 solicitudes, 39 aserciones, 0 fallidas). El entorno para Railway está en `postman/G1_Lab3_Railway.postman_environment.json`; reemplaza el dominio de ejemplo después del despliegue y exporta el entorno desde Postman.

## Despliegue Railway

Sigue `RAILWAY.md`. El servicio requiere `DATABASE_URL` (referencia a la base Railway), `JWT_SECRET` distinto del local, `JWT_EXPIRES_IN=4h` y `NODE_ENV=production`. `npm start` ejecuta `prisma migrate deploy` antes de iniciar la API; `postinstall` genera Prisma Client. La URL pública y la evidencia `evidencias/railway-run.png` se agregan luego de desplegar y ejecutar Postman contra Railway.

**Estado local verificado:** migración aplicada y sincronizada; seed ejecutado dos veces; smoke test con 10 escenarios y colección Newman con 25 solicitudes, 39 aserciones y 0 fallidas. **Pendiente externo:** crear el servicio de Railway, asignar dominio, ejecutar seed y Postman contra la base pública, y guardar la captura de Railway. La URL pública se añadirá después de comprobarla.

## Distribución para el trabajo y sustentación del equipo

La siguiente es una distribución propuesta de áreas para los cuatro integrantes. Cada persona debe revisar, probar y poder explicar su área antes de entregar; ajusten la tabla si el trabajo real se repartió de otra forma.

| Integrante | Área para revisar y sustentar |
|---|---|
| Valeria Guaiguacundo · Persona 1 | Modelo de datos, relaciones y políticas `onDelete`; `prisma/schema.prisma`, `MODELO_ER.md` y migración. |
| Samuel Dávalos · Persona 2 | Registro/login, bcrypt, JWT, middleware y autorización; `auth.service.js` y `src/middlewares/auth.js`. |
| Daniel Palacios · Persona 3 | Pedidos, control de stock transaccional, cancelación y rollback; `order.service.js` y colección Postman. |
| Brithany López · Persona 4 | Administración, consultas paginadas y agregadas, README, pruebas y preparación del despliegue. |

## Uso de IA

Se utilizaron asistentes de IA para revisar requisitos, explicar Prisma/JWT, detectar errores y preparar documentación y pruebas. El equipo debe validar cada cambio, ejecutar la aplicación y poder sustentar sus decisiones y resultados. La asistencia de IA no sustituye la revisión ni las pruebas de cada integrante.

## Estructura relevante

```text
prisma/schema.prisma          Modelos, relaciones y mapeos
prisma/migrations/            Historial versionado de cambios
prisma/seed.js                Datos demostrativos y cuentas de prueba
src/routes/                   Rutas Express
src/controllers/              Lectura HTTP y respuestas
src/services/                 Lógica, Prisma y transacciones
src/middlewares/auth.js       JWT y roles
postman/                      Colección y entorno para pruebas
evidencias/                   Capturas de ejecución
RAILWAY.md                    Guía del despliegue
```

