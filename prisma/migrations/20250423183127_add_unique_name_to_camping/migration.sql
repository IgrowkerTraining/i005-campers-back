/*
  Warnings:

  - Added the required column `description` to the `Camping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camping" ADD COLUMN     "description" TEXT NOT NULL;
