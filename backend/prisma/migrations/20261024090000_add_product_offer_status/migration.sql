ALTER TABLE "products"
ADD COLUMN "offerStatus" TEXT NOT NULL DEFAULT 'NONE';

CREATE INDEX "products_offerStatus_idx" ON "products"("offerStatus");
