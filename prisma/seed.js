const { readFile } = require("node:fs/promises");
const path = require("node:path");
const prisma = require("../src/db/prisma");

const seed = async () => {
  const products = JSON.parse(
    await readFile(path.join(__dirname, "..", "data", "products.json"), "utf8"),
  );

  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Seed omitido: PostgreSQL ya contiene ${count} productos.`);
    return;
  }

  await prisma.product.createMany({ data: products });
  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Product"', 'id'),
      (SELECT MAX(id) FROM "Product")
    )
  `;
  console.log(`Seed completado: ${products.length} productos importados.`);
};

seed()
  .catch((error) => {
    console.error("No se pudieron importar los productos a PostgreSQL:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
