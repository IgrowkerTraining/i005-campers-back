-- CreateTable
CREATE TABLE "Favourites" (
    "id" SERIAL NOT NULL,
    "campingId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Favourites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favourites_campingId_idx" ON "Favourites"("campingId");

-- CreateIndex
CREATE INDEX "Favourites_userId_idx" ON "Favourites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favourites_userId_campingId_key" ON "Favourites"("userId", "campingId");

-- AddForeignKey
ALTER TABLE "Favourites" ADD CONSTRAINT "Favourites_campingId_fkey" FOREIGN KEY ("campingId") REFERENCES "Camping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourites" ADD CONSTRAINT "Favourites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
