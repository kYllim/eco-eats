-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNAVAILABLE',
    "tier" TEXT NOT NULL DEFAULT 'STANDARD',
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activeDeliveryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentRestaurantId" TEXT,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "dropoffLatitude" DOUBLE PRECISION NOT NULL,
    "dropoffLongitude" DOUBLE PRECISION NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "tipEur" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "courierId" TEXT,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiverId" TEXT,
    "roomId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Delivery_courierId_idx" ON "Delivery"("courierId");

-- CreateIndex
CREATE INDEX "Message_type_roomId_sentAt_idx" ON "Message"("type", "roomId", "sentAt");

-- CreateIndex
CREATE INDEX "Message_type_senderId_receiverId_sentAt_idx" ON "Message"("type", "senderId", "receiverId", "sentAt");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
