require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db/prisma");

async function main() {
  // Hijos primero para respetar FKs al volver a ejecutar el seed.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Uniforme diario", description: "Prendas de uso diario" } }),
    prisma.category.create({ data: { name: "Uniforme deportivo", description: "Prendas para actividades deportivas" } }),
    prisma.category.create({ data: { name: "Accesorios", description: "Accesorios escolares" } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { name: "Camiseta Polo T34 Alvernia", sku: "ALV-POLO-T34", price: 10, stock: 5, notes: "Talla 34", institution: "Alvernia", category: "Uniforme diario", categoryId: categories[0].id } }),
    prisma.product.create({ data: { name: "Chompa de Calentador T34", sku: "ALV-CHOMPA-T34", price: 17, stock: 3, notes: "Talla 34", institution: "Alvernia", category: "Uniforme deportivo", categoryId: categories[1].id } }),
    prisma.product.create({ data: { name: "Pantalón T34", sku: "ALV-PANTALON-T34", price: 20, stock: 8, notes: "Talla 34", institution: "Alvernia", category: "Uniforme diario", categoryId: categories[0].id } }),
  ]);

  const adminPassword = await bcrypt.hash("Admin123*", 10);
  await prisma.user.create({ data: { email: "admin@apdafsport.com", password: adminPassword, name: "Administración APDAF SPORT", role: "ADMIN" } });

  const customerUser = await prisma.user.create({
    data: {
      email: "cliente@apdafsport.com",
      password: await bcrypt.hash("Cliente123*", 10),
      name: "Cliente de prueba",
      customer: { create: { fullName: "Cliente de prueba", email: "cliente@apdafsport.com", phone: "0990000000" } },
    },
    include: { customer: true },
  });
  await prisma.order.create({
    data: {
      customerId: customerUser.customer.id,
      total: products[0].price,
      status: "DELIVERED",
      items: { create: [{ productId: products[0].id, quantity: 1, unitPrice: products[0].price }] },
    },
  });
  // El stock refleja también el pedido histórico de ejemplo.
  await prisma.product.update({ where: { id: products[0].id }, data: { stock: { decrement: 1 } } });
  console.log(`Seed listo: ${products.length} productos, ${categories.length} categorías, 2 usuarios y 1 pedido.`);
}

main()
  .catch((error) => {
    console.error("No se pudo cargar el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
