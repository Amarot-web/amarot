'use client';

import { useEffect, useState, useRef } from 'react';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 20, suffix: '+', label: 'Años de Experiencia' },
  { value: 500, suffix: '+', label: 'Proyectos Completados' },
  { value: 50, suffix: '+', label: 'Clientes Satisfechos' },
  { value: 100, suffix: '%', label: 'Equipos Hilti' },
];

function AnimatedCounter({ value, suffix, startAnimation }: { value: number; suffix: string; startAnimation: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * value);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [startAnimation, value]);

  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden bg-[#111827]">
      {/* Gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />

      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título opcional */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            NUESTRA TRAYECTORIA
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Más de dos décadas brindando servicios de excelencia en perforación y anclajes químicos
          </p>
        </div>

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
            >
              {/* Número con animación */}
              <div className="relative mb-4">
                <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-red-500">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} startAnimation={isVisible} />
                </span>
              </div>

              {/* Label */}
              <p className="text-white/80 text-sm md:text-base font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
