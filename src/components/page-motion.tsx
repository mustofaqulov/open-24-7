"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Content stays visible without JavaScript or when reduced motion is requested. */
export function PageMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".section-heading, .intro-grid, .story-row, .business-process",
      ),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.enter = "visible";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    for (const element of elements) {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.dataset.enter = "waiting";
        observer.observe(element);
      }
    }
    const reveal = () => {
      if (preference.matches)
        elements.forEach((element) => delete element.dataset.enter);
    };
    preference.addEventListener("change", reveal);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", reveal);
      elements.forEach((element) => delete element.dataset.enter);
    };
  }, [pathname]);
  return null;
}
