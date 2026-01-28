"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  type: "star" | "sparkle" | "confetti" | "twinkle" | "burst"
  delay: number
}

const COLORS = [
  "#8B4513", // brown ink
  "#2F4F4F", // dark slate
  "#CD853F", // peru
  "#556B2F", // olive
  "#4682B4", // steel blue
  "#A0522D", // sienna
  "#6B8E23", // olive drab
  "#DAA520", // goldenrod
  "#B8860B", // dark goldenrod
]

export function MagicParticles({ 
  trigger, 
  originX, 
  originY 
}: { 
  trigger: number
  originX: number
  originY: number 
}) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger === 0) return

    const newParticles: Particle[] = []
    const particleCount = 45

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 4 + Math.random() * 7
      const types: Particle["type"][] = ["star", "star", "sparkle", "confetti", "twinkle", "burst"]
      
      newParticles.push({
        id: Date.now() + i,
        x: originX,
        y: originY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 12,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 25,
        opacity: 1,
        type: types[Math.floor(Math.random() * types.length)],
        delay: Math.random() * 100,
      })
    }

    setParticles((prev) => [...prev, ...newParticles])

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            speedY: p.speedY + 0.12,
            speedX: p.speedX * 0.99,
            rotation: p.rotation + p.rotationSpeed,
            opacity: p.opacity - 0.018,
          }))
          .filter((p) => p.opacity > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [trigger, originX, originY])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}ms`,
          }}
        >
          {particle.type === "star" && (
            <svg
              width={particle.size}
              height={particle.size}
              viewBox="0 0 24 24"
              fill={particle.color}
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          )}
          {particle.type === "sparkle" && (
            <svg
              width={particle.size}
              height={particle.size}
              viewBox="0 0 24 24"
              fill={particle.color}
            >
              <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
            </svg>
          )}
          {particle.type === "confetti" && (
            <div
              style={{
                width: particle.size * 0.4,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: "2px",
              }}
            />
          )}
          {particle.type === "twinkle" && (
            <svg
              width={particle.size}
              height={particle.size}
              viewBox="0 0 24 24"
              fill={particle.color}
            >
              <circle cx="12" cy="12" r="4" opacity="0.8" />
              <path 
                d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" 
                stroke={particle.color} 
                strokeWidth="1.5" 
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
          {particle.type === "burst" && (
            <svg
              width={particle.size * 1.2}
              height={particle.size * 1.2}
              viewBox="0 0 24 24"
              fill={particle.color}
            >
              <path d="M12 0L14 8L22 6L16 12L22 18L14 16L12 24L10 16L2 18L8 12L2 6L10 8L12 0Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
