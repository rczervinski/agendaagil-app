'use client'

import { useState, useCallback } from 'react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
  message: string
}

interface ValidationRules {
  [key: string]: ValidationRule[]
}

interface ValidationErrors {
  [key: string]: string[]
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const validateField = useCallback((fieldName: string, value: string): string[] => {
    const fieldRules = rules[fieldName] || []
    const fieldErrors: string[] = []

    for (const rule of fieldRules) {
      if (rule.required && (!value || value.trim() === '')) {
        fieldErrors.push(rule.message)
        continue
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(rule.message)
        continue
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(rule.message)
        continue
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message)
        continue
      }

      if (value && rule.custom && !rule.custom(value)) {
        fieldErrors.push(rule.message)
        continue
      }
    }

    return fieldErrors
  }, [rules])

  const validateForm = useCallback((formData: { [key: string]: string }): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(rules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName] || '')
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [rules, validateField])

  const validateSingleField = useCallback((fieldName: string, value: string) => {
    const fieldErrors = validateField(fieldName, value)
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }))
    return fieldErrors.length === 0
  }, [validateField])

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  const hasError = useCallback((fieldName: string): boolean => {
    return touched[fieldName] && errors[fieldName] && errors[fieldName].length > 0
  }, [errors, touched])

  const getError = useCallback((fieldName: string): string | undefined => {
    return hasError(fieldName) ? errors[fieldName][0] : undefined
  }, [errors, hasError])

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearErrors,
    hasError,
    getError
  }
}

// Utility functions for common validations
export const validationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPhone: (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length >= 10 && numbers.length <= 11
  },

  isValidCPF: (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '')
    
    if (numbers.length !== 11) return false
    
    // Check for known invalid CPFs
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Validate CPF algorithm
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.charAt(10))) return false
    
    return true
  },

  isValidZipCode: (zipCode: string): boolean => {
    const numbers = zipCode.replace(/\D/g, '')
    return numbers.length === 8
  }
}
