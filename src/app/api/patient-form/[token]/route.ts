import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    console.log('GET patient-form - token:', token)

    // Find the token
    const patientFormToken = await prisma.patientFormToken.findUnique({
      where: { token },
      include: {
        doctorPatient: {
          include: {
            patient: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            },
            clinicalRecord: true,
            anamnesis: true,
          }
        }
      }
    })

    console.log('patientFormToken found:', !!patientFormToken)

    if (!patientFormToken) {
      console.log('Token not found in database:', token)
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    // Check if token is expired
    const now = new Date()
    if (patientFormToken.expiresAt < now) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 410 }
      )
    }

    // Check if token was already used
    if (patientFormToken.used) {
      return NextResponse.json(
        { error: 'Token already used' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      token: patientFormToken.token,
      expiresAt: patientFormToken.expiresAt,
      patient: {
        name: patientFormToken.doctorPatient.patient.name,
        phone: patientFormToken.doctorPatient.patient.phone,
        email: patientFormToken.doctorPatient.patient.email,
        cpf: patientFormToken.doctorPatient.patient.cpf,
        birthDate: patientFormToken.doctorPatient.patient.birthDate,
        address: patientFormToken.doctorPatient.patient.address,
        gender: patientFormToken.doctorPatient.patient.gender,
      },
      doctor: {
        name: `${patientFormToken.doctorPatient.doctor.firstName} ${patientFormToken.doctorPatient.doctor.lastName}`,
      },
      existingData: {
        clinicalRecord: patientFormToken.doctorPatient.clinicalRecord,
        anamnesis: patientFormToken.doctorPatient.anamnesis,
      }
    })
  } catch (error) {
    console.error('Error validating patient form token:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    const data = await request.json()

    // Find the token
    const patientFormToken = await prisma.patientFormToken.findUnique({
      where: { token },
      include: {
        doctorPatient: {
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
        }
      }
    })

    if (!patientFormToken) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    // Check if token is expired
    const now = new Date()
    if (patientFormToken.expiresAt < now) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 410 }
      )
    }

    // Check if token was already used
    if (patientFormToken.used) {
      return NextResponse.json(
        { error: 'Token already used' },
        { status: 410 }
      )
    }

    const doctorPatientId = patientFormToken.doctorPatientId

    // Save clinical record if provided
    if (data.clinicalRecord) {
      await prisma.patientClinicalRecord.upsert({
        where: { doctorPatientId },
        update: {
          name: data.clinicalRecord.name,
          rg: data.clinicalRecord.rg,
          cpf: data.clinicalRecord.cpf,
          issuingOrgan: data.clinicalRecord.issuingOrgan,
          birthDate: data.clinicalRecord.birthDate ? new Date(data.clinicalRecord.birthDate) : null,
          nationality: data.clinicalRecord.nationality,
          maritalStatus: data.clinicalRecord.maritalStatus,
          profession: data.clinicalRecord.profession,
          phone: data.clinicalRecord.phone,
          email: data.clinicalRecord.email,
          address: data.clinicalRecord.address,
          addressNumber: data.clinicalRecord.addressNumber,
          neighborhood: data.clinicalRecord.neighborhood,
          zipCode: data.clinicalRecord.zipCode,
          guardianName: data.clinicalRecord.guardianName,
          guardianRg: data.clinicalRecord.guardianRg,
          guardianCpf: data.clinicalRecord.guardianCpf,
          guardianIssuingOrgan: data.clinicalRecord.guardianIssuingOrgan,
          guardianMaritalStatus: data.clinicalRecord.guardianMaritalStatus,
          guardianSpouse: data.clinicalRecord.guardianSpouse,
        },
        create: {
          doctorPatientId,
          name: data.clinicalRecord.name,
          rg: data.clinicalRecord.rg,
          cpf: data.clinicalRecord.cpf,
          issuingOrgan: data.clinicalRecord.issuingOrgan,
          birthDate: data.clinicalRecord.birthDate ? new Date(data.clinicalRecord.birthDate) : null,
          nationality: data.clinicalRecord.nationality,
          maritalStatus: data.clinicalRecord.maritalStatus,
          profession: data.clinicalRecord.profession,
          phone: data.clinicalRecord.phone,
          email: data.clinicalRecord.email,
          address: data.clinicalRecord.address,
          addressNumber: data.clinicalRecord.addressNumber,
          neighborhood: data.clinicalRecord.neighborhood,
          zipCode: data.clinicalRecord.zipCode,
          guardianName: data.clinicalRecord.guardianName,
          guardianRg: data.clinicalRecord.guardianRg,
          guardianCpf: data.clinicalRecord.guardianCpf,
          guardianIssuingOrgan: data.clinicalRecord.guardianIssuingOrgan,
          guardianMaritalStatus: data.clinicalRecord.guardianMaritalStatus,
          guardianSpouse: data.clinicalRecord.guardianSpouse,
        }
      })
    }

    // Save anamnesis if provided
    if (data.anamnesis) {
      await prisma.patientAnamnesis.upsert({
        where: { doctorPatientId },
        update: {
          mainComplaint: data.anamnesis.mainComplaint,
          hasDisease: data.anamnesis.hasDisease,
          diseaseDescription: data.anamnesis.diseaseDescription,
          lastDentalTreatment: data.anamnesis.lastDentalTreatment,
          lastDentalProcedure: data.anamnesis.lastDentalProcedure,
          hadDentalProblems: data.anamnesis.hadDentalProblems,
          dentalProblemsDescription: data.anamnesis.dentalProblemsDescription,
          currentMedicalTreatment: data.anamnesis.currentMedicalTreatment,
          medicalTreatmentDescription: data.anamnesis.medicalTreatmentDescription,
          doctorName: data.anamnesis.doctorName,
          doctorPhone: data.anamnesis.doctorPhone,
          isPregnant: data.anamnesis.isPregnant,
          pregnancyTime: data.anamnesis.pregnancyTime,
          takingMedication: data.anamnesis.takingMedication,
          medicationDescription: data.anamnesis.medicationDescription,
          medicationAllergy: data.anamnesis.medicationAllergy,
          medicationAllergyDescription: data.anamnesis.medicationAllergyDescription,
          hasAnyAllergy: data.anamnesis.hasAnyAllergy,
          allergyDescription: data.anamnesis.allergyDescription,
          hadSurgery: data.anamnesis.hadSurgery,
          surgeryDescription: data.anamnesis.surgeryDescription,
          healingProblems: data.anamnesis.healingProblems,
          anesthesiaProblems: data.anamnesis.anesthesiaProblems,
          hemorrhageProblems: data.anamnesis.hemorrhageProblems,
          rheumaticFever: data.anamnesis.rheumaticFever || false,
          heartProblems: data.anamnesis.heartProblems || false,
          respiratoryProblems: data.anamnesis.respiratoryProblems || false,
          allergicProblems: data.anamnesis.allergicProblems || false,
          kidneyProblems: data.anamnesis.kidneyProblems || false,
          jointProblems: data.anamnesis.jointProblems || false,
          diabetesType1: data.anamnesis.diabetesType1 || false,
          diabetesType2: data.anamnesis.diabetesType2 || false,
          hypertension: data.anamnesis.hypertension || false,
          otherDiseases: data.anamnesis.otherDiseases,
          bitesNails: data.anamnesis.bitesNails || false,
          mouthBreathing: data.anamnesis.mouthBreathing || false,
          teethGrinding: data.anamnesis.teethGrinding || false,
          otherHabits: data.anamnesis.otherHabits,
          isSmoker: data.anamnesis.isSmoker,
          smokingDuration: data.anamnesis.smokingDuration,
          importantObservations: data.anamnesis.importantObservations,
        },
        create: {
          doctorPatientId,
          mainComplaint: data.anamnesis.mainComplaint,
          hasDisease: data.anamnesis.hasDisease,
          diseaseDescription: data.anamnesis.diseaseDescription,
          lastDentalTreatment: data.anamnesis.lastDentalTreatment,
          lastDentalProcedure: data.anamnesis.lastDentalProcedure,
          hadDentalProblems: data.anamnesis.hadDentalProblems,
          dentalProblemsDescription: data.anamnesis.dentalProblemsDescription,
          currentMedicalTreatment: data.anamnesis.currentMedicalTreatment,
          medicalTreatmentDescription: data.anamnesis.medicalTreatmentDescription,
          doctorName: data.anamnesis.doctorName,
          doctorPhone: data.anamnesis.doctorPhone,
          isPregnant: data.anamnesis.isPregnant,
          pregnancyTime: data.anamnesis.pregnancyTime,
          takingMedication: data.anamnesis.takingMedication,
          medicationDescription: data.anamnesis.medicationDescription,
          medicationAllergy: data.anamnesis.medicationAllergy,
          medicationAllergyDescription: data.anamnesis.medicationAllergyDescription,
          hasAnyAllergy: data.anamnesis.hasAnyAllergy,
          allergyDescription: data.anamnesis.allergyDescription,
          hadSurgery: data.anamnesis.hadSurgery,
          surgeryDescription: data.anamnesis.surgeryDescription,
          healingProblems: data.anamnesis.healingProblems,
          anesthesiaProblems: data.anamnesis.anesthesiaProblems,
          hemorrhageProblems: data.anamnesis.hemorrhageProblems,
          rheumaticFever: data.anamnesis.rheumaticFever || false,
          heartProblems: data.anamnesis.heartProblems || false,
          respiratoryProblems: data.anamnesis.respiratoryProblems || false,
          allergicProblems: data.anamnesis.allergicProblems || false,
          kidneyProblems: data.anamnesis.kidneyProblems || false,
          jointProblems: data.anamnesis.jointProblems || false,
          diabetesType1: data.anamnesis.diabetesType1 || false,
          diabetesType2: data.anamnesis.diabetesType2 || false,
          hypertension: data.anamnesis.hypertension || false,
          otherDiseases: data.anamnesis.otherDiseases,
          bitesNails: data.anamnesis.bitesNails || false,
          mouthBreathing: data.anamnesis.mouthBreathing || false,
          teethGrinding: data.anamnesis.teethGrinding || false,
          otherHabits: data.anamnesis.otherHabits,
          isSmoker: data.anamnesis.isSmoker,
          smokingDuration: data.anamnesis.smokingDuration,
          importantObservations: data.anamnesis.importantObservations,
        }
      })
    }

    // Mark token as used
    await prisma.patientFormToken.update({
      where: { token },
      data: { used: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Ficha preenchida com sucesso!'
    })
  } catch (error) {
    console.error('Error saving patient form:', error)
    return NextResponse.json(
      { error: 'Failed to save patient form' },
      { status: 500 }
    )
  }
}
