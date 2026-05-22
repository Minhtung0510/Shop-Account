"use client";

import React, { useRef, useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scaleOnHover?: number;
  enableGlare?: boolean;
  glareColor?: string;
  glowOnHover?: boolean;
  glowColor?: string;
}

export const TiltCard = memo(function TiltCard({
  children,
  className,
  maxTilt = 10,
  perspective = 1000,
  scaleOnHover = 1.03,
  enableGlare = true,
  glareColor = "rgba(255, 255, 255, 0.15)",
  glowOnHover = true,
  glowColor = "rgba(59, 130, 246, 0.3)",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setPosition({ x: rotateY, y: rotateX });
  }, [maxTilt]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  const glareX = ((position.x + maxTilt) / (maxTilt * 2)) * 100;
  const glareY = ((position.y + maxTilt) / (maxTilt * 2)) * 100;

  return (
    <div
      ref={cardRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateX: position.y,
          rotateY: position.x,
          scale: isHovering ? scaleOnHover : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glow effect */}
        {glowOnHover && (
          <motion.div
            className="absolute inset-0 rounded-[18px] pointer-events-none"
            animate={{
              opacity: isHovering ? 1 : 0,
              boxShadow: isHovering ? `0 0 40px ${glowColor}` : "none",
            }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: -1 }}
          />
        )}

        {/* Content */}
        <div style={{ transform: "translateZ(30px)" }}>
          {children}
        </div>
      </motion.div>

      {/* Glare effect */}
      {enableGlare && (
        <motion.div
          className="absolute inset-0 rounded-[18px] pointer-events-none"
          animate={{
            opacity: isHovering ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor} 0%, transparent 60%)`,
            transform: "translateZ(1px)",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
});

// Simple version without glare for performance
export const SimpleTiltCard = memo(function SimpleTiltCard({
  children,
  className,
  maxTilt = 8,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const [transform, setTransform] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovering ? "scale(1.02)" : ""}`);
  }, [maxTilt, isHovering]);

  return (
    <div
      className={cn("transition-shadow duration-300", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setTransform(""); }}
      style={{ transform, transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
});
