/*
  Warnings:

  - A unique constraint covering the columns `[limitCampingId]` on the table `Camping` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `limitCampingId` to the `Camping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camping" ADD COLUMN     "limitCampingId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "campingId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "tentsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitCamping" (
    "id" SERIAL NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxTents" INTEGER NOT NULL,

    CONSTRAINT "LimitCamping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Camping_limitCampingId_key" ON "Camping"("limitCampingId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_campingId_fkey" FOREIGN KEY ("campingId") REFERENCES "Camping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camping" ADD CONSTRAINT "Camping_limitCampingId_fkey" FOREIGN KEY ("limitCampingId") REFERENCES "LimitCamping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
