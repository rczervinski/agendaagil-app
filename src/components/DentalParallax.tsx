'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function DentalParallax() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Don't render dynamic content until mounted to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      />

      {/* Dentes principais */}
      <div
        className="absolute top-20 right-16"
        style={{
          transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.1}deg)`,
        }}
      >
        <div className="relative w-32 h-32 opacity-70">
          <Image
            src="/parallax-icons/teeth.svg"
            alt="Teeth"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(85%) sepia(15%) saturate(300%) hue-rotate(180deg) brightness(90%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Escova dental */}
      <div
        className="absolute top-40 left-20"
        style={{
          transform: `translateY(${scrollY * -0.2}px) rotate(${45 + scrollY * 0.05}deg)`,
        }}
      >
        <div className="relative w-28 h-28 opacity-60">
          <Image
            src="/parallax-icons/tooth-brush-svgrepo-com.svg"
            alt="Toothbrush"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(75%) sepia(20%) saturate(500%) hue-rotate(120deg) brightness(85%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Pasta de dente */}
      <div
        className="absolute top-60 right-32"
        style={{
          transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.08}deg)`,
        }}
      >
        <div className="relative w-24 h-24 opacity-55">
          <Image
            src="/parallax-icons/toothpaste-svgrepo-com.svg"
            alt="Toothpaste"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(80%) sepia(20%) saturate(400%) hue-rotate(200deg) brightness(85%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Broca dental */}
      <div
        className="absolute top-80 left-12"
        style={{
          transform: `translateY(${scrollY * -0.3}px) rotate(${scrollY * 0.06}deg)`,
        }}
      >
        <div className="relative w-20 h-20 opacity-50">
          <Image
            src="/parallax-icons/dental-drill-svgrepo-com.svg"
            alt="Dental Drill"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(75%) sepia(20%) saturate(600%) hue-rotate(280deg) brightness(85%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Sonda dental */}
      <div
        className="absolute bottom-40 left-1/3"
        style={{
          transform: `translateY(${scrollY * 0.35}px) rotate(${scrollY * -0.04}deg)`,
        }}
      >
        <div className="relative w-16 h-16 opacity-60">
          <Image
            src="/parallax-icons/dental-probe-dental-svgrepo-com.svg"
            alt="Dental Probe"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(70%) sepia(25%) saturate(700%) hue-rotate(260deg) brightness(85%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Alicate dental */}
      <div
        className="absolute bottom-20 right-20"
        style={{
          transform: `translateY(${scrollY * -0.25}px) rotate(${scrollY * 0.03}deg)`,
        }}
      >
        <div className="relative w-20 h-20 opacity-65">
          <Image
            src="/parallax-icons/tooth-pliers-dentist-svgrepo-com.svg"
            alt="Dental Pliers"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(65%) sepia(30%) saturate(800%) hue-rotate(200deg) brightness(85%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Escova dental secundária */}
      <div
        className="absolute top-96 left-1/4"
        style={{
          transform: `translateY(${scrollY * 0.28}px) rotate(${-30 + scrollY * -0.03}deg)`,
        }}
      >
        <div className="relative w-16 h-16 opacity-30">
          <Image
            src="/parallax-icons/tooth-brush-svgrepo-com.svg"
            alt="Toothbrush"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(75%) sepia(20%) saturate(500%) hue-rotate(120deg) brightness(85%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Dente secundário */}
      <div
        className="absolute bottom-60 right-1/4"
        style={{
          transform: `translateY(${scrollY * -0.35}px) rotate(${scrollY * -0.08}deg)`,
        }}
      >
        <div className="relative w-20 h-20 opacity-40">
          <Image
            src="/parallax-icons/teeth.svg"
            alt="Teeth"
            fill
            className="object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(85%) sepia(15%) saturate(300%) hue-rotate(180deg) brightness(90%) contrast(90%)'
            }}
          />
        </div>
      </div>

      {/* Floating circles */}
      <div
        className="absolute top-32 left-1/2"
        style={{
          transform: `translateY(${scrollY * 0.15}px) translateX(${scrollY * 0.05}px)`,
        }}
      >
        <div className="w-24 h-24 bg-blue-100 rounded-full opacity-30 blur-sm" />
      </div>

      <div
        className="absolute top-96 right-20"
        style={{
          transform: `translateY(${scrollY * -0.25}px) translateX(${scrollY * -0.03}px)`,
        }}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full opacity-40 blur-sm" />
      </div>

      <div
        className="absolute bottom-60 left-1/4"
        style={{
          transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0002})`,
        }}
      >
        <div className="w-20 h-20 bg-purple-100 rounded-full opacity-30 blur-md" />
      </div>

      {/* Padrão de bolhas de limpeza */}
      <div
        className="absolute bottom-32 left-1/2"
        style={{
          transform: `translateY(${scrollY * -0.4}px) rotate(${scrollY * 0.02}deg)`,
        }}
      >
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white border border-blue-100 rounded-full opacity-40"
              style={{
                transform: `translateX(${(scrollY * 0.005 + i) * 10}px) scale(${0.5 + i * 0.1})`,
                opacity: 0.3 + Math.sin(scrollY * 0.02 + i) * 0.2,
                marginLeft: `${i * 8}px`
              }}
            />
          ))}
        </div>
      </div>

      {/* Padrão geométrico dental */}
      <div
        className="absolute top-1/2 left-1/3"
        style={{
          transform: `translateY(${scrollY * 0.25}px) rotate(${scrollY * 0.03}deg)`,
        }}
      >
        <div className="grid grid-cols-4 gap-3 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-200 rounded-full"
              style={{
                transform: `scale(${0.8 + Math.sin(scrollY * 0.01 + i) * 0.3})`,
                opacity: 0.3 + (i % 3) * 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* Animated dots pattern */}
      <div
        className="absolute bottom-20 right-1/4"
        style={{
          transform: `translateY(${scrollY * -0.4}px) rotate(${scrollY * 0.02}deg)`,
        }}
      >
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-200 rounded-full opacity-50"
              style={{
                transform: `scale(${1 + Math.sin(scrollY * 0.01 + i) * 0.2})`,
                opacity: 0.3 + Math.sin(scrollY * 0.02 + i) * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
