import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { MEDIA_ASSETS } from '../../data/catalog';

const CAMPAIGN_FRAMES = [
  {
    id: 'golden-hour',
    label: '01 · Golden Hour',
    desktop: MEDIA_ASSETS.heroDesktop,
    mobile: MEDIA_ASSETS.heroMobile,
    caption: 'Costa Sur Peruana · Algodón Pima 220g',
  },
  {
    id: 'marea-alta',
    label: '02 · Marea Alta',
    desktop: MEDIA_ASSETS.editorialStory,
    mobile: MEDIA_ASSETS.catMujer,
    caption: 'Colección Summer 2027 · Cortes Relajados',
  },
  {
    id: 'costa-norte',
    label: '03 · Costa Norte',
    desktop: MEDIA_ASSETS.shopTheLook,
    mobile: MEDIA_ASSETS.heroMobile,
    caption: 'Océano · Libertad · Verano',
  },
];

export function VideoHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = CAMPAIGN_FRAMES[activeIdx];

  return (
    <section
      aria-label="Campaña principal BEACH POLO"
      className="relative w-full min-h-[92vh] lg:min-h-screen flex items-end lg:items-center overflow-hidden bg-[#082B3A] text-white"
    >
      {/* Desktop Campaign Motion Frame */}
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        <img
          key={`desk-${current.id}`}
          src={current.desktop}
          alt={`BEACH POLO campaña ${current.label}`}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
            playing ? 'animate-hero-motion' : ''
          }`}
        />
      </div>

      {/* Mobile Vertical 9:16 Composition (model on right third, negative space left) */}
      <div className="md:hidden absolute inset-0 overflow-hidden">
        <img
          key={`mob-${current.id}`}
          src={current.mobile}
          alt={`BEACH POLO campaña móvil ${current.label}`}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-top transition-opacity duration-700 ${
            playing ? 'animate-hero-motion' : ''
          }`}
        />
      </div>

      {/* Measured contrast scrims */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0B0D0F]/80 via-[#0B0D0F]/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/75 via-transparent to-[#0B0D0F]/25"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-14 lg:py-24">
        <div className="max-w-xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E8D8BD]">
            BEACH POLO · SUMMER 2027
          </p>

          <h1 className="font-display font-extrabold tracking-tight leading-[1.02] text-[clamp(2.5rem,5.5vw,4.5rem)] text-white [text-wrap:balance]">
            VIVE LA PLAYA
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-md leading-relaxed font-normal">
            Moda inspirada en el océano, creada para vivir el momento.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              to="/shop"
              className="px-7 py-3.5 bg-white text-[#0B0D0F] text-xs sm:text-sm font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#E8D8BD] transition-colors whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              COMPRAR AHORA
            </Link>
            <Link
              to="/collections/summer"
              className="px-7 py-3.5 bg-transparent border border-white/70 text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] rounded-md hover:bg-white/12 transition-colors whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              EXPLORAR COLECCIÓN
            </Link>
          </div>
        </div>

        {/* Campaign Reel Controls */}
        <div className="mt-12 lg:mt-16 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-5">
            {CAMPAIGN_FRAMES.map((frame, index) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => setActiveIdx(index)}
                className={`text-xs font-medium tracking-wider uppercase py-1.5 border-b transition-colors whitespace-nowrap shrink-0 ${
                  activeIdx === index
                    ? 'border-[#B89B5E] text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {frame.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-white/75">
            <span className="hidden sm:inline">{current.caption}</span>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pausar movimiento de campaña' : 'Reanudar movimiento de campaña'}
              className="w-9 h-9 rounded-full border border-white/30 bg-black/25 hover:bg-white/15 inline-flex items-center justify-center transition-colors"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
