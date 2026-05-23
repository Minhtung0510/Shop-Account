"use client";

import { useEffect, useState, useRef, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  sizeRange?: [number, number];
  durationRange?: [number, number];
  opacityRange?: [number, number];
}

function generateParticles(
  count: number,
  color: string,
  sizeRange: [number, number],
  durationRange: [number, number],
  opacityRange: [number, number]
): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
    duration: durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]),
    delay: Math.random() * 20,
    opacity: opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]),
    color,
  }));
}

export function FloatingParticles({
  count = 30,
  color = "#3B82F6",
  sizeRange = [2, 6] as [number, number],
  durationRange = [15, 30] as [number, number],
  opacityRange = [0.3, 0.8] as [number, number],
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Memoize particles to prevent re-generation on every render
  const particles = useMemo(() => 
    generateParticles(count, color, sizeRange, durationRange, opacityRange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Only generate once on mount
  );

  return (
    <div
      ref={containerRef}
      className="particles-container"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            position: "absolute",
            top: "-10px",
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
            opacity: particle.opacity,
            animation: `float-particle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}

// Subtle version - fewer particles, more minimal
export function SubtleParticles() {
  return (
    <FloatingParticles
      count={20}
      color="#3B82F6"
      sizeRange={[1, 3]}
      durationRange={[20, 40]}
      opacityRange={[0.2, 0.5]}
    />
  );
}

// Active version - more particles for CTAs
export function ActiveParticles() {
  return (
    <FloatingParticles
      count={40}
      color="#06B6D4"
      sizeRange={[2, 5]}
      durationRange={[10, 25]}
      opacityRange={[0.4, 0.8]}
    />
  );
}
