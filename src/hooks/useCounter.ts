"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CounterOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  autoStart?: boolean;
}

export function useCounter(options: CounterOptions) {
  const {
    start = 0,
    end,
    duration = 2000,
    decimals = 0,
    separator = ",",
    prefix = "",
    suffix = "",
    autoStart = true,
  } = options;

  const [count, setCount] = useState(start);
  const [isInView, setIsInView] = useState(autoStart);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);

  const formatNumber = useCallback((num: number) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return prefix + parts.join(".") + suffix;
  }, [decimals, separator, prefix, suffix]);

  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

  useEffect(() => {
    if (!isInView) return;

    setHasStarted(true);

    const startTime = performance.now();
    const diff = end - start;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentValue = start + diff * easedProgress;
      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isInView, start, end, duration]);

  // Intersection Observer for auto-start when in view
  useEffect(() => {
    if (!autoStart || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [autoStart, hasStarted]);

  return {
    ref,
    count,
    formattedCount: formatNumber(count),
    isInView,
    isCompleted: hasStarted && count === end,
    start: () => setIsInView(true),
    reset: () => {
      setCount(start);
      setHasStarted(false);
    },
  };
}
