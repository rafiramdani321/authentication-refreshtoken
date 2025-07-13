-- CreateEnum
CREATE TYPE "statusToken" AS ENUM ('EXPIRED', 'ACTIVE', 'USED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tokenVerification" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "statusToken" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokenVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokenVerification_token_key" ON "tokenVerification"("token");

-- CreateIndex
CREATE INDEX "tokenVerification_token_idx" ON "tokenVerification"("token");

-- AddForeignKey
ALTER TABLE "tokenVerification" ADD CONSTRAINT "tokenVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
