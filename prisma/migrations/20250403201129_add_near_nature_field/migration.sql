-- AlterTable
ALTER TABLE "Camping" ADD COLUMN     "nearNature" TEXT[];

-- CreateIndex
CREATE INDEX "Camping_nearNature_idx" ON "Camping"("nearNature");
