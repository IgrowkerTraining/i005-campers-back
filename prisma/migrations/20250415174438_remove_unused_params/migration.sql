/*
  Warnings:

  - You are about to drop the column `nearNature` on the `Camping` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `distance` on the `NearbyAttraction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `NearbyAttraction` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `Pricing` table. All the data in the column will be lost.
  - Added the required column `contactPhone` to the `Camping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campingAddress` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mapLink` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tarifa` to the `Pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camping" DROP COLUMN "nearNature",
ADD COLUMN     "contactPhone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "city",
DROP COLUMN "coordinates",
DROP COLUMN "country",
DROP COLUMN "region",
ADD COLUMN     "campingAddress" TEXT NOT NULL,
ADD COLUMN     "mapLink" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NearbyAttraction" DROP COLUMN "distance",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Pricing" DROP COLUMN "season",
ADD COLUMN     "tarifa" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "campingId" INTEGER NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_campingId_idx" ON "Media"("campingId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_campingId_fkey" FOREIGN KEY ("campingId") REFERENCES "Camping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
