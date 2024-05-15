-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH_TOKEN');

-- CreateTable
CREATE TABLE "tokens" (
    "id" VARCHAR(255) NOT NULL,
    "subject_id" VARCHAR(255) NOT NULL,
    "type" "TokenType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);
