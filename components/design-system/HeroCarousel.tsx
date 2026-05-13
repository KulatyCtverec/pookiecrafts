"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";
import { cn } from "@/lib/utils";

export interface HeroCarouselImage {
  url: string;
  alt: string;
  /** Stabilní klíč pro React (metaobject id). */
  id?: string;
}

interface HeroCarouselProps {
  images: HeroCarouselImage[];
  intervalMs?: number;
  className?: string;
}

export function HeroCarousel({
  images,
  intervalMs = 5000,
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div
      className={cn(
        "relative w-full aspect-16/10 max-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-muted",
        className
      )}
    >
      {images.map((img, i) => (
        <div
          key={img.id ?? `${img.url}-${i}`}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 1 : 0,
          }}
          aria-hidden={i !== index}
        >
          <ImageWithFallback
            src={img.url}
            alt={img.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
