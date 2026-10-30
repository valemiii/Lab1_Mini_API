ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);
CREATE TABLE IF NOT EXISTS "reviews" ("id" SERIAL NOT NULL, "rating" SMALLINT NOT NULL, "comment" VARCHAR(300), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "user_id" INTEGER NOT NULL, "product_id" INTEGER NOT NULL, CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_id_product_id_key" ON "reviews"("user_id","product_id");
CREATE TABLE IF NOT EXISTS "order_status_history" ("id" SERIAL NOT NULL, "order_id" INTEGER NOT NULL, "from_status" "OrderStatus" NOT NULL, "to_status" "OrderStatus" NOT NULL, "note" VARCHAR(200), "changed_by_id" INTEGER NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "order_status_history_order_id_idx" ON "order_status_history"("order_id");
CREATE TABLE IF NOT EXISTS "_ProductCategories" ("A" INTEGER NOT NULL, "B" INTEGER NOT NULL, CONSTRAINT "_ProductCategories_AB_pkey" PRIMARY KEY ("A","B"));
CREATE INDEX IF NOT EXISTS "_ProductCategories_B_index" ON "_ProductCategories"("B");
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='reviews_user_id_fkey') THEN ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='reviews_product_id_fkey') THEN ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_status_history_order_id_fkey') THEN ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_status_history_changed_by_id_fkey') THEN ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF;
END $$;
