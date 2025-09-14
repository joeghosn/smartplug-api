/*
  Warnings:

  - A unique constraint covering the columns `[chipId]` on the table `devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chipId` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."devices" ADD COLUMN     "chipId" VARCHAR(32) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "devices_chipId_key" ON "public"."devices"("chipId");
