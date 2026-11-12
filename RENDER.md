# Despliegue en Render · APDAF SPORT

Se usa **Render** (web service + PostgreSQL) en lugar de Railway. Cumple lo mismo que pide la guía: la API y la base corren en la nube a partir del repositorio de GitHub y **cada push a `main` redespliega automáticamente**.

| Dato | Valor |
|---|---|
| URL pública | https://apdaf-lab3-api.onrender.com |
| Configuración | `render.yaml` (web service `apdaf-lab3-api` + base `apdaf-lab3-db`) |
| Auto-Deploy | Activado sobre la rama `main` |

## Variables del web service

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Connection string de `apdaf-lab3-db` (desde `render.yaml`) |
| `JWT_SECRET` | Generado por Render, **distinto** al del `.env` local |
| `JWT_EXPIRES_IN` | `4h` |
| `NODE_ENV` | `production` |

## Qué pasa en cada despliegue

1. `npm ci && npx prisma generate`.
2. `npx prisma migrate deploy` aplica solo las migraciones nuevas de `prisma/migrations/` (en el taller: `20261029000000_taller` y `20261029120000_taller_fk_categorias`).
3. `npm start` siembra solo si la base está vacía (`--if-empty`) y levanta la API.

En *Logs* debe verse `All migrations have been successfully applied` y el mensaje de servidor iniciado.

## Verificar el taller en la URL pública

1. Abrir https://apdaf-lab3-api.onrender.com/api/categories (ruta nueva del taller): debe responder 200 con `_count`. El plan free tarda ~1 minuto en despertar la primera vez.
2. En Postman, importar `postman/G1_Taller.postman_collection.json` y el entorno `postman/G1_Lab3_Render.postman_environment.json`, y ejecutar **Run collection**.
3. Guardar la evidencia en `evidencias/taller-render-run.png` (o con newman: `newman run postman/G1_Taller.postman_collection.json -e postman/G1_Lab3_Render.postman_environment.json > evidencias/taller-render-run.txt`).
