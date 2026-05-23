/*
  Warnings:

  - You are about to drop the column `captcha_token` on the `publication_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "publication_requests" DROP COLUMN "captcha_token",
ADD COLUMN     "captcha_validated" BOOLEAN NOT NULL DEFAULT false;
