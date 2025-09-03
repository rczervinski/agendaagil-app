/*
  Warnings:

  - You are about to drop the column `consentRequestId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `consentStatus` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `consentDate` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `consentGiven` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `dataSharedAt` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `medications` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the column `privacyLevel` on the `doctor_patients` table. All the data in the column will be lost.
  - You are about to drop the `consent_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patient_consent_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_consentRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."consent_audit_logs" DROP CONSTRAINT "consent_audit_logs_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_consent_requests" DROP CONSTRAINT "patient_consent_requests_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_consent_requests" DROP CONSTRAINT "patient_consent_requests_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_consent_requests" DROP CONSTRAINT "patient_consent_requests_requestingDoctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_consent_requests" DROP CONSTRAINT "patient_consent_requests_tenantId_fkey";

-- AlterTable
ALTER TABLE "public"."appointments" DROP COLUMN "consentRequestId",
DROP COLUMN "consentStatus";

-- AlterTable
ALTER TABLE "public"."doctor_patients" DROP COLUMN "address",
DROP COLUMN "allergies",
DROP COLUMN "consentDate",
DROP COLUMN "consentGiven",
DROP COLUMN "dataSharedAt",
DROP COLUMN "email",
DROP COLUMN "emergencyContact",
DROP COLUMN "medicalHistory",
DROP COLUMN "medications",
DROP COLUMN "privacyLevel";

-- DropTable
DROP TABLE "public"."consent_audit_logs";

-- DropTable
DROP TABLE "public"."patient_consent_requests";

-- DropEnum
DROP TYPE "public"."ConsentStatus";

-- DropEnum
DROP TYPE "public"."PrivacyLevel";

-- CreateTable
CREATE TABLE "public"."patient_clinical_records" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "rg" TEXT,
    "cpf" TEXT,
    "issuingOrgan" TEXT,
    "birthDate" TIMESTAMP(3),
    "nationality" TEXT,
    "maritalStatus" TEXT,
    "profession" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressNumber" TEXT,
    "neighborhood" TEXT,
    "zipCode" TEXT,
    "guardianName" TEXT,
    "guardianRg" TEXT,
    "guardianCpf" TEXT,
    "guardianIssuingOrgan" TEXT,
    "guardianMaritalStatus" TEXT,
    "guardianSpouse" TEXT,
    "doctorPatientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_clinical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_anamnesis" (
    "id" TEXT NOT NULL,
    "mainComplaint" TEXT,
    "hasDisease" BOOLEAN,
    "diseaseDescription" TEXT,
    "lastDentalTreatment" TEXT,
    "lastDentalProcedure" TEXT,
    "hadDentalProblems" BOOLEAN,
    "dentalProblemsDescription" TEXT,
    "currentMedicalTreatment" BOOLEAN,
    "medicalTreatmentDescription" TEXT,
    "doctorName" TEXT,
    "doctorPhone" TEXT,
    "isPregnant" BOOLEAN,
    "pregnancyTime" TEXT,
    "takingMedication" BOOLEAN,
    "medicationDescription" TEXT,
    "medicationAllergy" BOOLEAN,
    "medicationAllergyDescription" TEXT,
    "hasAnyAllergy" BOOLEAN,
    "allergyDescription" TEXT,
    "hadSurgery" BOOLEAN,
    "surgeryDescription" TEXT,
    "healingProblems" BOOLEAN,
    "anesthesiaProblems" BOOLEAN,
    "hemorrhageProblems" BOOLEAN,
    "rheumaticFever" BOOLEAN NOT NULL DEFAULT false,
    "heartProblems" BOOLEAN NOT NULL DEFAULT false,
    "respiratoryProblems" BOOLEAN NOT NULL DEFAULT false,
    "allergicProblems" BOOLEAN NOT NULL DEFAULT false,
    "kidneyProblems" BOOLEAN NOT NULL DEFAULT false,
    "jointProblems" BOOLEAN NOT NULL DEFAULT false,
    "diabetesType1" BOOLEAN NOT NULL DEFAULT false,
    "diabetesType2" BOOLEAN NOT NULL DEFAULT false,
    "hypertension" BOOLEAN NOT NULL DEFAULT false,
    "otherDiseases" TEXT,
    "bitesNails" BOOLEAN NOT NULL DEFAULT false,
    "mouthBreathing" BOOLEAN NOT NULL DEFAULT false,
    "teethGrinding" BOOLEAN NOT NULL DEFAULT false,
    "otherHabits" TEXT,
    "isSmoker" BOOLEAN,
    "smokingDuration" TEXT,
    "importantObservations" TEXT,
    "doctorPatientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_anamnesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_form_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "doctorPatientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_form_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_clinical_records_doctorPatientId_key" ON "public"."patient_clinical_records"("doctorPatientId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_anamnesis_doctorPatientId_key" ON "public"."patient_anamnesis"("doctorPatientId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_form_tokens_token_key" ON "public"."patient_form_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "patient_form_tokens_doctorPatientId_key" ON "public"."patient_form_tokens"("doctorPatientId");

-- AddForeignKey
ALTER TABLE "public"."patient_clinical_records" ADD CONSTRAINT "patient_clinical_records_doctorPatientId_fkey" FOREIGN KEY ("doctorPatientId") REFERENCES "public"."doctor_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_anamnesis" ADD CONSTRAINT "patient_anamnesis_doctorPatientId_fkey" FOREIGN KEY ("doctorPatientId") REFERENCES "public"."doctor_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_form_tokens" ADD CONSTRAINT "patient_form_tokens_doctorPatientId_fkey" FOREIGN KEY ("doctorPatientId") REFERENCES "public"."doctor_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
