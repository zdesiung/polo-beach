import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  STORIES,
} from '../data/catalog';
import {
  BannerConfig,
  CartItem,
  Coupon,
  CustomerProfile,
  Order,
  OrderStatus,
  Product,
  ProductColor,
  StoreSettings,
  StoryArticle,
} from '../types/ecommerce';
import { trackEcommerceEvent } from '../utils/analytics';

interface StoreContextValue {
  products: Product[];
  orders: Order[];
  customers: CustomerProfile[];
  coupons: Coupon[];
  banners: BannerConfig[];
  stories: StoryArticle[];
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  appliedCoupon: Coupon | null;
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, color: ProductColor, size: string, quantity?: number) => void;
  updateCartQty: (productId: string, colorName: string, size: string, delta: number) => void;
  removeFromCart: (productId: string, colorName: string, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  recordRecentlyViewed: (slug: string) => void;
  applyCouponCode: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleBanner: (bannerId: string) => void;
  toggleCoupon: (code: string) => void;
  updateSettings: (partial: Partial<StoreSettings>) => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  dismissAnnouncement: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEYS = {
  cart: 'bp_cart_v1',
  wishlist: 'bp_wishlist_v1',
  recent: 'bp_recent_v1',
  orders: 'bp_orders_v1',
  products: 'bp_products_v1',
  settings: 'bp_settings_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    readStorage(STORAGE_KEYS.products, INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage(STORAGE_KEYS.orders, INITIAL_ORDERS)
  );
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [banners, setBanners] = useState<BannerConfig[]>(INITIAL_BANNERS);
  const [stories] = useState<StoryArticle[]>(STORIES);
  const [settings, setSettings] = useState<StoreSettings>(() =>
    readStorage(STORAGE_KEYS.settings, INITIAL_SETTINGS)
  );
  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_KEYS.cart, []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.wishlist, ['prod-bp-ocean', 'prod-bp-wave'])
  );
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.recent, ['beach-polo-ocean', 'beach-polo-sunset'])
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentlyViewed));
    } catch {
      // ignore
    }
  }, [recentlyViewed]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const addToCart = (
    product: Product,
    color: ProductColor,
    size: string,
    quantity = 1
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.color.name === color.name &&
          item.size === size
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          price: product.price,
          color,
          size,
          quantity,
        },
      ];
    });
    trackEcommerceEvent('add_to_cart', {
      item_id: product.sku,
      item_name: product.name,
      price: product.price,
      quantity,
      variant: `${color.name} / ${size}`,
    });
    setCartOpen(true);
  };

  const updateCartQty = (
    productId: string,
    colorName: string,
    size: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.color.name === colorName &&
            item.size === size
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string, colorName: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.color.name === colorName &&
            item.size === size
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (!exists) {
        trackEcommerceEvent('wishlist', { item_id: productId });
      }
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const recordRecentlyViewed = (slug: string) => {
    setRecentlyViewed((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 6));
  };

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.type === 'percentage') {
      return Number(((cartSubtotal * appliedCoupon.value) / 100).toFixed(2));
    }
    return Math.min(appliedCoupon.value, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const applyCouponCode = (rawCode: string): { ok: boolean; message: string } => {
    const clean = rawCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code === clean && c.active);
    if (!found) {
      return { ok: false, message: 'Código de cupón inválido o expirado.' };
    }
    if (cartSubtotal < found.minOrder) {
      return {
        ok: false,
        message: `Este cupón requiere una compra mínima de S/ ${found.minOrder}.`,
      };
    }
    setAppliedCoupon(found);
    return { ok: true, message: `Cupón ${found.code} aplicado: ${found.description}` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const num = Math.floor(1050 + Math.random() * 8900);
    const newOrder: Order = {
      ...orderData,
      id: `BP-2027-${num}`,
      status: orderData.paymentMethod === 'TARJETA' ? 'PAGO VERIFICADO' : 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Decrement product inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedForProd = orderData.items.filter((i) => i.productId === prod.id);
        if (orderedForProd.length === 0) return prod;
        const nextStock = { ...prod.stock };
        orderedForProd.forEach((oi) => {
          if (typeof nextStock[oi.size] === 'number') {
            nextStock[oi.size] = Math.max(0, nextStock[oi.size] - oi.quantity);
          }
        });
        return { ...prod, stock: nextStock };
      })
    );

    // Upsert customer summary
    setCustomers((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.email.toLowerCase() === orderData.customer.email.toLowerCase()
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          ordersCount: copy[existingIdx].ordersCount + 1,
          totalSpent: Number((copy[existingIdx].totalSpent + orderData.total).toFixed(2)),
        };
        return copy;
      }
      return [
        {
          id: `cust-${Date.now()}`,
          firstName: orderData.customer.firstName,
          lastName: orderData.customer.lastName,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          dni: orderData.customer.dni,
          city: orderData.address
            ? `${orderData.address.district}, ${orderData.address.department}`
            : 'Recojo Miraflores, Lima',
          ordersCount: 1,
          totalSpent: orderData.total,
          joinedAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ];
    });

    trackEcommerceEvent('purchase', {
      transaction_id: newOrder.id,
      value: newOrder.total,
      payment_type: newOrder.paymentMethod,
      items: newOrder.items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleBanner = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, active: !b.active } : b))
    );
  };

  const toggleCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  const updateSettings = (partial: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const dismissAnnouncement = () => {
    setSettings((prev) => ({ ...prev, announcementVisible: false }));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        coupons,
        banners,
        stories,
        settings,
        cart,
        wishlist,
        recentlyViewed,
        appliedCoupon,
        cartOpen,
        searchOpen,
        setCartOpen,
        setSearchOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        recordRecentlyViewed,
        applyCouponCode,
        removeCoupon,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleBanner,
        toggleCoupon,
        updateSettings,
        cartCount,
        cartSubtotal,
        cartDiscount,
        dismissAnnouncement,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
