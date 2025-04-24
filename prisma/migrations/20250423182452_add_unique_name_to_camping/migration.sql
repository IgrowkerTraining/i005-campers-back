/*
  Warnings:

  - You are about to drop the column `description` on the `Camping` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Camping` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Camping" DROP COLUMN "description";

-- CreateIndex
CREATE UNIQUE INDEX "Camping_name_key" ON "Camping"("name");
