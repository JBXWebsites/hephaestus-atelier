"use client";

import { useRef, type AnchorHTMLAttributes } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** A fixed hit target with a responsive inner seal; no moving-target interaction. */
export default function OrbitLink({
  children,
  reducedMotion = false,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { reducedMotion?: boolean }) {
  const root = useRef<HTMLAnchorElement>(null);
  useGSAP(
    (_context, contextSafe) => {
      const link = root.current;
      if (!link || reducedMotion) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const ring = link.querySelector(".orbit-link-ring");
          const arrow = link.querySelector(".orbit-link-arrow");
          const enter = contextSafe!(() =>
            gsap.to(ring, {
              rotation: 65,
              duration: 0.65,
              ease: "power3.out",
              overwrite: true,
            }),
          );
          const move = contextSafe!((event: PointerEvent) => {
            const rect = link.getBoundingClientRect();
            gsap.to(arrow, {
              x: gsap.utils.clamp(
                -4,
                4,
                (event.clientX - rect.left - rect.width / 2) * 0.05,
              ),
              y: gsap.utils.clamp(
                -4,
                4,
                (event.clientY - rect.top - rect.height / 2) * 0.08,
              ),
              duration: 0.3,
              ease: "power3.out",
              overwrite: true,
            });
          });
          const leave = contextSafe!(() => {
            gsap.to(ring, {
              rotation: 0,
              duration: 0.65,
              ease: "power3.out",
              overwrite: true,
            });
            gsap.to(arrow, { x: 0, y: 0, duration: 0.3, overwrite: true });
          });
          link.addEventListener("pointerenter", enter);
          link.addEventListener("pointermove", move);
          link.addEventListener("pointerleave", leave);
          link.addEventListener("focus", enter);
          link.addEventListener("blur", leave);
          return () => {
            link.removeEventListener("pointerenter", enter);
            link.removeEventListener("pointermove", move);
            link.removeEventListener("pointerleave", leave);
            link.removeEventListener("focus", enter);
            link.removeEventListener("blur", leave);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [reducedMotion], revertOnUpdate: true },
  );
  return (
    <a {...props} ref={root} className={`orbit-link ${className}`}>
      <span className="orbit-link-seal" aria-hidden="true">
        <svg className="orbit-link-ring" viewBox="0 0 72 72">
          <path d="M36 3a33 33 0 0 1 33 33M36 69A33 33 0 0 1 3 36" />
          <circle cx="36" cy="36" r="27" />
        </svg>
        <svg className="orbit-link-arrow" viewBox="0 0 24 24">
          <path d="M5 19 19 5M5 5h14v14" />
        </svg>
      </span>
      <span className="orbit-link-label">{children}</span>
    </a>
  );
}
