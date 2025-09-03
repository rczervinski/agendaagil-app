/*
  Warnings:

  - You are about to drop the column `patientId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `patient_visits` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `medications` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `patients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorPatientId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorPatientId` to the `patient_visits` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ConsentStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."PrivacyLevel" AS ENUM ('MINIMAL', 'BASIC', 'FULL');

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_visits" DROP CONSTRAINT "patient_visits_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patients" DROP CONSTRAINT "patients_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."patients" DROP CONSTRAINT "patients_tenantId_fkey";

-- DropIndex
DROP INDEX "public"."patients_phone_tenantId_key";

-- AlterTable
ALTER TABLE "public"."appointments" DROP COLUMN "patientId",
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "consentRequestId" TEXT,
ADD COLUMN     "consentStatus" "public"."ConsentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "doctorPatientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."patient_visits" DROP COLUMN "patientId",
ADD COLUMN     "doctorPatientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."patients" DROP COLUMN "address",
DROP COLUMN "allergies",
DROP COLUMN "createdById",
DROP COLUMN "email",
DROP COLUMN "emergencyContact",
DROP COLUMN "medications",
DROP COLUMN "notes",
DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "public"."tenant_settings" ADD COLUMN     "enableLunchBreak" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slotInterval" INTEGER NOT NULL DEFAULT 15;

-- CreateTable
CREATE TABLE "public"."doctor_patients" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "emergencyContact" TEXT,
    "medicalHistory" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "dataSharedAt" TIMESTAMP(3),
    "privacyLevel" "public"."PrivacyLevel" NOT NULL DEFAULT 'MINIMAL',
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_clinics" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."procedures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_consent_requests" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "requestReason" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3),
    "appointmentType" TEXT,
    "patientId" TEXT NOT NULL,
    "requestingDoctorId" TEXT NOT NULL,
    "clinicId" TEXT,
    "tenantId" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_consent_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "tenantId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_patients_doctorId_patientId_key" ON "public"."doctor_patients"("doctorId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_clinics_doctorId_clinicId_key" ON "public"."doctor_clinics"("doctorId", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_consent_requests_token_key" ON "public"."patient_consent_requests"("token");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phone_key" ON "public"."patients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_key" ON "public"."patients"("cpf");

-- AddForeignKey
ALTER TABLE "public"."doctor_patients" ADD CONSTRAINT "doctor_patients_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doctor_patients" ADD CONSTRAINT "doctor_patients_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doctor_patients" ADD CONSTRAINT "doctor_patients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_consentRequestId_fkey" FOREIGN KEY ("consentRequestId") REFERENCES "public"."patient_consent_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_doctorPatientId_fkey" FOREIGN KEY ("doctorPatientId") REFERENCES "public"."doctor_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_visits" ADD CONSTRAINT "patient_visits_doctorPatientId_fkey" FOREIGN KEY ("doctorPatientId") REFERENCES "public"."doctor_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doctor_clinics" ADD CONSTRAINT "doctor_clinics_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doctor_clinics" ADD CONSTRAINT "doctor_clinics_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."procedures" ADD CONSTRAINT "procedures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_consent_requests" ADD CONSTRAINT "patient_consent_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_consent_requests" ADD CONSTRAINT "patient_consent_requests_requestingDoctorId_fkey" FOREIGN KEY ("requestingDoctorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_consent_requests" ADD CONSTRAINT "patient_consent_requests_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_consent_requests" ADD CONSTRAINT "patient_consent_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_audit_logs" ADD CONSTRAINT "consent_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
