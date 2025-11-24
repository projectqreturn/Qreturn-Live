"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageCarousel({
  images,
  autoSlide = false,
  autoSlideInterval = 3000,
}) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((index - 1 + images.length) % images.length);
  const next = () => setIndex((index + 1) % images.length);

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [index, autoSlide]);

  return (
    <div className="relative overflow-hidden w-full max-w-4xl mx-auto rounded-2xl shadow-lg">
      <div className="relative h-[300px] sm:h-[400px]">
        <AnimatePresence>
          <motion.img
            key={images[index]}
            src={images[index]}
            alt={`Slide ${index}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full h-full object-contain"
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button
          onClick={prev}
          className="bg-black/60 hover:bg-black p-2 rounded-full shadow"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          className="bg-black/60 hover:bg-black p-2 rounded-full shadow"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-black" : "bg-black/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
