-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('LOGIN', 'RESET_PWD');

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(255) NOT NULL,
    "type" "SessionType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "device_id" VARCHAR(255),
    "device_name" VARCHAR(255),
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_at" TIMESTAMP(3) NOT NULL,
    "user__id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user__id_fkey" FOREIGN KEY ("user__id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
