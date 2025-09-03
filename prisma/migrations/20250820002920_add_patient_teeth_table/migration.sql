-- CreateTable
CREATE TABLE "public"."patient_teeth" (
    "id" TEXT NOT NULL,
    "doctorPatientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "procedureId" TEXT,
    "toothNumberSite" INTEGER NOT NULL,
    "toothNumberFDI" TEXT NOT NULL,
    "treatmentType" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_teeth_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."patient_teeth" ADD CONSTRAINT "patient_teeth_doctorPatientId_fkey" FOREIGN KEY ("doctorPatientId") REFERENCES "public"."doctor_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_teeth" ADD CONSTRAINT "patient_teeth_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_teeth" ADD CONSTRAINT "patient_teeth_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "public"."procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
