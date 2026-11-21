import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileCheck2, Printer, Receipt, ShieldCheck, X } from 'lucide-react';
import {
  formatCurrency,
  type Product,
  type ReceiptSettings,
  type Sale,
  type Warranty,
} from '../types/store';
import { QrCodeImg } from './BarcodeQrToolkit';

export function WarrantySheetDocument({
  warranty,
  sale,
  product,
  settings,
  isLast = true,
}: {
  warranty: Warranty;
  sale?: Sale | null;
  product?: Product | null;
  settings: ReceiptSettings;
  isLast?: boolean;
}) {
  const matchedSaleItem = sale?.items.find(
    (item) =>
      item.productId === warranty.productId ||
      (warranty.imei && warranty.imei !== 'N/A' && item.imei === warranty.imei)
  );

  return (
    <article
      className={`w-full max-w-[740px] mx-auto bg-white text-slate-900 border border-slate-200 rounded-xl p-7 sm:p-9 shadow-xs print:border-0 print:shadow-none print:rounded-none print:p-6 ${
        !isLast ? 'print:break-after-page mb-6 print:mb-0' : ''
      }`}
    >
      {/* Encabezado Oficial de la Tienda */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-slate-900">
        <div className="flex items-start gap-3.5">
          {settings.showLogo && settings.logoDataUrl && (
            <img
              src={settings.logoDataUrl}
              alt={`Logo de ${settings.businessName}`}
              className="h-14 w-auto max-w-[140px] object-contain shrink-0"
            />
          )}
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {settings.businessName}
            </h1>
            {settings.tagline && (
              <p className="text-xs text-slate-600">{settings.tagline}</p>
            )}
            <div className="text-[11px] text-slate-500 space-x-2">
              {settings.address && <span>{settings.address}</span>}
              {settings.phone && <span>· Tel: {settings.phone}</span>}
              {settings.taxId && <span>· ID: {settings.taxId}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:text-right shrink-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              Póliza Oficial
            </p>
            <p className="text-base font-bold text-slate-900 tracking-tight">
              HOJA DE GARANTÍA
            </p>
            <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
              {warranty.warrantyCode}
            </p>
          </div>
          <QrCodeImg value={warranty.warrantyCode} size={74} />
        </div>
      </header>

      {/* Datos del Cliente y Vigencia */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Datos del Cliente y Venta
          </h2>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Cliente:</dt>
              <dd className="font-semibold text-slate-900 text-right">
                {warranty.customerName}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Teléfono:</dt>
              <dd className="font-mono text-slate-800 text-right">
                {warranty.customerPhone}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Folio de Venta:</dt>
              <dd className="font-mono font-medium text-slate-900 text-right">
                {sale?.saleNumber || warranty.saleId}
              </dd>
            </div>
            {sale?.sellerName && (
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Atendido por:</dt>
                <dd className="text-slate-800 text-right">{sale.sellerName}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Cobertura y Vigencia
          </h2>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Fecha de Compra:</dt>
              <dd className="font-mono tabular-nums font-medium text-slate-900">
                {warranty.purchaseDate}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Vencimiento:</dt>
              <dd className="font-mono tabular-nums font-bold text-slate-900">
                {warranty.expiresDate}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Duración:</dt>
              <dd className="font-mono tabular-nums font-semibold text-blue-700">
                {warranty.warrantyMonths}{' '}
                {warranty.warrantyMonths === 1 ? 'mes' : 'meses'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Estado Actual:</dt>
              <dd className="font-semibold text-emerald-700">{warranty.status}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Especificaciones del Teléfono / Dispositivo */}
      <section className="py-5 border-b border-slate-200 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Equipo Cubierto por Esta Garantía
        </h2>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3.5 font-semibold">Equipo / Modelo</th>
                <th className="py-2.5 px-3.5 font-semibold">IMEI / Número de Serie</th>
                <th className="py-2.5 px-3.5 font-semibold">Especificaciones</th>
                {matchedSaleItem && (
                  <th className="py-2.5 px-3.5 font-semibold text-right">Valor</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-3.5 font-semibold text-slate-900">
                  {warranty.productName}
                  {product?.brand && (
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      {product.brand} {product.model} · {product.condition}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                  {warranty.imei || 'N/A'}
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  {product
                    ? [
                        product.storage && product.storage !== '-'
                          ? `Capacidad: ${product.storage}`
                          : null,
                        product.color && product.color !== '-'
                          ? `Color: ${product.color}`
                          : null,
                        `SKU: ${product.sku}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    : matchedSaleItem
                      ? `SKU: ${matchedSaleItem.sku}`
                      : 'Verificado en mostrador'}
                </td>
                {matchedSaleItem && (
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(matchedSaleItem.unitPrice)}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Condiciones de la Garantía */}
      <section className="py-5 border-b border-slate-200 space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Términos y Condiciones de Cobertura
        </h2>
        <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
          <li>
            Esta garantía cubre exclusivamente fallas o defectos de fabricación en hardware y funcionamiento interno durante{' '}
            <strong className="text-slate-900">{warranty.warrantyMonths} meses</strong> a partir de la fecha de compra ({warranty.purchaseDate} al {warranty.expiresDate}).
          </li>
          <li>
            Para hacer válida la garantía es obligatorio presentar esta{' '}
            <strong className="text-slate-900">Hoja de Garantía</strong> junto con el comprobante de compra y verificar que el número de{' '}
            <strong className="text-slate-900">IMEI / Serie</strong> coincida con el dispositivo.
          </li>
          <li>
            La garantía queda anulada automáticamente si el equipo presenta rastros de humedad o líquidos, golpes, pantalla estrellada, chasis doblado, sobrecarga eléctrica, manipulación por servicio técnico externo o sellos de seguridad removidos.
          </li>
          <li>
            Los accesorios incluidos (cables, adaptadores, audífonos o fundas) y las baterías están sujetos a desgaste normal y revisión previa en banco técnico.
          </li>
        </ol>

        {warranty.notes && (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <strong className="text-slate-800">Observaciones:</strong> {warranty.notes}
          </div>
        )}
      </section>

      {/* Firmas */}
      <footer className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-600">
        <div className="space-y-1.5">
          <div className="border-t border-slate-400 pt-2 font-medium text-slate-800">
            Firma del Cliente ({warranty.customerName})
          </div>
          <p className="text-[10px] text-slate-500">
            Recibí equipo en buen estado y acepto términos de garantía
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="border-t border-slate-400 pt-2 font-medium text-slate-800">
            Sello y Firma Autorizada · {settings.businessName}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Validación: {warranty.warrantyCode}
          </p>
        </div>
      </footer>
    </article>
  );
}

export function WarrantySheetModal({
  warranties,
  sale,
  products = [],
  settings,
  onClose,
  onOpenReceipt,
}: {
  warranties: Warranty[];
  sale?: Sale | null;
  products?: Product[];
  settings: ReceiptSettings;
  onClose: () => void;
  onOpenReceipt?: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | 'all'>(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [warranties]);

  useEffect(() => {
    const cleanup = () => {
      document.body.classList.remove('printing-receipt');
    };
    window.addEventListener('afterprint', cleanup);
    return () => {
      window.removeEventListener('afterprint', cleanup);
      cleanup();
    };
  }, []);

  if (!warranties || warranties.length === 0) return null;

  const handlePrint = () => {
    document.body.classList.add('printing-receipt');
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove('printing-receipt');
      }, 300);
    }, 50);
  };

  const visibleWarranties =
    selectedIndex === 'all'
      ? warranties
      : [warranties[Math.min(selectedIndex, warranties.length - 1)]];

  return createPortal(
    <div
      id="receipt-print-portal"
      className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Hoja de Garantía"
    >
      <div className="bg-slate-100 border border-slate-200 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] print:border-0 print:shadow-none print:bg-white print:max-h-none">
        {/* Barra superior de acciones (oculta al imprimir) */}
        <div className="no-print bg-white px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">
                Hoja de Garantía Generada
              </h2>
              <p className="text-[11px] text-slate-500">
                {warranties.length === 1
                  ? `Folio ${warranties[0].warrantyCode}`
                  : `${warranties.length} hojas de garantía emitidas en esta venta`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {warranties.length > 1 && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {warranties.map((w, idx) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedIndex === idx
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Equipo {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedIndex('all')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedIndex === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas
                </button>
              </div>
            )}

            {onOpenReceipt && (
              <button
                type="button"
                onClick={onOpenReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                Ver Comprobante
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Hoja de Garantía
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              aria-label="Cerrar hoja de garantía"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Documento de Garantía */}
        <div className="p-5 sm:p-7 overflow-y-auto print:p-0 print:overflow-visible">
          {visibleWarranties.map((w, idx) => {
            const matchedProduct = products.find((p) => p.id === w.productId) || null;
            return (
              <WarrantySheetDocument
                key={w.id}
                warranty={w}
                sale={sale}
                product={matchedProduct}
                settings={settings}
                isLast={idx === visibleWarranties.length - 1}
              />
            );
          })}
        </div>

        {/* Pie informativo (oculto al imprimir) */}
        <div className="no-print px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            Certificado guardado automáticamente en el módulo de Garantías
          </span>
          <span>Formato Carta / A4 listo para imprimir o guardar en PDF</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
