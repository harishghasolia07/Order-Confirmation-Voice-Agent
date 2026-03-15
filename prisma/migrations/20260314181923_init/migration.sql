-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CALLING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "OrderConfirmation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliverySlot" TEXT,
    "callSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderConfirmation_orderId_key" ON "OrderConfirmation"("orderId");
