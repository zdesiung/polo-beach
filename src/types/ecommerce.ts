export type CategorySlug =
  | 'hombre'
  | 'mujer'
  | 'ninos'
  | 'playa'
  | 'accesorios';

export type CollectionSlug = 'summer' | 'ocean' | 'beach-life';

export type OrderStatus =
  | 'PENDIENTE'
  | 'PAGO VERIFICADO'
  | 'PREPARANDO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type PaymentMethod = 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA';

export type DeliveryMethod = 'delivery' | 'pickup';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  fabric: string;
  fit: string;
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  collection: CollectionSlug;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: Record<string, number>;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
  objectPosition?: string;
}

export interface CollectionInfo {
  slug: CollectionSlug;
  name: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: ProductColor;
  size: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    email: string;
  };
  deliveryMethod: DeliveryMethod;
  address?: {
    department: string;
    province: string;
    district: string;
    street: string;
    reference?: string;
  };
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
}

export interface StoryArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  image: string;
}

export interface BannerConfig {
  id: string;
  placement: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  announcementText: string;
  announcementVisible: boolean;
  freeShippingThreshold: number;
  limaShippingCost: number;
  provinceShippingCost: number;
  whatsappPhone: string;
  contactEmail: string;
  showroomAddress: string;
  instagramHandle: string;
}
