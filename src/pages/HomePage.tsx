import { SeoHead } from '../components/SeoHead';
import { VideoHero } from '../components/home/VideoHero';
import { ShopTheLook } from '../components/home/ShopTheLook';
import {
  BeachStoriesSection,
  BenefitsBar,
  BestSellersCarousel,
  BrandStorySection,
  CategoriesSection,
  EditorialVideoSection,
  InstagramGrid,
  NewCollectionSection,
  NewsletterSection,
} from '../components/home/HomeSections';
import { MEDIA_ASSETS } from '../data/catalog';

export function HomePage() {
  return (
    <>
      <SeoHead
        title="BEACH POLO – Vive la Playa | Moda Beachwear Premium Perú"
        description="Moda beachwear premium inspirada en el océano y el verano peruano. Polos de algodón Pima, shorts y accesorios con envíos a todo el Perú."
        canonicalPath="/"
        ogImage={MEDIA_ASSETS.heroDesktop}
      />
      <VideoHero />
      <BenefitsBar />
      <NewCollectionSection />
      <BestSellersCarousel />
      <EditorialVideoSection />
      <ShopTheLook />
      <CategoriesSection />
      <BrandStorySection />
      <BeachStoriesSection />
      <InstagramGrid />
      <NewsletterSection />
    </>
  );
}
