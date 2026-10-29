# Laboratorio 3 · Relaciones, autenticación y despliegue · APDAF SPORT

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

> **Despliegue:** se usa **Render** (web service + PostgreSQL) en lugar de Railway, opción aceptada en el enunciado ("Render + Neon con la misma colección y la URL pública en el README"). La configuración está en `render.yaml`.

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
├── routes/        index, auth, products, orders, admin
├── controllers/   auth, product, order, admin
├── services/      auth (bcrypt + JWT), product, order ($transaction), admin (filtros, groupBy)
├── middlewares/   auth (authenticateToken, requireRole), errorHandler (P2002/P2003 → 409, P2025 → 404), logger, notFound
├── db/prisma.js
└── utils/httpError.js
prisma/            schema.prisma, migrations/, seed.js
postman/           G1_Lab3.postman_collection.json + G1_Lab3_Render.postman_environment.json
evidencias/        capturas y salida de Newman
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
- `npm start` ejecuta `prisma migrate deploy` (migraciones automáticas), luego `node prisma/seed.js --if-empty` (siembra solo si la base está vacía, así un reinicio no borra pedidos) y levanta la API.

### Postman

Importar `postman/G1_Lab3.postman_collection.json` (25 peticiones: Auth, Productos por rol, Pedidos con ROLLBACK y cancelación, Admin) y el entorno `postman/G1_Lab3_Render.postman_environment.json` (`baseUrl = https://apdaf-lab3-api.onrender.com`). **Run collection** en local y con el entorno Render. Evidencias en `evidencias/`.

### Aporte de cada integrante

| Integrante | Aporte en el Lab 3 |
|---|---|
| Valeria Guaiguacundo | Relaciones y mapeo: `prisma/schema.prisma`, migraciones, `MODELO_ER.md`, `prisma/seed.js`. |
| Samuel Dávalos | Pedidos con transacción: `src/services/order.service.js` (stock con `updateMany` condicional, 409/ROLLBACK, cancelación), `order.routes.js`, `order.controller.js`. |
| Daniel Palacios | Autenticación en capas: `auth.routes.js`, `auth.controller.js`, `auth.service.js`, `middlewares/auth.js` (`requireRole`); despliegue en Render (`render.yaml`). |
| Brithany López | Módulo admin (`admin.service.js`: filtros, paginación, `groupBy`), `errorHandler.js`, colección y entorno de Postman, evidencias. |

### Declaración de uso de IA

- **Herramientas:** GitHub Copilot, ChatGPT y Claude.
- **Para qué:** consultar la sintaxis de relaciones y `$transaction` de Prisma, entender errores de migración (enums duplicados en el despliegue), revisar la entrega contra la rúbrica y alinear `schema.prisma` con las migraciones ya aplicadas en Render, redactar este README y `MODELO_ER.md`.
- **Verificación:** el equipo ejecutó la colección de Postman en local y contra la URL pública, y revisó las FK en el SQL de `prisma/migrations/`. Cada integrante puede sustentar su parte.
