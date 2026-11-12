-- Taller · segunda migración del integrador (sección 5 de la guía):
-- la migración "taller" creó la tabla intermedia N:M _ProductCategories sin sus llaves foráneas.
-- Se agregan con ON DELETE CASCADE, igual que las genera Prisma para una relación N:M implícita.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='_ProductCategories_A_fkey') THEN
   DELETE FROM "_ProductCategories" WHERE "A" NOT IN (SELECT "id" FROM "categories");
   ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='_ProductCategories_B_fkey') THEN
   DELETE FROM "_ProductCategories" WHERE "B" NOT IN (SELECT "id" FROM "products");
   ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
 END IF;
END $$;
