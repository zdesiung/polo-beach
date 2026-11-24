import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HEADER_HERO_SLIDES } from '../data/headerHeroSlides';
import { ResilientImage } from './ResilientImage';

interface HeaderVisualSliderProps {
  intervalMs?: number;
}

export function HeaderVisualSlider({ intervalMs = 4500 }: HeaderVisualSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = HEADER_HERO_SLIDES[activeIndex];

  useEffect(() => {
    if (isPaused || intervalMs <= 0 || HEADER_HERO_SLIDES.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HEADER_HERO_SLIDES.length);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, intervalMs, isPaused]);

  const showPrevious = () => {
    setActiveIndex(
      (index) => (index - 1 + HEADER_HERO_SLIDES.length) % HEADER_HERO_SLIDES.length
    );
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % HEADER_HERO_SLIDES.length);
  };

  return (
    <section
      aria-label="Campañas destacadas BEACH POLO"
      aria-roledescription="carrusel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-40 sm:h-52 md:h-60 w-full overflow-hidden bg-[#082B3A] text-white"
    >
      <ResilientImage
        key={activeSlide.id}
        src={activeSlide.imageSrc}
        alt={activeSlide.imageAlt}
        loading={activeIndex === 0 ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0B0D0F]/70 via-[#0B0D0F]/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/65 via-transparent to-[#0B0D0F]/15"
      />

      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-3 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-10">
          <div className="min-w-0 max-w-3xl pr-2">
            {activeSlide.badge && (
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#E8D8BD] sm:text-[10px]">
                {activeSlide.badge}
              </p>
            )}
            {activeSlide.title && (
              <h2 className="mt-1 font-display text-lg font-extrabold leading-tight sm:text-2xl md:text-3xl">
                {activeSlide.title}
              </h2>
            )}
            {activeSlide.subtitle && (
              <p className="mt-1 hidden max-w-xl text-xs text-white/90 sm:block sm:text-sm">
                {activeSlide.subtitle}
              </p>
            )}
            {activeSlide.ctaLabel && activeSlide.ctaHref && (
              <Link
                to={activeSlide.ctaHref}
                className="mt-2 inline-flex rounded-sm bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#0B0D0F] transition-colors hover:bg-[#E8D8BD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:mt-3 sm:px-4 sm:py-2 sm:text-[10px]"
              >
                {activeSlide.ctaLabel}
              </Link>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Diapositiva anterior"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-black/25 text-2xl leading-none text-white hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:h-9 sm:w-9"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Diapositiva siguiente"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-black/25 text-2xl leading-none text-white hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:h-9 sm:w-9"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-1.5" aria-label="Elegir diapositiva">
              {HEADER_HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ir a la diapositiva ${index + 1}: ${slide.title || slide.id}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                    index === activeIndex ? 'w-5 bg-white' : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
