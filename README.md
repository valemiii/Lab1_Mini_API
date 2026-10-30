# Laboratorio 3 y Taller · Relaciones, autenticación y despliegue · APDAF SPORT

**Desarrollo Web Avanzado (A0R04) · ESPE · Grupo G1**

| Dato | Valor |
|---|---|
| Grupo | G1 |
| Emprendimiento | Catálogo y pedidos de uniformes escolares APDAF SPORT |
| Integrantes | 1. Samuel Dávalos · 2. Valeria Guaiguacundo · 3. Brithany López · 4. Daniel Palacios |
| NRC | 36878 |
| Repositorio | https://github.com/valemiii/Lab1_Mini_API |
| **URL pública** | **https://apdaf-lab3-api.onrender.com** |

API REST del catálogo de uniformes APDAF SPORT con Express + Prisma + PostgreSQL: autenticación JWT con bcrypt, roles USER/ADMIN, relaciones 1:1, 1:N y N:M, pedidos con transacción que consume stock, módulo de administración con consultas avanzadas y despliegue en Render + PostgreSQL de Render.

> **Despliegue:** la API y la base PostgreSQL de esta configuración están en Render (`render.yaml`). El enunciado menciona Render + Neon como alternativa a Railway; confirmar con el docente si la base PostgreSQL de Render satisface esa alternativa.

## Lab 3

### Usuarios de prueba (creados por el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | `admin@apdaf.com` | `Admin123*` |
| USER | `ana@correo.com` | `Ana12345*` |

### Endpoints

Leyenda: 🌐 público · 🔑 requiere token (cualquier rol) · 🛡️ requiere token con rol ADMIN.

| Verbo | Ruta | Acceso | Qué hace | Éxito | Errores |
|---|---|---|---|---|---|
| GET | `/` | 🌐 | Estado de la API | 200 | — |
| POST | `/api/auth/register` | 🌐 | Crea usuario + perfil Customer (1:1, escritura anidada) | 201 | 400, 409 (correo repetido) |
| POST | `/api/auth/login` | 🌐 | Devuelve el JWT `{ id, role }` | 200 | 401 (mensaje genérico) |
| GET | `/api/auth/me` | 🔑 | Perfil del usuario sin contraseña | 200 | 401, 403 |
| GET | `/api/products` | 🌐 | Lista el catálogo | 200 | — |
| GET | `/api/products/:id` | 🌐 | Consulta un producto | 200 | 400, 404 |
| POST | `/api/products` | 🛡️ | Crea producto | 201 | 400, 401, 403 |
| POST | `/api/products/lote` | 🛡️ | Crea varios productos en una transacción | 201 | 400, 401, 403 |
| PUT | `/api/products/:id` | 🛡️ | Actualiza producto | 200 | 400, 401, 403, 404 |
| DELETE | `/api/products/:id` | 🛡️ | Elimina producto | 204 | 401, 403, 404, 409 (tiene pedidos · Restrict) |
| POST | `/api/orders` | 🔑 | Crea pedido y descuenta stock en `$transaction` | 201 | 400, 401, 403, 404, 409 (stock insuficiente → ROLLBACK) |
| GET | `/api/orders` | 🔑 | Mis pedidos con `include` (ítems + producto) y `orderBy` | 200 | 401, 403 |
| PATCH | `/api/orders/:id/cancel` | 🔑 | Cancela y devuelve el stock (transacción) | 200 | 401, 403 (no es tuyo), 404, 409 (no está PENDING) |
| GET | `/api/admin/orders?status=&from=&to=&page=&limit=` | 🛡️ | Filtros + paginación + `count` → `{ page, limit, total, pages, data }` | 200 | 400, 401, 403 |
| PATCH | `/api/admin/orders/:id/status` | 🛡️ | Cambia el estado de un pedido | 200 | 400, 401, 403, 404 |
| GET | `/api/admin/reports/top-products?limit=` | 🛡️ | Productos más vendidos con `groupBy` + `_sum` | 200 | 401, 403 |

Códigos de autenticación: sin token → **401**; token inválido/expirado o rol insuficiente → **403**; correo o clave incorrectos → **401** con el mismo mensaje.

### Decisiones de `onDelete`

| Relación | onDelete | Por qué |
|---|---|---|
| User 1:1 Customer | Cascade | El perfil no existe sin su cuenta. |
| Customer 1:N Order | Restrict | Los pedidos son historial de ventas; no se borra un cliente que compró. |
| Category 1:N Product | SetNull | El producto sigue en el catálogo aunque se borre su categoría. |
| Order → OrderItem | Cascade | Las líneas pertenecen a su pedido. |
| Product → OrderItem | Restrict | No se pierde el detalle ni el precio histórico de pedidos (409 al borrar). |

Detalle completo en [`MODELO_ER.md`](MODELO_ER.md).

### Arquitectura

`routes → controllers → services`. Las rutas solo montan middlewares (`authenticateToken`, `requireRole`) y controladores; los controladores leen `req` y responden; **todas las consultas de Prisma están en `src/services/`**.

```text
src/
├── app.js / server.js
├── routes/        index, auth, product, order, admin, category, review, me
├── controllers/   auth, product, order, admin, category, review, me
├── services/      auth (bcrypt + JWT), product, order (transacciones e historial), admin (filtros y reportes), category, review, me
├── middlewares/   auth (authenticateToken, requireRole), errorHandler, logger, notFound
├── db/prisma.js
└── utils/httpError.js
prisma/            schema.prisma, migrations/, seed.js
postman/           colecciones G1_Lab3 y G1_Taller, entorno G1_Lab3_Render
evidencias/        resultados Newman local y Render, capturas
```

### Ejecución local

```bash
npm ci
cp .env.example .env            # DATABASE_URL y JWT_SECRET
npx prisma migrate deploy       # o: npx prisma migrate dev
npx prisma generate
npm run db:seed                 # admin@apdaf.com / Admin123*
npm run dev                     # http://localhost:3000
```

### Despliegue (Render)

- `render.yaml` crea el web service `apdaf-lab3-api` y la base `apdaf-lab3-db`; `DATABASE_URL` se toma de la base, `JWT_SECRET` se genera en Render (distinto al local) y `NODE_ENV=production`.
- Render redespliega automáticamente cada push a `main` (Auto-Deploy). Guía paso a paso en `RENDER.md`.
- `npm start` ejecuta `prisma migrate deploy` (migraciones automáticas), luego `node prisma/seed.js --if-empty` (siembra solo si la base está vacía, así un reinicio no borra pedidos) y levanta la API.

### Postman

Importar `postman/G1_Lab3.postman_collection.json` (Lab 3) o `postman/G1_Taller.postman_collection.json` (Lab 3 + Taller) y el entorno `postman/G1_Lab3_Render.postman_environment.json` (`baseUrl = https://apdaf-lab3-api.onrender.com`). **Run collection** en local y con el entorno Render. Evidencias en `evidencias/`.

### Distribución del trabajo del Lab 3

Esta tabla resume la distribución acordada para revisar y sustentar el laboratorio. Ajústenla si el aporte real del equipo fue distinto.

| Integrante | Aporte en el Lab 3 |
|---|---|
| Valeria Guaiguacundo | Relaciones y mapeo: `prisma/schema.prisma`, migraciones, `MODELO_ER.md`, `prisma/seed.js`. |
| Samuel Dávalos | Autenticación en capas: `auth.routes.js`, `auth.controller.js`, `auth.service.js`, `middlewares/auth.js` (`requireRole`). |
| Daniel Palacios | Pedidos con transacción: `src/services/order.service.js` (stock con `updateMany` condicional, 409/ROLLBACK, cancelación), `order.routes.js`, `order.controller.js`. |
| Brithany López | Módulo admin (`admin.service.js`: filtros, paginación, `groupBy`), `errorHandler.js`, colección y entorno de Postman, evidencias. |

### Declaración de uso de IA

- **Herramientas:** GitHub Copilot, ChatGPT y Claude.
- **Para qué:** consultar la sintaxis de relaciones y `$transaction` de Prisma, entender errores de migración (enums duplicados en el despliegue), revisar la entrega contra la rúbrica y alinear `schema.prisma` con las migraciones ya aplicadas en Render, redactar este README y `MODELO_ER.md`.
- **Verificación documentada:** `evidencias/taller-local-run.txt` registra la colección integrada en local (77 solicitudes, 127 aserciones y 0 fallos). `evidencias/render-run.txt` registra la colección de Lab 3 contra Render (24 solicitudes, 39 aserciones y 0 fallos). La colección integrada del Taller no tiene un reporte de ejecución en Render en esta carpeta. También se revisaron las FK en el SQL de `prisma/migrations/`.

## Taller · Nuevas funcionalidades

Esta sección describe las cuatro tarjetas integradas y la distribución del equipo para revisarlas y sustentarlas. Render redespliega automáticamente al actualizar `main`.

| Tarjeta | Funcionalidad | Persona asignada |
|---|---|---|
| A | Reseñas | Valeria Guaiguacundo |
| B | Categorías y búsqueda | Samuel Dávalos |
| C | Historial de estados | Brithany López |
| D | Mi cuenta e indicadores | Daniel Palacios |

### Taller · Tarjeta A · Reseñas · Valeria Guaiguacundo

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| POST | /api/products/:id/reviews | Autenticado | `{ rating: 1-5, comment? (≤300) }` | 201 reseña con autor · 400 rating fuera de 1–5 o comment > 300 · 401 sin token · 404 producto · 409 ya reseñó |
| GET | /api/products/:id/reviews | Público | — (query: `page`, `limit`) | 200 `{ productId, average, total, page, limit, pages, data }` · 404 producto |
| DELETE | /api/reviews/:id | Autor o ADMIN | — | 204 · 401 · 403 no es el autor · 404 |

**Modelo:** `Review` (1:N con `User` y con `Product`), `rating` `@db.SmallInt`, `comment` `@db.VarChar(300)`, `@@unique([userId, productId])` para que un usuario reseñe un producto una sola vez (el `P2002` se traduce a 409). `onDelete: Cascade` en ambos lados porque una reseña no tiene sentido sin su autor ni sin el producto. El promedio se calcula con `aggregate({ _avg: { rating } })` y la lista, el conteo y el promedio se leen en un `$transaction` de lecturas.
**Código:** `src/routes/review.routes.js` · `src/controllers/review.controller.js` · `src/services/review.service.js`.

### Taller · Tarjeta B · Categorías y búsqueda · Samuel Dávalos

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| POST | /api/categories | ADMIN | `{ name }` | 201 categoría · 400 name vacío · 401 · 403 · 409 duplicada |
| GET | /api/categories | Público | — | 200 lista con `_count` de productos |
| PUT | /api/products/:id/categories | ADMIN | `{ categoryIds: [1, 2] }` | 200 producto con sus categorías · 400 no es arreglo de enteros · 401 · 403 · 404 producto o categoría inexistente |
| GET | /api/products/search | Público | — (query: `q`, `category`, `min`, `max`, `sort`, `page`, `limit`) | 200 `{ page, limit, total, pages, data }` · 400 sort inválido |

**Modelo:** relación N:M implícita `Product.categories ↔ Category.taggedProducts` (`@relation("ProductCategories")`); Prisma usa la tabla intermedia `_ProductCategories` con `ON DELETE CASCADE` en ambas FK (borrar una categoría o un producto solo borra el vínculo). Se nombra la relación porque `Category` ya tenía la relación 1:N del Lab 3. El reemplazo usa `set`, la búsqueda combina `contains` + `mode: "insensitive"`, `categories: { some: … }`, rango `gte/lte` y orden dinámico (`price_asc`, `price_desc`, `name`). `/search` se declara antes de `/:id`.
**Código:** `src/routes/category.routes.js` · `src/controllers/category.controller.js` · `src/services/category.service.js` · `src/routes/product.routes.js`.

### Taller · Tarjeta C · Historial de estados · Brithany López

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| PATCH | /api/admin/orders/:id/status | ADMIN | `{ status, note? (≤200) }` | 200 pedido con historial · 400 status inválido · 401 · 403 · 404 · 409 transición no permitida o el pedido cambió mientras tanto |
| GET | /api/orders/:id/history | Dueño o ADMIN | — | 200 `{ orderId, status, history }` · 401 · 403 · 404 |

**Transiciones:** `PENDING → CONFIRMED → DELIVERED` y `PENDING | CONFIRMED → CANCELLED`.
**Modelo:** enum `OrderStatus` con `CONFIRMED`; `OrderStatusHistory` con dos relaciones 1:N (`Order` con `onDelete: Cascade`, porque el historial pertenece al pedido; `User` como `changedBy` con `onDelete: Restrict`, para no perder quién hizo cada cambio) y `@@index([orderId])`. En un `$transaction` interactivo: `updateMany` condicionado al estado actual (si `count ≠ 1` → 409 y ROLLBACK), devolución de stock si pasa a `CANCELLED` y registro en el historial; se guardan juntos o ninguno. **Reto opcional:** la cancelación que hace el propio cliente (`PATCH /api/orders/:id/cancel`) también queda en el historial.
**Código:** `src/services/admin.service.js` · `src/services/order.service.js` · `admin` y `order` routes/controllers.

### Taller · Tarjeta D · Mi cuenta e indicadores · Daniel Palacios (integrador)

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| GET | /api/me | Autenticado | — | 200 usuario + perfil 1:1 con `_count` de pedidos y `lastLoginAt`, sin contraseña · 401 |
| PATCH | /api/me | Autenticado | `{ name?, phone? }` | 200 · 400 name < 3, phone no numérico de 7–15 dígitos o body vacío · 401 |
| PATCH | /api/me/password | Autenticado | `{ currentPassword, newPassword }` | 204 · 400 nueva < 8 o igual a la actual · 401 contraseña actual incorrecta |
| GET | /api/admin/stats | ADMIN | — (query: `from`, `to`) | 200 `{ ordersByStatus, revenue, topCustomers }` · 400 fecha inválida · 401 · 403 |

**Modelo:** `User.lastLoginAt` (`@map("last_login_at")`), actualizado en cada login. `PATCH /api/me` usa una escritura anidada (`customer: { update: … }`) para cambiar `User` y su perfil 1:1 en una sola operación. La contraseña se valida con `bcrypt.compare` y se guarda con `bcrypt.hash`. Las estadísticas se leen en un `$transaction` de lecturas: `groupBy` por estado, `aggregate` (`_sum`, `_avg`) de los pedidos `DELIVERED` y top 3 clientes por gasto con `groupBy` + `orderBy _sum`.
**Código:** `src/routes/me.routes.js` · `src/controllers/me.controller.js` · `src/services/me.service.js` · `src/services/auth.service.js` · `src/services/admin.service.js`.

### Migraciones del taller

- `20261029000000_taller`: migración única del taller con los modelos de las cuatro tarjetas (fase 1).
- `20261029120000_taller_fk_categorias`: segunda migración del integrador (permitida por la guía cuando falta algo): agrega las FK de la tabla N:M `_ProductCategories`, que la primera no creó.

### Pruebas (Postman)

`postman/G1_Taller.postman_collection.json` contiene las carpetas del **Lab 3** y las cuatro del **Taller** (75 peticiones, cada una con `pm.test` sobre el código y al menos un campo). La colección es autosuficiente: registra un usuario, inicia sesión como ADMIN del seed, guarda `token`, `adminToken`, `reviewId`, `categoryId`, `orderId2` con `pm.collectionVariables.set` y crea un segundo usuario para los casos 403. Ejecutar con **Run collection** en orden, con `baseUrl` local o el entorno `postman/G1_Lab3_Render.postman_environment.json`.

Resultado en local (`evidencias/taller-local-run.txt`): 77 requests, 127 aserciones, 0 fallos.
