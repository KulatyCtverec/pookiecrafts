"use client";

import * as React from "react";

/**
 * Same-document anchor with reliable smooth scroll (CSS alone is flaky with Next.js / some browsers).
 */
export const SmoothScrollLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(function SmoothScrollLink({ href, onClick, ...props }, ref) {
  const id = typeof href === "string" && href.startsWith("#") ? href.slice(1) : "";

  return (
    <a
      ref={ref}
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !id) return;
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        window.history.pushState(null, "", `#${id}`);
      }}
    />
  );
});
