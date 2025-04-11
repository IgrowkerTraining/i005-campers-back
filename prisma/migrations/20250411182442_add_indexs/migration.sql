-- DropIndex
DROP INDEX "Camping_nearNature_idx";

-- CreateIndex
CREATE INDEX "Camping_locationId_idx" ON "Camping"("locationId");

-- CreateIndex
CREATE INDEX "Camping_userId_idx" ON "Camping"("userId");

-- CreateIndex
CREATE INDEX "NearbyAttraction_campingId_idx" ON "NearbyAttraction"("campingId");

-- CreateIndex
CREATE INDEX "Pricing_campingId_idx" ON "Pricing"("campingId");

-- CreateIndex
CREATE INDEX "Reservation_campingId_idx" ON "Reservation"("campingId");

-- CreateIndex
CREATE INDEX "Reservation_startDate_endDate_idx" ON "Reservation"("startDate", "endDate");
