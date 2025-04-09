-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "owner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camping" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "nearNature" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Camping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'España',
    "coordinates" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pricing" (
    "id" SERIAL NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "season" TEXT NOT NULL,
    "campingId" INTEGER NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearbyAttraction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "campingId" INTEGER NOT NULL,

    CONSTRAINT "NearbyAttraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmenityToCamping" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AmenityToCamping_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Camping_name_idx" ON "Camping"("name");

-- CreateIndex
CREATE INDEX "Camping_nearNature_idx" ON "Camping"("nearNature");

-- CreateIndex
CREATE INDEX "_AmenityToCamping_B_index" ON "_AmenityToCamping"("B");

-- AddForeignKey
ALTER TABLE "Camping" ADD CONSTRAINT "Camping_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camping" ADD CONSTRAINT "Camping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_campingId_fkey" FOREIGN KEY ("campingId") REFERENCES "Camping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyAttraction" ADD CONSTRAINT "NearbyAttraction_campingId_fkey" FOREIGN KEY ("campingId") REFERENCES "Camping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToCamping" ADD CONSTRAINT "_AmenityToCamping_A_fkey" FOREIGN KEY ("A") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToCamping" ADD CONSTRAINT "_AmenityToCamping_B_fkey" FOREIGN KEY ("B") REFERENCES "Camping"("id") ON DELETE CASCADE ON UPDATE CASCADE;
