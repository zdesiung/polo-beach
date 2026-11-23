-- BEACH POLO — Arquitectura PostgreSQL lista para producción (Perú Ecommerce)
-- Entidades: users, categories, collections, products, colors, sizes, variants,
-- inventory, addresses, orders, order_items, payments, wishlists, coupons,
-- stories, banners, reviews, settings.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  dni VARCHAR(12),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  subtitle VARCHAR(160),
  description TEXT,
  hero_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_prefix VARCHAR(40) UNIQUE NOT NULL,
  slug VARCHAR(160) UNIQUE NOT NULL,
  name VARCHAR(180) NOT NULL,
  subtitle VARCHAR(200),
  description TEXT NOT NULL,
  fabric_composition VARCHAR(180),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  price_pen NUMERIC(10, 2) NOT NULL CHECK (price_pen >= 0),
  compare_at_price_pen NUMERIC(10, 2),
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL,
  hex_code VARCHAR(7) NOT NULL
);

CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(16) UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  sku VARCHAR(80) UNIQUE NOT NULL,
  image_url TEXT,
  UNIQUE (product_id, color_id, size_id)
);

CREATE TABLE inventory (
  variant_id UUID PRIMARY KEY REFERENCES variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  warehouse_location VARCHAR(80) DEFAULT 'Lima - Miraflores',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(80) NOT NULL,
  province VARCHAR(80) NOT NULL,
  district VARCHAR(80) NOT NULL,
  street_line TEXT NOT NULL,
  reference TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_pen')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_pen NUMERIC(10, 2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(32) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_first_name VARCHAR(120) NOT NULL,
  customer_last_name VARCHAR(120) NOT NULL,
  customer_dni VARCHAR(12) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
  shipping_department VARCHAR(80),
  shipping_province VARCHAR(80),
  shipping_district VARCHAR(80),
  shipping_address TEXT,
  shipping_reference TEXT,
  subtotal_pen NUMERIC(10, 2) NOT NULL,
  discount_pen NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_pen NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_pen NUMERIC(10, 2) NOT NULL,
  coupon_code VARCHAR(40),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (status IN ('PENDIENTE', 'PAGO VERIFICADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES variants(id) ON DELETE SET NULL,
  product_name VARCHAR(180) NOT NULL,
  color_name VARCHAR(60) NOT NULL,
  size_code VARCHAR(16) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_pen NUMERIC(10, 2) NOT NULL,
  line_total_pen NUMERIC(10, 2) NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method VARCHAR(30) NOT NULL CHECK (method IN ('YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA')),
  provider VARCHAR(40),
  provider_transaction_id VARCHAR(120),
  amount_pen NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ
);

CREATE TABLE wishlists (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement VARCHAR(60) NOT NULL,
  title VARCHAR(180) NOT NULL,
  subtitle VARCHAR(220),
  media_url TEXT,
  cta_label VARCHAR(80),
  cta_href VARCHAR(200),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_name VARCHAR(120) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings (
  key VARCHAR(80) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
