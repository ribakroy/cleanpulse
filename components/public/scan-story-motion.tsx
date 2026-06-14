"use client";

import { useEffect } from "react";

const motionQueryText = "(prefers-reduced-motion: no-preference)";

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function range(progress: number, start: number, end: number) {
  return clamp((progress - start) / (end - start));
}

function format(value: number) {
  return value.toFixed(4);
}

function stepFromProgress(progress: number) {
  if (progress < 0.22) return "scan";
  if (progress < 0.42) return "report";
  if (progress < 0.56) return "success";
  if (progress < 0.66) return "dirty";
  if (progress < 0.84) return "clean";
  return "final";
}

export function ScanStoryMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".cleanpulse-scan-story");

    if (!section) {
      return;
    }

    const motionQuery = window.matchMedia(motionQueryText);
    let raf = 0;

    const setVar = (name: string, value: number | string) => {
      section.style.setProperty(name, typeof value === "number" ? format(value) : value);
    };

    const getProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      return clamp(-rect.top / total);
    };

    const setStatic = () => {
      const progress = getProgress();
      section.classList.remove("scan-story-motion-ready");
      section.dataset.step = stepFromProgress(progress);
      setVar("--scan-progress", progress);
    };

    const update = () => {
      if (!motionQuery.matches) {
        setStatic();
        return;
      }

      section.classList.add("scan-story-motion-ready");

      const progress = getProgress();

      section.dataset.step = stepFromProgress(progress);
      setVar("--scan-progress", progress);

      const phoneIn = range(progress, 0.18, 0.26);
      const phoneOut = range(progress, 0.48, 0.56);
      const phoneZoom = range(progress, 0.24, 0.42);
      const contextOut = range(progress, 0.18, 0.24);
      const restroomIn = range(progress, 0.52, 0.62);
      const finalIn = range(progress, 0.84, 0.92);
      const cleanWipe = range(progress, 0.62, 0.78);
      const bubbles = range(progress, 0.72, 0.8) * (1 - range(progress, 0.88, 0.94));
      const successFlash = range(progress, 0.4, 0.44) * (1 - range(progress, 0.51, 0.55));

      const bgLight = range(progress, 0.56, 0.9);
      const bgClean = range(progress, 0.66, 0.92);

      setVar("--scan-bg-light", Math.max(0.92, bgLight));
      setVar("--scan-bg-light-soft", Math.max(0.84, bgLight * 0.72));
      setVar("--scan-bg-light-strong", Math.max(0.72, bgLight * 0.9));
      setVar("--scan-bg-cool", range(progress, 0.48, 0.68) * (1 - finalIn) * 0.16);
      setVar("--scan-bg-clean", bgClean);
      setVar("--scan-bg-clean-soft", bgClean * 0.54);
      setVar("--scan-bg-clean-strong", bgClean * 0.72);
      setVar("--scan-bg-grid-opacity", (1 - bgClean) * 0.44);
      setVar("--scan-restroom-scrim", (1 - bgClean) * 0.52);
      setVar("--scan-restroom-wash", bgClean * 0.54);
      setVar("--scan-copy-opacity", (1 - range(progress, 0.06, 0.14)) * (1 - finalIn));
      setVar("--scan-copy-y", `${range(progress, 0, 0.14) * -22}px`);

      setVar("--scan-qr-opacity", (1 - phoneOut) * (1 - finalIn));
      setVar("--scan-context-opacity", (1 - contextOut) * (1 - finalIn));
      setVar("--scan-sign-opacity", (1 - contextOut) * (1 - finalIn));
      setVar("--scan-sign-y", `${(1 - phoneIn) * 26 - range(progress, 0.22, 0.42) * 10}px`);
      setVar("--scan-sign-scale", 0.94 + phoneIn * 0.06 - range(progress, 0.22, 0.42) * 0.025);

      const ratingPhoneOpacity = range(progress, 0.22, 0.28) * (1 - range(progress, 0.4, 0.43));
      const successPhoneOpacity = range(progress, 0.4, 0.43) * (1 - range(progress, 0.52, 0.56));
      setVar("--scan-phone-opacity", Math.max(ratingPhoneOpacity, successPhoneOpacity) * (1 - phoneOut) * (1 - finalIn));
      setVar("--scan-phone-y", `${30 + (1 - phoneIn) * 34 - phoneZoom * 4 + phoneOut * -38}px`);
      setVar("--scan-phone-x", `${phoneZoom * -10 + phoneOut * -34}px`);
      setVar("--scan-phone-scale", 0.9 + phoneIn * 0.07 + phoneZoom * 0.08 - phoneOut * 0.06);

      setVar("--scan-ui-camera-opacity", 1 - range(progress, 0.18, 0.24));
      setVar("--scan-ui-rating-opacity", range(progress, 0.2, 0.26) * (1 - range(progress, 0.4, 0.43)));
      setVar("--scan-ui-issue-opacity", range(progress, 0.34, 0.4) * (1 - range(progress, 0.4, 0.43)));
      setVar("--scan-ui-success-opacity", range(progress, 0.4, 0.43) * (1 - range(progress, 0.52, 0.56)));
      setVar("--scan-phone-camera-opacity", 0);
      setVar("--scan-phone-rating-opacity", ratingPhoneOpacity);
      setVar("--scan-phone-success-opacity", successPhoneOpacity);

      const scanFlash = range(progress, 0.055, 0.095) * (1 - range(progress, 0.2, 0.23));
      setVar(
        "--scan-beam-opacity",
        Math.min(1, scanFlash * 1.18),
      );
      setVar("--scan-flash-opacity", Math.max(scanFlash, successFlash * 0.72));
      setVar("--scan-signal-opacity", scanFlash * 0.72);
      setVar("--scan-notification-opacity", range(progress, 0.4, 0.44) * (1 - range(progress, 0.52, 0.56)));
      setVar("--scan-notification-y", `${(1 - range(progress, 0.4, 0.44)) * 16}px`);

      setVar("--scan-restroom-opacity", restroomIn * (1 - finalIn * 0.84));
      setVar("--scan-restroom-scale", 1.05 - restroomIn * 0.05 + finalIn * 0.02);
      setVar("--scan-dirty-opacity", 1 - cleanWipe);
      setVar("--scan-dirty-clip", `${cleanWipe * 100}%`);
      setVar("--scan-clean-opacity", range(progress, 0.62, 0.72));
      setVar("--scan-clean-brightness", 0.86 + range(progress, 0.66, 0.84) * 0.22);
      setVar("--scan-clean-saturation", 0.9 + range(progress, 0.66, 0.84) * 0.18);
      setVar("--scan-sweep-x", `${112 - cleanWipe * 228}%`);
      setVar("--scan-bubbles-opacity", bubbles);
      setVar("--scan-bubbles-y", `${(1 - range(progress, 0.72, 0.82)) * 28}px`);

      setVar("--scan-final-opacity", finalIn);
      setVar("--scan-final-y", `${(1 - finalIn) * 24}px`);
      setVar("--scan-final-blur", `${(1 - finalIn) * 12}px`);
      setVar("--scan-rail-opacity", 1 - range(progress, 0.84, 0.9));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    motionQuery.addEventListener("change", scheduleUpdate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      motionQuery.removeEventListener("change", scheduleUpdate);
      section.classList.remove("scan-story-motion-ready");
    };
  }, []);

  return null;
}
