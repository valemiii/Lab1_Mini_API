// Carga datos de prueba sin tocar la base a mano: npx prisma db seed
// TODO Paso 2: adapta a tus entidades. Conserva el usuario ADMIN (lo usa la colección de Postman).
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db/prisma"); // el mismo cliente (con adaptador) que usa la API

async function main() {
  // 1. Limpia en orden inverso a las relaciones (hijos antes que padres)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // 2. Catálogo APDAF SPORT
  await prisma.product.createMany({
    data: [
      { name: "Camisa polo APDAF", price: 18.5, stock: 40, category: "camisas", institution: "APDAF" },
      { name: "Pantalón escolar APDAF", price: 22.0, stock: 25, category: "pantalones", institution: "APDAF" },
      { name: "Chompa institucional APDAF", price: 32.5, stock: 15, category: "chompas", institution: "APDAF" },
    ],
  });

  // 3. Usuarios con perfil (1:1) en una sola escritura anidada
  const password = await bcrypt.hash("Admin123*", 10);
  await prisma.user.create({
    data: { email: "admin@apdaf.com", password, name: "Administración APDAF", role: "ADMIN", customer: { create: { fullName: "Administración APDAF", email: "admin@apdaf.com" } } },
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

  // 4. Un pedido de ejemplo (1:N y N:M)
  const cafe = await prisma.product.findUnique({ where: { name: "Camisa polo APDAF" } });
  await prisma.order.create({
    data: {
      customerId: ana.customer.id,
      total: 5,
      status: "DELIVERED",
      items: { create: [{ productId: cafe.id, quantity: 2, unitPrice: cafe.price }] },
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
