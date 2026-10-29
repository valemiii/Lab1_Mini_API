// Datos de prueba de APDAF SPORT: npx prisma db seed  (o npm run db:seed)
// Con --if-empty (lo usa `npm start` en Render) solo siembra si la base no tiene usuarios,
// así un reinicio del servidor no borra los pedidos creados.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db/prisma"); // el mismo cliente que usa la API

async function main() {
  if (process.argv.includes("--if-empty") && (await prisma.user.count()) > 0) {
    console.log("Seed omitido: la base ya tiene datos");
    return;
  }

  // 1. Limpia en orden inverso a las FK (hijos antes que padres)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Categorías (padre) y productos (hijo, 1:N)
  const [camisas, pantalones, chompas] = await Promise.all(
    ["camisas", "pantalones", "chompas"].map((name) =>
      prisma.category.create({ data: { name, description: `Uniformes: ${name}` } })
    )
  );
  await prisma.product.createMany({
    data: [
      { name: "Camisa polo APDAF", sku: "APD-CAM-001", price: 18.5, stock: 40, category: "camisas", categoryId: camisas.id, institution: "APDAF" },
      { name: "Pantalón escolar APDAF", sku: "APD-PAN-001", price: 22.0, stock: 25, category: "pantalones", categoryId: pantalones.id, institution: "APDAF" },
      { name: "Chompa institucional APDAF", sku: "APD-CHO-001", price: 32.5, stock: 15, category: "chompas", categoryId: chompas.id, institution: "APDAF" },
    ],
  });

  // 3. Usuarios con su perfil (1:1) en una sola escritura anidada
  await prisma.user.create({
    data: {
      email: "admin@apdaf.com",
      password: await bcrypt.hash("Admin123*", 10),
      name: "Administración APDAF",
      role: "ADMIN",
      customer: { create: { fullName: "Administración APDAF", email: "admin@apdaf.com" } },
    },
  });
  const ana = await prisma.user.create({
    data: {
      email: "ana@correo.com",
      password: await bcrypt.hash("Ana12345*", 10),
      name: "Ana Torres",
      customer: { create: { fullName: "Ana Torres", email: "ana@correo.com", phone: "0991234567" } },
    },
    include: { customer: true },
  });

  // 4. Un pedido de ejemplo (1:N Customer→Order y N:M Order↔Product)
  const camisa = await prisma.product.findUnique({ where: { sku: "APD-CAM-001" } });
  await prisma.order.create({
    data: {
      customerId: ana.customer.id,
      total: Number(camisa.price) * 2,
      status: "DELIVERED",
      items: { create: [{ productId: camisa.id, quantity: 2, unitPrice: camisa.price }] },
    },
  });

  console.log(
    `Seed listo: ${await prisma.product.count()} productos, ${await prisma.user.count()} usuarios, ${await prisma.order.count()} pedidos`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
