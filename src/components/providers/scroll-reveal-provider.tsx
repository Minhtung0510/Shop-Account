"use client";

import { useEffect } from "react";

interface ScrollRevealProviderProps {
  children: React.ReactNode;
}

export function ScrollRevealProvider({ children }: ScrollRevealProviderProps) {
  useEffect(() => {
    const initReveal = () => {
      const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-scale, .stagger-children");

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

      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initReveal, 100);

    // Also run on DOMContentLoaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initReveal);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return <>{children}</>;
}
