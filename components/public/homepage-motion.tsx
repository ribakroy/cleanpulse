"use client";

import { useEffect } from "react";

const sectionIds = ["how", "report", "managers", "pricing", "contact"];

export function HomepageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("cleanpulse-home-motion-ready");

    const syncHeader = () => {
      root.classList.toggle("cleanpulse-home-scrolled", window.scrollY > 12);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (reduceMotion) {
      document.querySelectorAll<HTMLElement>(".cleanpulse-home .home-reveal-on-scroll").forEach((element) => {
        element.classList.add("home-reveal-visible");
      });
    }

    let revealObserver: IntersectionObserver | null = null;

    if (!reduceMotion) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("home-reveal-visible");
              revealObserver?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
      );
    }

    revealObserver?.observe(document.querySelector(".cleanpulse-home .hero-copy") ?? document.body);
    document.querySelectorAll(".cleanpulse-home .home-reveal-on-scroll").forEach((element) => revealObserver?.observe(element));

    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".cleanpulse-home [data-home-nav]"));
    const sectionObserver =
      navLinks.length === 0
        ? null
        : new IntersectionObserver(
            (entries) => {
              const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

              if (!visible) {
                return;
              }

              const href = `#${visible.target.id}`;
              navLinks.forEach((link) => {
                if (link.getAttribute("href") === href) {
                  link.setAttribute("aria-current", "true");
                } else {
                  link.removeAttribute("aria-current");
                }
              });
            },
            { rootMargin: "-28% 0px -58% 0px", threshold: [0.08, 0.24, 0.48] },
          );

    sectionIds.forEach((id) => {
      const section = document.querySelector(`.cleanpulse-home #${id}`);
      if (section) {
        sectionObserver?.observe(section);
      }
    });

    return () => {
      window.removeEventListener("scroll", syncHeader);
      revealObserver?.disconnect();
      sectionObserver?.disconnect();
      root.classList.remove("cleanpulse-home-motion-ready", "cleanpulse-home-scrolled");
      navLinks.forEach((link) => link.removeAttribute("aria-current"));
    };
  }, []);

  return null;
}
