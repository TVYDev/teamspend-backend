/*
  Warnings:

  - A unique constraint covering the columns `[username,status]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_username_status_key" ON "User"("username", "status");
