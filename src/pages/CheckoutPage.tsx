import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ShieldCheck, Store, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PERU_UBIGEO } from '../data/peruUbigeo';
import { DeliveryMethod, Order, PaymentMethod } from '../types/ecommerce';
import { formatPEN, trackEcommerceEvent } from '../utils/analytics';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

export function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    settings,
    createOrder,
  } = useStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [department, setDepartment] = useState('Lima');
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState('Miraflores');
  const [street, setStreet] = useState('');
  const [reference, setReference] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('YAPE');
  const [paymentReference, setPaymentReference] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (cart.length > 0) {
      trackEcommerceEvent('begin_checkout', { value: cartSubtotal });
    }
  }, []);

  const currentDept = useMemo(
    () => PERU_UBIGEO.find((d) => d.name === department) || PERU_UBIGEO[0],
    [department]
  );

  const currentProv = useMemo(
    () =>
      currentDept.provinces.find((p) => p.name === province) ||
      currentDept.provinces[0],
    [currentDept, province]
  );

  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    const dept = PERU_UBIGEO.find((d) => d.name === deptName) || PERU_UBIGEO[0];
    const firstProv = dept.provinces[0];
    setProvince(firstProv.name);
    setDistrict(firstProv.districts[0]);
  };

  const handleProvinceChange = (provName: string) => {
    setProvince(provName);
    const prov =
      currentDept.provinces.find((p) => p.name === provName) ||
      currentDept.provinces[0];
    setDistrict(prov.districts[0]);
  };

  const shippingCost = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0;
    if (cartSubtotal >= settings.freeShippingThreshold) return 0;
    return currentDept.isLimaMetro
      ? settings.limaShippingCost
      : settings.provinceShippingCost;
  }, [deliveryMethod, cartSubtotal, settings, currentDept]);

  const finalTotal = Math.max(0, cartSubtotal - cartDiscount + shippingCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!/^\d{8}$/.test(dni.trim())) {
      setErrorMsg('Ingresa un DNI válido de 8 dígitos.');
      return;
    }
    if (!/^9\d{8}$/.test(phone.trim())) {
      setErrorMsg('Ingresa un celular peruano válido de 9 dígitos (inicia con 9).');
      return;
    }
    if (deliveryMethod === 'delivery' && !street.trim()) {
      setErrorMsg('Ingresa tu dirección exacta de entrega.');
      return;
    }

    const order = createOrder({
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dni: dni.trim(),
        phone: phone.trim(),
        email: email.trim(),
      },
      deliveryMethod,
      address:
        deliveryMethod === 'delivery'
          ? {
              department,
              province,
              district,
              street: street.trim(),
              reference: reference.trim(),
            }
          : undefined,
      paymentMethod,
      paymentReference: paymentReference.trim() || undefined,
      items: cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        image: c.image,
        color: c.color.name,
        size: c.size,
        quantity: c.quantity,
        unitPrice: c.price,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: shippingCost,
      total: finalTotal,
      couponCode: appliedCoupon?.code,
    });

    setConfirmedOrder(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (confirmedOrder) {
    return (
      <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
        <SeoHead
          title={`Pedido Confirmado ${confirmedOrder.id} | BEACH POLO`}
          description="Resumen de tu pedido en BEACH POLO Perú."
          canonicalPath="/checkout"
        />
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-black/8 space-y-6">
            <div className="flex items-center gap-3 text-[#0E5A78]">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Pedido registrado
                </p>
                <h1 className="font-display font-extrabold text-2xl text-[#0B0D0F]">
                  Orden {confirmedOrder.id}
                </h1>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] text-sm space-y-1.5">
              <p>
                <strong>Estado actual:</strong> {confirmedOrder.status}
              </p>
              <p>
                <strong>Cliente:</strong> {confirmedOrder.customer.firstName}{' '}
                {confirmedOrder.customer.lastName} (DNI {confirmedOrder.customer.dni})
              </p>
              <p>
                <strong>Método de pago:</strong> {confirmedOrder.paymentMethod}
              </p>
              <p>
                <strong>Entrega:</strong>{' '}
                {confirmedOrder.deliveryMethod === 'pickup'
                  ? `Recojo en Showroom (${settings.showroomAddress})`
                  : `${confirmedOrder.address?.street}, ${confirmedOrder.address?.district} - ${confirmedOrder.address?.department}`}
              </p>
            </div>

            <div className="divide-y divide-black/8 border-t border-b border-black/8">
              {confirmedOrder.items.map((item, i) => (
                <div key={i} className="py-3 flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.name} ({item.color} · {item.size})
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatPEN(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg tabular-nums">
              <span>Total pagado</span>
              <span>{formatPEN(confirmedOrder.total)}</span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/orders"
                className="px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78] transition-colors"
              >
                Seguir mis pedidos
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3 border border-black/15 text-xs font-semibold rounded-md hover:border-[#0B0D0F]"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
      <SeoHead
        title="Finalizar Compra | BEACH POLO Perú"
        description="Checkout seguro para Perú con Yape, Plin, Tarjeta y Transferencia."
        canonicalPath="/checkout"
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
            Finalizar Compra
          </h1>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#082B3A]">
            <Lock className="w-3.5 h-3.5 text-[#0E5A78]" />
            <span>Checkout cifrado SSL</span>
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center space-y-4 border border-black/8">
            <p className="font-display font-bold text-xl">No tienes artículos en tu bolsa</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Volver a la tienda
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Datos Personales Perú */}
              <section className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <h2 className="font-display font-bold text-lg">1. Datos del cliente</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">DNI (8 dígitos) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej. 72849103"
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Celular (Perú) *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9XXXXXXXX"
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78] tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Entrega */}
              <section className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <h2 className="font-display font-bold text-lg">2. Método de entrega</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                      deliveryMethod === 'delivery'
                        ? 'border-[#0E5A78] bg-[#0E5A78]/5'
                        : 'border-black/15'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#0E5A78] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Envío a domicilio</p>
                      <p className="text-xs text-[#0B0D0F]/60 mt-0.5">
                        Lima y todo el Perú (Gratis desde S/ {settings.freeShippingThreshold})
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                      deliveryMethod === 'pickup'
                        ? 'border-[#0E5A78] bg-[#0E5A78]/5'
                        : 'border-black/15'
                    }`}
                  >
                    <Store className="w-5 h-5 text-[#0E5A78] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Recojo en Showroom</p>
                      <p className="text-xs text-[#0B0D0F]/60 mt-0.5">
                        Miraflores · Gratis en 24h
                      </p>
                    </div>
                  </button>
                </div>

                {deliveryMethod === 'delivery' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Departamento</label>
                      <select
                        value={department}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-md bg-white"
                      >
                        {PERU_UBIGEO.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Provincia</label>
                      <select
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-md bg-white"
                      >
                        {currentDept.provinces.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Distrito</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-md bg-white"
                      >
                        {currentProv.districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium mb-1">Dirección exacta *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Av. / Calle / Mz / Lote / Dpto"
                        className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium mb-1">Referencia</label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. Edificio gris frente al parque, dejar en recepción"
                        className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#FAF7F2] text-xs text-[#082B3A]">
                    Podrás recoger tu pedido en <strong>{settings.showroomAddress}</strong> de lunes a sábado (10:00 a.m. – 8:00 p.m.) presentando tu DNI.
                  </div>
                )}
              </section>

              {/* 3. Pago */}
              <section className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <h2 className="font-display font-bold text-lg">3. Método de pago</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'] as PaymentMethod[]).map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-3 px-3 rounded-lg border text-xs font-bold tracking-wider transition-colors ${
                          paymentMethod === method
                            ? 'bg-[#0B0D0F] text-white border-[#0B0D0F]'
                            : 'bg-[#FAF7F2] text-[#0B0D0F] border-black/10 hover:border-black/30'
                        }`}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>

                {paymentMethod === 'TARJETA' ? (
                  <div className="p-4 rounded-lg bg-[#FAF7F2] space-y-2 text-xs text-[#082B3A]">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-[#0E5A78]" />
                      <span>Pasarela segura preparada para Culqi / Mercado Pago / Stripe</span>
                    </div>
                    <p className="text-[#0B0D0F]/70">
                      Por seguridad PCI-DSS, los datos sensibles de tarjetas nunca se almacenan en nuestros servidores y se tokenizan directamente con el procesador certificado.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#FAF7F2] space-y-3 text-xs text-[#082B3A]">
                    <p>
                      {paymentMethod === 'YAPE' || paymentMethod === 'PLIN'
                        ? `Al confirmar, recibirás el código QR oficial de BEACH POLO para pagar ${formatPEN(finalTotal)} vía ${paymentMethod} y verificar tu pedido al instante.`
                        : `Realiza tu transferencia BCP / Interbank CCI por ${formatPEN(finalTotal)} y registra el número de operación para validación rápida.`}
                    </p>
                    <div>
                      <label className="block font-medium mb-1">
                        Código de operación (opcional si pagas al confirmar)
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Ej. OP-482910"
                        className="w-full px-3 py-2 bg-white border border-black/15 rounded-md outline-none"
                      />
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <p role="alert" className="text-xs font-semibold text-red-600">
                    {errorMsg}
                  </p>
                )}
              </section>
            </div>

            {/* Order Summary */}
            <aside className="lg:col-span-5 bg-white rounded-xl p-6 border border-black/8 space-y-5 lg:sticky lg:top-28">
              <h2 className="font-display font-bold text-lg">Resumen ({cart.length})</h2>
              <ul className="divide-y divide-black/8 max-h-72 overflow-y-auto">
                {cart.map((item) => (
                  <li
                    key={`${item.productId}-${item.color.name}-${item.size}`}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="w-14 h-16 rounded bg-[#FAF7F2] overflow-hidden shrink-0">
                      <ResilientImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-[#0B0D0F]/55">
                        {item.color.name} · {item.size} · Cant. {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums">
                      {formatPEN(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm border-t border-black/8 pt-4">
                <div className="flex justify-between text-[#0B0D0F]/70">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPEN(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-[#0E5A78]">
                    <span>Descuento ({appliedCoupon?.code})</span>
                    <span className="tabular-nums">− {formatPEN(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#0B0D0F]/70">
                  <span>Envío ({deliveryMethod === 'pickup' ? 'Recojo' : department})</span>
                  <span className="tabular-nums">
                    {shippingCost === 0 ? 'Gratis' : formatPEN(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-black/8">
                  <span>Total a pagar</span>
                  <span className="tabular-nums">{formatPEN(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] transition-colors"
              >
                Confirmar Pedido · {formatPEN(finalTotal)}
              </button>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
