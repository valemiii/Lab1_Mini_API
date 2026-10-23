# Verificación final de la rúbrica

Fecha de revisión: 23/10/2026  
Responsable: DanielPalacios98

## Pruebas ejecutadas

- `npm ci`: instalación limpia completada sin vulnerabilidades.
- `npm run test:smoke`: 9 escenarios aprobados.
- Postman: 13 solicitudes, 21 pruebas aprobadas, 0 fallos y 0 errores.
- Códigos comprobados: 200, 201, 204, 400 y 404.

## Rúbrica

1. **Propuesta y modelo:** cumple. Incluye problema, usuarios, funciones, mapa, tres entidades, cuatro campos del producto y validaciones de `name` y `price`.
2. **MVC y CRUD:** cumple. Las rutas, controladores, servicio y modelo están separados; los cinco endpoints funcionan.
3. **HTTP y middlewares:** cumple. El logger registra método, ruta, estado y duración; el manejador responde JSON, controla JSON inválido y oculta el stack en producción.
4. **Postman y README:** cumple. La colección incluye casos exitosos y de error, el README documenta endpoints, validaciones, aportes y uso de IA, y las evidencias están en `evidencias/`.

## Resultado

El proyecto queda técnicamente listo para la entrega del Laboratorio 1. La calificación estimada conforme a la rúbrica es **20/20**, sujeta a la revisión del docente y a la presentación académica del equipo.
