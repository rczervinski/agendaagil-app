import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params

    // Verify doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Get anamnesis
    const anamnesis = await prisma.patientAnamnesis.findUnique({
      where: { doctorPatientId }
    })

    return NextResponse.json({
      doctorPatient: {
        id: doctorPatient.id,
        patient: doctorPatient.patient,
        doctor: doctorPatient.doctor
      },
      anamnesis
    })
  } catch (error) {
    console.error('Error fetching anamnesis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch anamnesis' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params
    const data = await request.json()

    // Verify doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Check if anamnesis already exists
    const existingAnamnesis = await prisma.patientAnamnesis.findUnique({
      where: { doctorPatientId }
    })

    if (existingAnamnesis) {
      return NextResponse.json(
        { error: 'Anamnesis already exists for this patient' },
        { status: 409 }
      )
    }

    // Create anamnesis
    const anamnesis = await prisma.patientAnamnesis.create({
      data: {
        doctorPatientId,
        mainComplaint: data.mainComplaint,
        hasDisease: data.hasDisease,
        diseaseDescription: data.diseaseDescription,
        lastDentalTreatment: data.lastDentalTreatment,
        lastDentalProcedure: data.lastDentalProcedure,
        hadDentalProblems: data.hadDentalProblems,
        dentalProblemsDescription: data.dentalProblemsDescription,
        currentMedicalTreatment: data.currentMedicalTreatment,
        medicalTreatmentDescription: data.medicalTreatmentDescription,
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        isPregnant: data.isPregnant,
        pregnancyTime: data.pregnancyTime,
        takingMedication: data.takingMedication,
        medicationDescription: data.medicationDescription,
        medicationAllergy: data.medicationAllergy,
        medicationAllergyDescription: data.medicationAllergyDescription,
        hasAnyAllergy: data.hasAnyAllergy,
        allergyDescription: data.allergyDescription,
        hadSurgery: data.hadSurgery,
        surgeryDescription: data.surgeryDescription,
        healingProblems: data.healingProblems,
        anesthesiaProblems: data.anesthesiaProblems,
        hemorrhageProblems: data.hemorrhageProblems,
        rheumaticFever: data.rheumaticFever || false,
        heartProblems: data.heartProblems || false,
        respiratoryProblems: data.respiratoryProblems || false,
        allergicProblems: data.allergicProblems || false,
        kidneyProblems: data.kidneyProblems || false,
        jointProblems: data.jointProblems || false,
        diabetesType1: data.diabetesType1 || false,
        diabetesType2: data.diabetesType2 || false,
        hypertension: data.hypertension || false,
        otherDiseases: data.otherDiseases,
        bitesNails: data.bitesNails || false,
        mouthBreathing: data.mouthBreathing || false,
        teethGrinding: data.teethGrinding || false,
        otherHabits: data.otherHabits,
        isSmoker: data.isSmoker,
        smokingDuration: data.smokingDuration,
        importantObservations: data.importantObservations,
      }
    })

    return NextResponse.json(anamnesis, { status: 201 })
  } catch (error) {
    console.error('Error creating anamnesis:', error)
    return NextResponse.json(
      { error: 'Failed to create anamnesis' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params
    const data = await request.json()

    // Verify doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Update or create anamnesis
    const anamnesis = await prisma.patientAnamnesis.upsert({
      where: { doctorPatientId },
      update: {
        mainComplaint: data.mainComplaint,
        hasDisease: data.hasDisease,
        diseaseDescription: data.diseaseDescription,
        lastDentalTreatment: data.lastDentalTreatment,
        lastDentalProcedure: data.lastDentalProcedure,
        hadDentalProblems: data.hadDentalProblems,
        dentalProblemsDescription: data.dentalProblemsDescription,
        currentMedicalTreatment: data.currentMedicalTreatment,
        medicalTreatmentDescription: data.medicalTreatmentDescription,
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        isPregnant: data.isPregnant,
        pregnancyTime: data.pregnancyTime,
        takingMedication: data.takingMedication,
        medicationDescription: data.medicationDescription,
        medicationAllergy: data.medicationAllergy,
        medicationAllergyDescription: data.medicationAllergyDescription,
        hasAnyAllergy: data.hasAnyAllergy,
        allergyDescription: data.allergyDescription,
        hadSurgery: data.hadSurgery,
        surgeryDescription: data.surgeryDescription,
        healingProblems: data.healingProblems,
        anesthesiaProblems: data.anesthesiaProblems,
        hemorrhageProblems: data.hemorrhageProblems,
        rheumaticFever: data.rheumaticFever || false,
        heartProblems: data.heartProblems || false,
        respiratoryProblems: data.respiratoryProblems || false,
        allergicProblems: data.allergicProblems || false,
        kidneyProblems: data.kidneyProblems || false,
        jointProblems: data.jointProblems || false,
        diabetesType1: data.diabetesType1 || false,
        diabetesType2: data.diabetesType2 || false,
        hypertension: data.hypertension || false,
        otherDiseases: data.otherDiseases,
        bitesNails: data.bitesNails || false,
        mouthBreathing: data.mouthBreathing || false,
        teethGrinding: data.teethGrinding || false,
        otherHabits: data.otherHabits,
        isSmoker: data.isSmoker,
        smokingDuration: data.smokingDuration,
        importantObservations: data.importantObservations,
      },
      create: {
        doctorPatientId,
        mainComplaint: data.mainComplaint,
        hasDisease: data.hasDisease,
        diseaseDescription: data.diseaseDescription,
        lastDentalTreatment: data.lastDentalTreatment,
        lastDentalProcedure: data.lastDentalProcedure,
        hadDentalProblems: data.hadDentalProblems,
        dentalProblemsDescription: data.dentalProblemsDescription,
        currentMedicalTreatment: data.currentMedicalTreatment,
        medicalTreatmentDescription: data.medicalTreatmentDescription,
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        isPregnant: data.isPregnant,
        pregnancyTime: data.pregnancyTime,
        takingMedication: data.takingMedication,
        medicationDescription: data.medicationDescription,
        medicationAllergy: data.medicationAllergy,
        medicationAllergyDescription: data.medicationAllergyDescription,
        hasAnyAllergy: data.hasAnyAllergy,
        allergyDescription: data.allergyDescription,
        hadSurgery: data.hadSurgery,
        surgeryDescription: data.surgeryDescription,
        healingProblems: data.healingProblems,
        anesthesiaProblems: data.anesthesiaProblems,
        hemorrhageProblems: data.hemorrhageProblems,
        rheumaticFever: data.rheumaticFever || false,
        heartProblems: data.heartProblems || false,
        respiratoryProblems: data.respiratoryProblems || false,
        allergicProblems: data.allergicProblems || false,
        kidneyProblems: data.kidneyProblems || false,
        jointProblems: data.jointProblems || false,
        diabetesType1: data.diabetesType1 || false,
        diabetesType2: data.diabetesType2 || false,
        hypertension: data.hypertension || false,
        otherDiseases: data.otherDiseases,
        bitesNails: data.bitesNails || false,
        mouthBreathing: data.mouthBreathing || false,
        teethGrinding: data.teethGrinding || false,
        otherHabits: data.otherHabits,
        isSmoker: data.isSmoker,
        smokingDuration: data.smokingDuration,
        importantObservations: data.importantObservations,
      }
    })

    return NextResponse.json(anamnesis)
  } catch (error) {
    console.error('Error updating anamnesis:', error)
    return NextResponse.json(
      { error: 'Failed to update anamnesis' },
      { status: 500 }
    )
  }
}
