-- CreateEnum
CREATE TYPE "VaccineCategory" AS ENUM ('VACCINE', 'ANTIPARASITIC', 'DEWORMER');

-- AlterTable
ALTER TABLE "Vaccine" ADD COLUMN     "category" "VaccineCategory" NOT NULL DEFAULT 'VACCINE';
