'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function BioZenScene() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section id="biozen-scene" className="section w-full py-12 px-4">
      <div
        className="relative w-full max-w-4xl mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Imagen base */}
        <Image
          src="/images/biozen-hydrosol-journey-cientifica.jpg"
          alt="BioZen hydrosol journey: Artemisia annua seed to final product"
          fill
          priority={false}
          className={`object-cover transition-opacity duration-300 ${
            isHovering ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video overlay hover */}
        <video
          autoPlay
          loop
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <source src="/images/biozen-hydrosol-video.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
