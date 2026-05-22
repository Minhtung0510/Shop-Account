"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    once = true,
    delay = 0,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once, delay]);

  return { ref: ref as RefObject<T>, isVisible };
}

// Hook for staggered children reveal
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  childCount: number,
  options: ScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...scrollOptions } = options;
  const { ref, isVisible } = useScrollReveal<T>(scrollOptions);

  return {
    ref: ref as RefObject<T>,
    isVisible,
    getChildDelay: (index: number) => (isVisible ? index * staggerDelay : 0),
  };
}

// Multiple elements reveal
export function useMultiScrollReveal<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: ScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...scrollOptions } = options;
  const containerRef = useRef<T>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const childElements = container.querySelectorAll("[data-reveal-item]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-reveal-item"));
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, index]));
            }, index * staggerDelay);

            if (options.once !== false) {
              observer.unobserve(entry.target);
            }
          } else if (options.once === false) {
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.delete(index);
              return next;
            });
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "0px 0px -50px 0px",
      }
    );

    childElements.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [count, staggerDelay, options.threshold, options.rootMargin, options.once]);

  return {
    ref: containerRef as RefObject<T>,
    visibleItems,
    isItemVisible: (index: number) => visibleItems.has(index),
  };
}
