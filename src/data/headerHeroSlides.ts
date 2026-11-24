import { MEDIA_ASSETS } from './catalog';

export interface HeaderHeroSlide {
  id: string;
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const HEADER_HERO_SLIDES: HeaderHeroSlide[] = [
  {
    id: 'summer-coast',
    imageSrc: MEDIA_ASSETS.heroDesktop,
    imageAlt: 'Campaña BEACH POLO de verano en la costa peruana',
    badge: 'BEACH POLO · SUMMER 2027',
    title: 'Vive la playa a tu manera',
    subtitle: 'Moda inspirada en el océano y el verano peruano.',
    ctaLabel: 'Comprar ahora',
    ctaHref: '/shop',
  },
  {
    id: 'pima-cotton',
    imageSrc: MEDIA_ASSETS.editorialStory,
    imageAlt: 'Prendas BEACH POLO de algodón Pima para días de sol',
    badge: 'HECHO PARA EL VERANO',
    title: 'Suavidad que acompaña cada aventura',
    subtitle: 'Descubre prendas cómodas y versátiles.',
    ctaLabel: 'Ver colección',
    ctaHref: '/collections/summer',
  },
  {
    id: 'beach-style',
    imageSrc: MEDIA_ASSETS.shopTheLook,
    imageAlt: 'Look de playa BEACH POLO en tonos inspirados en el océano',
    badge: 'NUEVA TEMPORADA',
    title: 'Encuentra tu look de playa',
    subtitle: 'Estilo relajado para disfrutar cada momento.',
    ctaLabel: 'Explorar',
    ctaHref: '/shop',
  },
];
