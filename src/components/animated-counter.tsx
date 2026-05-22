"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useCounter } from "@/hooks/useCounter";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
  triggerOnView?: boolean;
}

export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  decimals = 0,
  className = "",
  triggerOnView = true,
}: AnimatedCounterProps) {
  const { ref, formattedCount } = useCounter({
    end: value,
    duration,
    decimals,
    prefix,
    suffix,
    autoStart: !triggerOnView,
  });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {formattedCount || `${prefix}${value.toFixed(decimals)}${suffix}`}
    </motion.span>
  );
});

// Compact version for inline use
export function CounterValue({ 
  value, 
  suffix = "",
  prefix = "",
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
}) {
  const { ref, formattedCount } = useCounter({
    end: value,
    duration: 1500,
    suffix,
    prefix,
  });

  return <span ref={ref}>{formattedCount || `${prefix}${value}${suffix}`}</span>;
}
