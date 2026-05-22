"use client";

import { useState, useRef, useCallback, RefObject } from "react";

interface TiltOptions {
  maxTilt?: number;
  perspective?: number;
  glare?: boolean;
  glareMaxOpacity?: number;
}

interface TiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
  isHovering: boolean;
}

export function useTilt(options: TiltOptions = {}) {
  const { maxTilt = 15, perspective = 1000, glare = true, glareMaxOpacity = 0.3 } = options;
  
  const [state, setState] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovering: false,
  });
  
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setState({
      rotateX,
      rotateY,
      glareX,
      glareY,
      isHovering: true,
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setState({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovering: false,
    });
  }, []);

  const getStyle = useCallback(() => {
    return {
      transform: `perspective(${perspective}px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`,
      transition: state.isHovering ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
    };
  }, [state, perspective]);

  const getGlareStyle = useCallback(() => {
    if (!glare) return {};
    return {
      background: `radial-gradient(circle at ${state.glareX}% ${state.glareY}%, rgba(255, 255, 255, ${glareMaxOpacity}) 0%, transparent 50%)`,
      opacity: state.isHovering ? 1 : 0,
      transition: state.isHovering ? "opacity 0.3s ease" : "opacity 0.3s ease",
    };
  }, [glare, state, glareMaxOpacity]);

  return {
    ref: elementRef as RefObject<HTMLDivElement>,
    state,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    getStyle,
    getGlareStyle,
  };
}
