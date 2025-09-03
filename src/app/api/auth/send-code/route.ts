import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { phone, userType } = await request.json()
    
    if (!phone || !userType) {
      return NextResponse.json(
        { error: 'Phone and userType are required' },
        { status: 400 }
      )
    }

    // Clean phone number (remove formatting)
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    
    // Invalidate any existing codes for this phone
    await prisma.authCode.updateMany({
      where: {
        phone: cleanPhone,
        used: false,
      },
      data: {
        used: true,
      },
    })

    // Create new auth code
    const authCode = await prisma.authCode.create({
      data: {
        code,
        phone: cleanPhone,
        userType,
        expiresAt,
      },
    })

    // In a real application, you would send the code via SMS or WhatsApp
    // For development, we'll just log it
    console.log(`🔐 Auth code for ${phone}: ${code}`)
    
    // TODO: Integrate with SMS/WhatsApp service
    // await sendSMS(cleanPhone, `Seu código de acesso é: ${code}`)
    // or
    // await sendWhatsApp(cleanPhone, `Seu código de acesso é: ${code}`)

    return NextResponse.json({
      message: 'Code sent successfully',
      // In development, return the code for testing
      ...(process.env.NODE_ENV === 'development' && { code }),
    })
  } catch (error) {
    console.error('Error sending auth code:', error)
    return NextResponse.json(
      { error: 'Failed to send code' },
      { status: 500 }
    )
  }
}

// Helper function to send SMS (to be implemented with your SMS provider)
async function sendSMS(phone: string, message: string) {
  // Example with Twilio:
  // const client = twilio(accountSid, authToken)
  // await client.messages.create({
  //   body: message,
  //   from: '+1234567890',
  //   to: `+55${phone}`
  // })
  
  console.log(`SMS to ${phone}: ${message}`)
}

// Helper function to send WhatsApp (to be implemented with WhatsApp Business API)
async function sendWhatsApp(phone: string, message: string) {
  // Example with WhatsApp Business API:
  // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: `55${phone}`,
  //     type: 'text',
  //     text: { body: message }
  //   })
  // })
  
  console.log(`WhatsApp to ${phone}: ${message}`)
}
