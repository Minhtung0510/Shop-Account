"use client";

import { useEffect } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollRevealInit(options: ScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px" } = options;

  useEffect(() => {
    // CSS-based reveal
    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-scale, .stagger-children");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (!entry.target.classList.contains("stagger-children")) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);
}

// Auto-initialize scroll reveal for SSR
export function initScrollReveal() {
  if (typeof window === "undefined") return;

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-scale, .stagger-children");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          if (!entry.target.classList.contains("stagger-children")) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  revealElements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}
