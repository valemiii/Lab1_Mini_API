-- Claves UUID públicas para referenciar productos y usuarios desde documentos MongoDB.
-- Se conservan los IDs enteros existentes y sus relaciones internas.
ALTER TABLE "products"
  ADD COLUMN "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "users"
  ADD COLUMN "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX "products_uuid_key" ON "products"("uuid");
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");
