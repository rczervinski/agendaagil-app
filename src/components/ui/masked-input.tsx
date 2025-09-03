'use client'

import React, { forwardRef } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'phone' | 'cpf' | 'zipCode'
  onValueChange?: (value: string, maskedValue: string) => void
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onValueChange, onChange, className, ...props }, ref) => {
    const applyMask = (value: string, maskType: string): string => {
      const numbers = value.replace(/\D/g, '')
      
      switch (maskType) {
        case 'phone':
          if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
          } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
          }
        case 'cpf':
          return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        case 'zipCode':
          return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
        default:
          return value
      }
    }

    const getMaxLength = (maskType: string): number => {
      switch (maskType) {
        case 'phone':
          return 15 // (11) 99999-9999
        case 'cpf':
          return 14 // 000.000.000-00
        case 'zipCode':
          return 9 // 00000-000
        default:
          return 0
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const numbers = rawValue.replace(/\D/g, '')
      const maskedValue = applyMask(rawValue, mask)
      
      // Update the input value
      e.target.value = maskedValue
      
      // Call the custom handler if provided
      if (onValueChange) {
        onValueChange(numbers, maskedValue)
      }
      
      // Call the original onChange if provided
      if (onChange) {
        onChange(e)
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        className={cn(className)}
        onChange={handleChange}
        maxLength={getMaxLength(mask)}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
