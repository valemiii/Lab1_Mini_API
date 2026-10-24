const prisma = require("../src/db/prisma");

const seed = async () => {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "Camiseta Polo T34 Alvernia",
        sku: "ALV-POLO-T34",
        price: 10,
        notes: "Institución: Alvernia; categoría: Uniforme diario",
        institution: "Alvernia",
        category: "Uniforme diario",
      },
      {
        name: "Chompa de Calentador T34",
        sku: "ALV-CHOMPA-T34",
        price: 17,
        notes: "Institución: Alvernia; categoría: Uniforme deportivo",
        institution: "Alvernia",
        category: "Uniforme deportivo",
      },
      {
        name: "Pantalón T34",
        sku: "ALV-PANTALON-T34",
        price: 20,
        notes: "Institución: Alvernia; categoría: Uniforme diario",
        institution: "Alvernia",
        category: "Uniforme diario",
      },
    ],
  });

  await prisma.category.createMany({
    data: [
      { name: "Uniforme diario", description: "Prendas de uso diario" },
      { name: "Uniforme deportivo", description: "Prendas para actividades deportivas" },
      { name: "Accesorios", description: "Accesorios del uniforme escolar" },
    ],
  });

  console.log("Seed completado: 3 productos y 3 categorías cargados.");
};

seed()
  .catch((error) => {
    console.error("No se pudieron cargar los datos iniciales:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
