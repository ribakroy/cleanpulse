"use client";

import { useEffect } from "react";

const sectionIds = ["how", "scan-story", "managers", "pricing", "contact"];

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
    const navSections = sectionIds
      .map((id) => document.querySelector<HTMLElement>(`.cleanpulse-home #${id}`))
      .filter((section): section is HTMLElement => Boolean(section));

    const syncActiveNav = () => {
      if (navLinks.length === 0 || navSections.length === 0) {
        return;
      }

      const activeLine = window.innerHeight * 0.42;
      const activeSection =
        navSections.find((section) => {
          const rect = section.getBoundingClientRect();

          return rect.top <= activeLine && rect.bottom >= activeLine;
        }) ?? navSections[0];

      if (!activeSection) {
        return;
      }

      const href = `#${activeSection.id}`;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === href) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    syncActiveNav();
    window.addEventListener("scroll", syncActiveNav, { passive: true });
    window.addEventListener("resize", syncActiveNav);

    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("scroll", syncActiveNav);
      window.removeEventListener("resize", syncActiveNav);
      revealObserver?.disconnect();
      root.classList.remove("cleanpulse-home-motion-ready", "cleanpulse-home-scrolled");
      navLinks.forEach((link) => link.removeAttribute("aria-current"));
    };
  }, []);

  return null;
}
