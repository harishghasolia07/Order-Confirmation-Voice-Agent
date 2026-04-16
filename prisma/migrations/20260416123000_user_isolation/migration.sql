-- Drop previous global uniqueness on orderId
DROP INDEX IF EXISTS "OrderConfirmation_orderId_key";

-- Add per-user ownership
ALTER TABLE "OrderConfirmation"
ADD COLUMN "userId" TEXT;

-- Backfill legacy rows to admin account provided by operator
UPDATE "OrderConfirmation"
SET "userId" = 'user_3CD25wjuRweHMhFDGBPbgQ25mG9'
WHERE "userId" IS NULL;

-- Enforce ownership for all future rows
ALTER TABLE "OrderConfirmation"
ALTER COLUMN "userId" SET NOT NULL;

-- Enforce uniqueness only within each user scope
CREATE UNIQUE INDEX "OrderConfirmation_userId_orderId_key"
ON "OrderConfirmation"("userId", "orderId");

-- Speed up dashboard listing for one user
CREATE INDEX "OrderConfirmation_userId_createdAt_idx"
ON "OrderConfirmation"("userId", "createdAt");
