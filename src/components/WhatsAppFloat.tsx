import { useState } from 'react';
import { MessageCircle, Send, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export function WhatsAppFloat() {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    'Hola BEACH POLO, necesito ayuda para elegir mi talla.'
  );

  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const hasConfiguredNumber = cleanPhone.length >= 9;

  const handleOpenWhatsApp = () => {
    if (hasConfiguredNumber) {
      const url = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`}?text=${encodeURIComponent(
        message
      )}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 bg-white text-[#0B0D0F] rounded-xl shadow-2xl border border-black/10 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-bold text-sm">Atención BEACH POLO</p>
              <p className="text-xs text-[#0B0D0F]/60">
                Asesoría de tallas y pedidos en Perú
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente de WhatsApp"
              className="p-1 rounded hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs border border-black/15 rounded-md p-2.5 outline-none focus:border-[#0E5A78]"
          />

          {hasConfiguredNumber ? (
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 px-4 bg-[#0E5A78] text-white text-xs font-semibold rounded-md hover:bg-[#082B3A] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir chat en WhatsApp</span>
            </button>
          ) : (
            <div className="p-2.5 rounded-md bg-[#FAF7F2] text-xs text-[#082B3A] space-y-2">
              <p>
                Número comercial de WhatsApp Business pendiente de configurar para producción.
              </p>
              <Link
                to="/admin?tab=settings"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 font-semibold text-[#0E5A78] hover:underline"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurar en Panel Admin</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => (hasConfiguredNumber ? setOpen((v) => !v) : setOpen((v) => !v))}
        aria-label="¿Necesitas ayuda? WhatsApp"
        className="h-11 px-4 rounded-full bg-[#082B3A] text-white shadow-lg hover:bg-[#0E5A78] transition-colors inline-flex items-center gap-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B89B5E]"
      >
        <MessageCircle className="w-4 h-4 text-[#E8D8BD]" />
        <span className="hidden sm:inline whitespace-nowrap">¿Necesitas ayuda?</span>
      </button>
    </div>
  );
}
