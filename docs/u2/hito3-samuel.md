# Hito 3 — Samuel: creación de reseñas

## Endpoint

POST /api/resenas recibe un documento de reseña y devuelve 201 Created con
estrellas incluido en la representación JSON. La ruta sigue la arquitectura
routes → controllers → services → models; el servicio valida y persiste con
Mongoose en la colección explícita resenas.

## Contrato de entrada

{
  "productoId": "UUID existente de products.uuid en PostgreSQL",
  "usuarioId": "UUID existente de users.uuid en PostgreSQL",
  "calificacion": 5,
  "comentario": "La tela es cómoda y la talla coincide con la guía.",
  "imagenes": ["https://apdafsport.com/img/camisa-1.jpg"]
}

imagenes, estado y respuestaEmpresa son opcionales. Si no se especifica estado,
se guarda como pendiente. fechaCreacion se asigna automáticamente. estrellas es
un virtual con caracteres ★ repetidos según calificacion.

## Referencias PostgreSQL y respuesta acordada

El esquema Prisma existente usa IDs enteros internos en User y Product, y no
tenía UUID públicos. Para mantener esas claves primarias y relaciones, esta
entrega agrega la columna única uuid a ambas entidades. La migración asigna un
UUID a cada registro existente y genera automáticamente el UUID de registros
nuevos.

Antes de insertar la reseña, el servicio consulta Product.uuid y User.uuid.
Si falta una referencia, responde 404 con el campo correspondiente en el mensaje
y no crea el documento MongoDB. Si Mongoose detecta campos inválidos, responde
400 con un arreglo detalles que identifica cada campo y su mensaje. El registro
solo se guarda si ambas referencias existen.

## Campos y reglas

- productoId y usuarioId: UUID obligatorios.
- calificacion: número entero obligatorio entre 1 y 5.
- comentario: obligatorio, de 10 a 1000 caracteres después de eliminar los
  espacios iniciales y finales.
- imagenes: opcional, máximo cinco URL HTTP/HTTPS.
- fechaCreacion: fecha automática.
- respuestaEmpresa: objeto opcional con mensaje y fecha.
- estado: pendiente, publicada u oculta; por defecto pendiente.

El middleware pre("validate") usa una función tradicional para acceder al
documento mediante this y normaliza comentario antes de sus validaciones.

## Preparación y comprobación manual

1. Aplicar la migración en la base PostgreSQL de desarrollo: npm run db:deploy.
2. Obtener valores uuid de las tablas products y users desde Prisma Studio
   (npx prisma studio) o una consulta de solo lectura.
3. Iniciar MongoDB y configurar MONGODB_URI; el Compose local expone el puerto
   27018.
4. Iniciar la API con npm run dev.
5. En Postman importar postman/G1_U2_Hito3_Samuel.postman_collection.json,
   establecer baseUrl, productoId y usuarioId, y ejecutar la colección.
6. Verificar 201 y el virtual estrellas; luego ejecutar los cuerpos inválidos
   para confirmar 400 y probar una referencia inexistente para confirmar 404.

La migración no debe ejecutarse sobre una base que no sea el entorno autorizado
de desarrollo. Esta entrega no aplica migraciones automáticamente a una base
remota.
