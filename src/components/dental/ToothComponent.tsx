'use client'

import { useState } from 'react'
import { ToothComponentProps, NumberingSystem } from './utils/toothTypes'
import { universalToFDI, getToothName, getToothSVGPath } from './utils/toothMapping'

export function ToothComponent({
  toothNumber,
  numberingSystem,
  hasHistory,
  isSelected,
  onClick,
  showLabel = true,
  disabled = false
}: ToothComponentProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const displayNumber = numberingSystem === NumberingSystem.FDI 
    ? universalToFDI(toothNumber) 
    : toothNumber.toString()
  
  const toothName = getToothName(toothNumber)
  const svgPath = getToothSVGPath(toothNumber)
  
  const handleClick = () => {
    if (!disabled) {
      onClick(toothNumber)
    }
  }
  
  // Classes CSS baseadas no estado
  const containerClasses = [
    "relative flex flex-col items-center cursor-pointer transition-all duration-200",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    isHovered && !disabled ? "scale-110" : "",
    isSelected ? "scale-105" : ""
  ].filter(Boolean).join(" ")
  
  const labelClasses = [
    "text-xs font-medium mt-1 transition-colors duration-200",
    hasHistory ? "text-blue-700" : "text-gray-600",
    isSelected ? "text-green-700" : "",
    disabled ? "text-gray-400" : ""
  ].filter(Boolean).join(" ")

  return (
    <div 
      className={containerClasses}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${toothName} - ${displayNumber}`}
    >
      {/* Container do SVG do dente */}
      <div className="relative flex flex-col items-center">
        {/* SVG do dente com borda sutil para seleção */}
        <div className={`relative transition-all duration-200 ${
          isSelected ? "ring-2 ring-green-500 ring-offset-1 rounded-lg" : ""
        } ${hasHistory ? "filter drop-shadow-lg" : ""}`}>
          <img 
            src={svgPath}
            alt={`Dente ${toothNumber}`}
            className={`w-12 h-18 md:w-16 md:h-24 lg:w-20 lg:h-28 object-contain transition-all duration-200 ${
              hasHistory ? "brightness-110" : ""
            } ${isSelected ? "brightness-110" : ""} ${
              disabled ? "opacity-50 grayscale" : ""
            }`}
            style={{
              maxHeight: 'none', // Permitir altura variável baseada no scaling
              filter: hasHistory ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : ''
            }}
            onError={(e) => {
              // Fallback caso o SVG não carregue
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
          {/* Fallback caso SVG não carregue */}
          <div className="hidden w-12 h-18 md:w-16 md:h-24 lg:w-20 lg:h-28 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 border-2 border-gray-300">
            {toothNumber}
          </div>
        </div>
        
      </div>
      
      {/* Label com numeração */}
      {showLabel && (
        <span className={labelClasses}>
          {displayNumber}
        </span>
      )}
      
      {/* Indicador de histórico */}
      {hasHistory && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
      )}
      
    </div>
  )
}