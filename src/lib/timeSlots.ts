/**
 * Generate time slots based on working hours and settings
 */

export interface ScheduleSettings {
  workHours: {
    start: string // HH:MM format
    end: string   // HH:MM format
  }
  lunchBreak?: {
    start: string // HH:MM format
    end: string   // HH:MM format
  }
  defaultDuration: number // minutes
  slotInterval?: number   // minutes between slots (defaults to 30)
  enableLunchBreak?: boolean // whether lunch break is enabled
}

export function generateTimeSlots(settings: ScheduleSettings): string[] {
  const slots: string[] = []

  // Validate settings and provide defaults
  if (!settings || !settings.workHours) {
    console.warn('Invalid schedule settings, using defaults')
    settings = {
      workHours: { start: '08:00', end: '18:00' },
      lunchBreak: { start: '12:00', end: '13:00' },
      defaultDuration: 30,
      slotInterval: 15,
      enableLunchBreak: true
    }
  }

  const slotInterval = settings.slotInterval || 15 // Default 15 minute intervals

  // Parse start and end times
  const [startHour, startMinute] = settings.workHours.start.split(':').map(Number)
  const [endHour, endMinute] = settings.workHours.end.split(':').map(Number)
  
  // Parse lunch break if provided and enabled
  let lunchStart: number | null = null
  let lunchEnd: number | null = null

  if (settings.lunchBreak && settings.enableLunchBreak !== false) {
    const [lunchStartHour, lunchStartMinute] = settings.lunchBreak.start.split(':').map(Number)
    const [lunchEndHour, lunchEndMinute] = settings.lunchBreak.end.split(':').map(Number)
    lunchStart = lunchStartHour * 60 + lunchStartMinute
    lunchEnd = lunchEndHour * 60 + lunchEndMinute
  }
  
  // Convert to minutes for easier calculation
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  // Generate slots
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotInterval) {
    // Skip lunch break slots
    if (lunchStart && lunchEnd && minutes >= lunchStart && minutes < lunchEnd) {
      continue
    }
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    slots.push(timeSlot)
  }
  
  return slots
}

export function isWithinWorkingHours(time: string, settings: ScheduleSettings): boolean {
  const [hours, minutes] = time.split(':').map(Number)
  const timeMinutes = hours * 60 + minutes
  
  const [startHour, startMinute] = settings.workHours.start.split(':').map(Number)
  const [endHour, endMinute] = settings.workHours.end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes
}

export function isInLunchBreak(time: string, settings: ScheduleSettings): boolean {
  if (!settings.lunchBreak || settings.enableLunchBreak === false) return false
  
  const [hours, minutes] = time.split(':').map(Number)
  const timeMinutes = hours * 60 + minutes
  
  const [lunchStartHour, lunchStartMinute] = settings.lunchBreak.start.split(':').map(Number)
  const [lunchEndHour, lunchEndMinute] = settings.lunchBreak.end.split(':').map(Number)
  
  const lunchStart = lunchStartHour * 60 + lunchStartMinute
  const lunchEnd = lunchEndHour * 60 + lunchEndMinute
  
  return timeMinutes >= lunchStart && timeMinutes < lunchEnd
}

// Common appointment types for dental offices
export const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consulta', duration: 30, color: 'blue' },
  { value: 'quick_checkup', label: 'Avaliação Rápida', duration: 15, color: 'gray' },
  { value: 'follow_up', label: 'Retorno', duration: 20, color: 'cyan' },
  { value: 'cleaning', label: 'Limpeza', duration: 60, color: 'green' },
  { value: 'filling', label: 'Restauração', duration: 90, color: 'yellow' },
  { value: 'extraction', label: 'Extração', duration: 60, color: 'red' },
  { value: 'root_canal', label: 'Canal', duration: 120, color: 'purple' },
  { value: 'orthodontics', label: 'Ortodontia', duration: 45, color: 'indigo' },
  { value: 'implant', label: 'Implante', duration: 120, color: 'pink' },
  { value: 'checkup', label: 'Revisão', duration: 30, color: 'gray' },
  { value: 'emergency', label: 'Emergência', duration: 60, color: 'red' },
  { value: 'whitening', label: 'Clareamento', duration: 90, color: 'cyan' },
  { value: 'brief_consult', label: 'Consulta Breve', duration: 10, color: 'slate' },
]

export function getAppointmentTypeByValue(value: string) {
  return APPOINTMENT_TYPES.find(type => type.value === value) || APPOINTMENT_TYPES[0]
}

export function canScheduleAppointment(
  startTime: string, 
  duration: number, 
  settings: ScheduleSettings
): boolean {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + duration
  
  // Convert end time back to HH:MM format for validation
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  
  // Get work hours limits
  const [workEndHour, workEndMinute] = settings.workHours.end.split(':').map(Number)
  const workEndMinutesTotal = workEndHour * 60 + workEndMinute
  
  // Check if appointment start is within working hours
  if (!isWithinWorkingHours(startTime, settings)) {
    return false
  }
  
  // Check if appointment end exceeds working hours
  if (endMinutes > workEndMinutesTotal) {
    return false
  }
  
  // Check if appointment overlaps with lunch break
  if (settings.lunchBreak && settings.enableLunchBreak !== false) {
    const [lunchStartHour, lunchStartMinute] = settings.lunchBreak.start.split(':').map(Number)
    const [lunchEndHour, lunchEndMinute] = settings.lunchBreak.end.split(':').map(Number)
    
    const lunchStart = lunchStartHour * 60 + lunchStartMinute
    const lunchEnd = lunchEndHour * 60 + lunchEndMinute
    
    // Check if appointment overlaps with lunch break
    if (startMinutes < lunchEnd && endMinutes > lunchStart) {
      return false
    }
  }
  
  return true
}