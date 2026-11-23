import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Edit3,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, COLLECTIONS, MEDIA_ASSETS } from '../data/catalog';
import { CategorySlug, CollectionSlug, OrderStatus, Product } from '../types/ecommerce';
import { formatPEN } from '../utils/analytics';
import { BrandLogo } from '../components/BrandLogo';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'collections'
  | 'customers'
  | 'coupons'
  | 'banners'
  | 'content'
  | 'stories'
  | 'settings';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDIENTE',
  'PAGO VERIFICADO',
  'PREPARANDO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
];

export function AdminDashboardPage() {
  const {
    products,
    orders,
    customers,
    coupons,
    banners,
    stories,
    settings,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleBanner,
    toggleCoupon,
    updateSettings,
  } = useStore();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [orderSearch, setOrderSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Product Form State
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pPrice, setPPrice] = useState('89');
  const [pCompare, setPCompare] = useState('');
  const [pCat, setPCat] = useState<CategorySlug>('hombre');
  const [pCol, setPCol] = useState<CollectionSlug>('summer');
  const [pDesc, setPDesc] = useState('');
  const [pStockM, setPStockM] = useState('15');
  const [pImage, setPImage] = useState(MEDIA_ASSETS.poloOcean);

  // Settings local draft
  const [whatsappDraft, setWhatsappDraft] = useState(settings.whatsappPhone);
  const [announcementDraft, setAnnouncementDraft] = useState(settings.announcementText);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'CANCELADO')
        .reduce((acc, o) => acc + o.total, 0),
    [orders]
  );

  const todayRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'CANCELADO')
        .slice(0, 2)
        .reduce((acc, o) => acc + o.total, 0),
    [orders]
  );

  const totalStock = useMemo(
    () =>
      products.reduce(
        (acc, p) => acc + Object.values(p.stock).reduce((s, n) => s + n, 0),
        0
      ),
    [products]
  );

  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  const openCreateModal = () => {
    setEditingProduct(null);
    setPName('');
    setPSku(`BP-NEW-${Math.floor(10 + Math.random() * 89)}`);
    setPPrice('89');
    setPCompare('');
    setPCat('hombre');
    setPCol('summer');
    setPDesc('Polo de algodón Pima peruano de corte moderno.');
    setPStockM('15');
    setPImage(MEDIA_ASSETS.poloOcean);
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPPrice(String(prod.price));
    setPCompare(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
    setPCat(prod.category);
    setPCol(prod.collection);
    setPDesc(prod.description);
    setPStockM(String(prod.stock['M'] ?? Object.values(prod.stock)[0] ?? 10));
    setPImage(prod.images[0]);
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(pPrice) || 89;
    const numericCompare = pCompare ? Number(pCompare) : undefined;
    const qty = Number(pStockM) || 10;
    const slug = pName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: pName.trim(),
        sku: pSku.trim(),
        price: numericPrice,
        compareAtPrice: numericCompare,
        category: pCat,
        collection: pCol,
        description: pDesc.trim(),
        images: [pImage, ...editingProduct.images.slice(1)],
        stock: { ...editingProduct.stock, M: qty },
      });
    } else {
      addProduct({
        id: `prod-${Date.now()}`,
        sku: pSku.trim(),
        slug: slug || `producto-${Date.now()}`,
        name: pName.trim().toUpperCase(),
        subtitle: 'Algodón Pima Peruano · Edición Summer 2027',
        description: pDesc.trim(),
        fabric: '100% Algodón Pima Peruano',
        fit: 'Regular Modern Fit',
        price: numericPrice,
        compareAtPrice: numericCompare,
        category: pCat,
        collection: pCol,
        images: [pImage, MEDIA_ASSETS.heroDesktop],
        colors: [
          { name: 'Azul Océano', hex: '#0E5A78' },
          { name: 'Arena', hex: '#E8D8BD' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: { S: qty, M: qty, L: qty, XL: Math.max(2, Math.floor(qty / 2)) },
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
        isNew: true,
      });
    }
    setModalOpen(false);
  };

  const menuItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: FolderOpen },
    { id: 'collections', label: 'Colecciones', icon: Layers },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'coupons', label: 'Cupones', icon: Tag },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'content', label: 'Contenido', icon: BarChart3 },
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const weeklySales = [
    { day: 'Lun', amount: 420 },
    { day: 'Mar', amount: 680 },
    { day: 'Mié', amount: 540 },
    { day: 'Jue', amount: 890 },
    { day: 'Vie', amount: 1120 },
    { day: 'Sáb', amount: 1480 },
    { day: 'Dom', amount: Math.max(960, Math.round(totalRevenue)) },
  ];
  const maxSale = Math.max(...weeklySales.map((d) => d.amount));

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#0B0D0F] flex flex-col lg:flex-row">
      <SeoHead
        title="Panel Administrativo | BEACH POLO"
        description="Backoffice de ecommerce BEACH POLO Perú."
        canonicalPath="/admin"
      />

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#0B0D0F] text-white shrink-0 flex flex-col justify-between">
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <Link to="/">
              <BrandLogo tone="light" showSymbol={false} />
            </Link>
            <span className="text-[11px] font-mono text-[#E8D8BD]">ADMIN</span>
          </div>

          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#0E5A78] text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-white/10">
          <Link
            to="/"
            className="block w-full py-2.5 px-3 text-center text-xs font-semibold bg-white/10 rounded-md hover:bg-white/20 transition-colors"
          >
            Ver tienda online →
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-black/8 px-6 flex items-center justify-between gap-4">
          <div className="text-xs text-[#0B0D0F]/60 flex items-center gap-2">
            <span>BEACH POLO Admin</span>
            <span>/</span>
            <span className="font-semibold text-[#0B0D0F] capitalize">{tab}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#0B0D0F] text-white text-xs font-semibold rounded-md hover:bg-[#0E5A78] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-8">
          {tab === 'dashboard' && (
            <>
              {/* 8 KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Ventas Hoy', value: formatPEN(todayRevenue) },
                  { label: 'Ventas del Mes', value: formatPEN(totalRevenue + 4850) },
                  { label: 'Pedidos', value: String(orders.length) },
                  { label: 'Clientes', value: String(customers.length) },
                  { label: 'Productos', value: String(products.length) },
                  { label: 'Stock Total', value: `${totalStock} u.` },
                  { label: 'Conversión', value: '3.4%' },
                  { label: 'Ticket Promedio', value: formatPEN(avgTicket) },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white p-5 rounded-xl border border-black/8"
                  >
                    <p className="text-xs text-[#0B0D0F]/55">{kpi.label}</p>
                    <p className="mt-1.5 font-display font-bold text-2xl tabular-nums text-[#0B0D0F]">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-black/8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-bold text-base">
                        Ingresos últimos 7 días (PEN)
                      </h2>
                      <p className="text-xs text-[#0B0D0F]/55">
                        Rendimiento diario de tienda online
                      </p>
                    </div>
                  </div>
                  <div className="h-52 flex items-end gap-3 sm:gap-5 pt-4">
                    {weeklySales.map((d) => {
                      const pct = Math.round((d.amount / maxSale) * 100);
                      return (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[11px] font-mono text-[#0B0D0F]/65 tabular-nums">
                            {d.amount}
                          </span>
                          <div className="w-full max-w-[44px] bg-[#FAF7F2] rounded-t-md h-36 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-[#0E5A78] rounded-t-md transition-all"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-[#0B0D0F]/70">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-black/8 space-y-5">
                  <h2 className="font-display font-bold text-base">
                    Métodos de pago (Perú)
                  </h2>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Yape', pct: 46, color: '#0E5A78' },
                      { label: 'Tarjeta (Culqi / Visa)', pct: 32, color: '#0B0D0F' },
                      { label: 'Plin', pct: 14, color: '#B89B5E' },
                      { label: 'Transferencia Bancaria', pct: 8, color: '#082B3A' },
                    ].map((ch) => (
                      <div key={ch.label} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{ch.label}</span>
                          <span className="tabular-nums font-semibold">{ch.pct}%</span>
                        </div>
                        <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${ch.pct}%`, backgroundColor: ch.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {(tab === 'orders' || tab === 'dashboard') && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display font-bold text-base">
                  Gestión de Pedidos ({orders.length})
                </h2>
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Filtrar por orden o cliente..."
                  className="px-3 py-1.5 text-xs border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Destino</th>
                      <th className="py-3 px-4">Pago</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {orders
                      .filter(
                        (o) =>
                          o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          `${o.customer.firstName} ${o.customer.lastName}`
                            .toLowerCase()
                            .includes(orderSearch.toLowerCase())
                      )
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF7F2]/60">
                          <td className="py-3 px-4 font-mono font-semibold">{order.id}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-[#0B0D0F]/55">DNI {order.customer.dni}</p>
                          </td>
                          <td className="py-3 px-4">
                            {order.deliveryMethod === 'pickup'
                              ? 'Recojo Miraflores'
                              : `${order.address?.district}, ${order.address?.department}`}
                          </td>
                          <td className="py-3 px-4 font-medium">{order.paymentMethod}</td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums">
                            {formatPEN(order.total)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              aria-label={`Estado de ${order.id}`}
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className="px-2.5 py-1.5 rounded border border-black/15 bg-white text-xs font-semibold outline-none focus:border-[#0E5A78]"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between">
                <h2 className="font-display font-bold text-base">
                  Catálogo de Productos ({products.length})
                </h2>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-3.5 py-1.5 bg-[#0E5A78] text-white text-xs font-semibold rounded-md"
                >
                  + Crear producto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4 text-right">Precio</th>
                      <th className="py-3 px-4 text-right">Stock</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {products.map((prod) => {
                      const sumStock = Object.values(prod.stock).reduce((a, b) => a + b, 0);
                      return (
                        <tr key={prod.id} className="hover:bg-[#FAF7F2]/60">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 rounded overflow-hidden bg-[#FAF7F2] shrink-0">
                                <ResilientImage src={prod.images[0]} alt={prod.name} />
                              </div>
                              <div>
                                <p className="font-bold">{prod.name}</p>
                                <p className="text-[#0B0D0F]/55 capitalize">{prod.collection}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">{prod.sku}</td>
                          <td className="py-3 px-4 capitalize">{prod.category}</td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums">
                            {formatPEN(prod.price)}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">{sumStock} u.</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(prod)}
                                aria-label={`Editar ${prod.name}`}
                                className="p-1.5 rounded hover:bg-black/5 text-[#0E5A78]"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(prod.id)}
                                aria-label={`Eliminar ${prod.name}`}
                                className="p-1.5 rounded hover:bg-black/5 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map((c) => (
                <div key={c.slug} className="bg-white rounded-xl p-5 border border-black/8 space-y-2">
                  <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#FAF7F2]">
                    <ResilientImage src={c.image} alt={c.name} />
                  </div>
                  <h3 className="font-display font-bold text-base">{c.name}</h3>
                  <p className="text-xs text-[#0B0D0F]/65">{c.description}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'collections' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLLECTIONS.map((col) => (
                <div key={col.slug} className="bg-white rounded-xl p-5 border border-black/8 space-y-2">
                  <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#FAF7F2]">
                    <ResilientImage src={col.image} alt={col.name} />
                  </div>
                  <h3 className="font-display font-bold text-base">{col.name}</h3>
                  <p className="text-xs text-[#0E5A78] font-medium">{col.subtitle}</p>
                  <p className="text-xs text-[#0B0D0F]/65">{col.description}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'customers' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8">
                <h2 className="font-display font-bold text-base">Clientes ({customers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Nombre</th>
                      <th className="py-3 px-4">DNI</th>
                      <th className="py-3 px-4">Ciudad</th>
                      <th className="py-3 px-4 text-right">Pedidos</th>
                      <th className="py-3 px-4 text-right">Total Gastado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4">
                          <p className="font-semibold">{c.firstName} {c.lastName}</p>
                          <p className="text-[#0B0D0F]/55">{c.email}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">{c.dni}</td>
                        <td className="py-3 px-4">{c.city}</td>
                        <td className="py-3 px-4 text-right tabular-nums">{c.ordersCount}</td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums">
                          {formatPEN(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'coupons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {coupons.map((cp) => (
                <div key={cp.code} className="bg-white p-6 rounded-xl border border-black/8 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-lg">{cp.code}</p>
                    <p className="text-xs text-[#0B0D0F]/65 mt-0.5">{cp.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCoupon(cp.code)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold ${
                      cp.active ? 'bg-[#0E5A78] text-white' : 'bg-black/10 text-[#0B0D0F]'
                    }`}
                  >
                    {cp.active ? 'Activo' : 'Pausado'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'banners' && (
            <div className="space-y-4">
              {banners.map((b) => (
                <div key={b.id} className="bg-white p-6 rounded-xl border border-black/8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#0E5A78] font-semibold uppercase">{b.placement}</p>
                    <h3 className="font-display font-bold text-lg">{b.title}</h3>
                    <p className="text-xs text-[#0B0D0F]/65">{b.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBanner(b.id)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold ${
                      b.active ? 'bg-[#0B0D0F] text-white' : 'bg-black/10 text-[#0B0D0F]'
                    }`}
                  >
                    {b.active ? 'Publicado' : 'Oculto'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'content' && (
            <div className="bg-white p-6 rounded-xl border border-black/8 space-y-4">
              <h2 className="font-display font-bold text-lg">
                Arquitectura Escalable & Integraciones Listas
              </h2>
              <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
                BEACH POLO está estructurado sobre modelo relacional PostgreSQL (`src/db/schema.sql`), eventos ecommerce GA4 / GTM / Meta Pixel (`window.dataLayer`) y pasarelas peruanas preparadas para conectar credenciales server-side de Culqi, Mercado Pago, Stripe, Yape, Plin y WhatsApp Business API.
              </p>
            </div>
          )}

          {tab === 'stories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {stories.map((st) => (
                <div key={st.id} className="bg-white p-5 rounded-xl border border-black/8 flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <ResilientImage src={st.image} alt={st.title} />
                  </div>
                  <div>
                    <p className="text-xs text-[#0B0D0F]/55">{st.category} · {st.date}</p>
                    <h3 className="font-display font-bold text-base mt-1">{st.title}</h3>
                    <Link to={`/stories/${st.slug}`} className="text-xs text-[#0E5A78] hover:underline mt-2 inline-block">
                      Abrir artículo →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'settings' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSettings({
                  whatsappPhone: whatsappDraft.trim(),
                  announcementText: announcementDraft.trim(),
                  announcementVisible: true,
                });
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 3000);
              }}
              className="bg-white p-6 rounded-xl border border-black/8 space-y-5 max-w-2xl"
            >
              <h2 className="font-display font-bold text-lg">Configuración de Tienda (Perú)</h2>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Número WhatsApp Business (9 dígitos Perú, sin número ficticio por defecto)
                </label>
                <input
                  type="tel"
                  value={whatsappDraft}
                  onChange={(e) => setWhatsappDraft(e.target.value)}
                  placeholder="Ej. 999888777"
                  className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Barra de Anuncio Superior
                </label>
                <input
                  type="text"
                  value={announcementDraft}
                  onChange={(e) => setAnnouncementDraft(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78]"
                >
                  Guardar configuración
                </button>
                {settingsSaved && (
                  <span className="text-xs font-semibold text-[#0E5A78]">
                    Cambios guardados
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Product Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/55" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSaveProduct}
            className="relative w-full max-w-lg bg-white rounded-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <h3 className="font-display font-bold text-lg">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="BEACH POLO CORAL"
                  className="w-full px-3 py-2 border border-black/15 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={pSku}
                  onChange={(e) => setPSku(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Stock talla M</label>
                <input
                  type="number"
                  min={0}
                  value={pStockM}
                  onChange={(e) => setPStockM(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Precio (S/) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Precio anterior (S/)</label>
                <input
                  type="number"
                  min={0}
                  value={pCompare}
                  onChange={(e) => setPCompare(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-black/15 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Categoría</label>
                <select
                  value={pCat}
                  onChange={(e) => setPCat(e.target.value as CategorySlug)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Colección</label>
                <select
                  value={pCol}
                  onChange={(e) => setPCol(e.target.value as CollectionSlug)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  {COLLECTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Fotografía</label>
                <select
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  <option value={MEDIA_ASSETS.poloOcean}>Polo Ocean</option>
                  <option value={MEDIA_ASSETS.poloSunset}>Polo Sunset</option>
                  <option value={MEDIA_ASSETS.poloPalm}>Polo Palm</option>
                  <option value={MEDIA_ASSETS.poloBlack}>Polo Black / Premium</option>
                  <option value={MEDIA_ASSETS.poloSand}>Polo Sand</option>
                  <option value={MEDIA_ASSETS.poloWhite}>Polo Blanco & Short</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold border border-black/15 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#0B0D0F] text-white rounded-md hover:bg-[#0E5A78]"
              >
                {editingProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
