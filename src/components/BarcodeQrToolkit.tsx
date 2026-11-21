import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  Barcode,
  Camera,
  CheckCircle2,
  Download,
  Edit3,
  Keyboard,
  Minus,
  Plus,
  Printer,
  QrCode,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  formatCurrency,
  type Product,
  type RepairTicket,
  type Warranty,
} from '../types/store';

export function BarcodeSvg({
  value,
  height = 44,
  displayValue = true,
}: {
  value: string;
  height?: number;
  displayValue?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        lineColor: '#0f172a',
        background: '#ffffff',
        width: 1.6,
        height,
        displayValue,
        fontSize: 11,
        font: 'JetBrains Mono, monospace',
        margin: 4,
      });
    } catch {
      // Fallback if unsupported characters
    }
  }, [value, height, displayValue]);

  return (
    <svg
      ref={svgRef}
      className="max-w-full h-auto block"
      aria-label={`Código de barras ${value}`}
    />
  );
}

export function QrCodeImg({
  value,
  size = 132,
}: {
  value: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (mounted) setDataUrl(url);
      })
      .catch(() => {
        if (mounted) setDataUrl('');
      });
    return () => {
      mounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400"
      >
        <QrCode className="w-8 h-8" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`Código QR para ${value}`}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className="rounded border border-slate-200 bg-white block"
    />
  );
}

export function ProductLabelModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    QRCode.toDataURL(product.qrCodeData || product.barcode, {
      width: 400,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [product]);

  if (!product) return null;

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `qr-${product.sku}.png`;
    a.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Etiqueta de Código de Barras y QR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lista para impresión térmica o inventario rápido
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Cerrar etiqueta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5 p-5 border border-dashed border-slate-300 rounded-lg bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  {product.brand} · {product.sku}
                </p>
                <h4 className="text-sm font-semibold text-slate-900 mt-1 leading-snug">
                  {product.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {product.storage !== '-' ? `${product.storage} · ` : ''}
                  {product.color} · {product.condition}
                </p>
                <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-3">
                  {formatCurrency(product.salePrice)}
                </p>
              </div>
              <div className="shrink-0">
                <QrCodeImg value={product.qrCodeData || product.barcode} size={96} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
              <BarcodeSvg value={product.barcode} height={46} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 no-print">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar QR
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Etiqueta
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function extractCodeToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  // Parse structured NexoCell QR payload: NEXOCELL:SKU=xxx|BAR=yyy
  if (trimmed.startsWith('NEXOCELL:')) {
    const barMatch = trimmed.match(/BAR=([^|]+)/);
    if (barMatch && barMatch[1]) return barMatch[1].trim();
    const skuMatch = trimmed.match(/SKU=([^|]+)/);
    if (skuMatch && skuMatch[1]) return skuMatch[1].trim();
  }
  return trimmed;
}

export function ScannerModal({
  isOpen,
  onClose,
  products,
  warranties,
  repairs,
  onAdjustStock,
  onOpenEditProduct,
  onCreateNewFromCode,
  onAddToPos,
  onLocateWarranty,
  onLocateRepair,
}: {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  warranties: Warranty[];
  repairs: RepairTicket[];
  onAdjustStock: (product: Product, delta: number) => Promise<void>;
  onOpenEditProduct: (product: Product) => void;
  onCreateNewFromCode: (code: string) => void;
  onAddToPos: (product: Product) => void;
  onLocateWarranty: (warranty: Warranty) => void;
  onLocateRepair: (repair: RepairTicket) => void;
}) {
  const [scanMode, setScanMode] = useState<'keyboard' | 'camera'>('keyboard');
  const [inputCode, setInputCode] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setInputCode('');
      setLastScanned('');
      setCameraError(null);
      setFeedback(null);
      return;
    }
    if (scanMode === 'keyboard') {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, scanMode]);

  useEffect(() => {
    let cancelled = false;
    const stopCamera = async () => {
      if (qrScannerRef.current) {
        try {
          if (qrScannerRef.current.isScanning) {
            await qrScannerRef.current.stop();
          }
          await qrScannerRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
        qrScannerRef.current = null;
      }
      if (!cancelled) setCameraActive(false);
    };

    if (!isOpen || scanMode !== 'camera') {
      void stopCamera();
      return;
    }

    const startCamera = async () => {
      setCameraError(null);
      try {
        const scanner = new Html5Qrcode('nexocell-qr-reader');
        qrScannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 160 } },
          (decodedText) => {
            const token = extractCodeToken(decodedText);
            if (token) {
              setLastScanned(token);
              setInputCode(token);
              setFeedback(`Código detectado: ${token}`);
            }
          },
          () => {
            // ignore frame scan misses
          }
        );
        if (!cancelled) setCameraActive(true);
      } catch (err) {
        if (!cancelled) {
          setCameraError(
            err instanceof Error
              ? 'No se detectó cámara activa o se denegó el permiso. Puedes usar el lector USB o ingreso manual.'
              : 'Cámara no disponible.'
          );
          setCameraActive(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void startCamera();
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      void stopCamera();
    };
  }, [isOpen, scanMode]);

  if (!isOpen) return null;

  const resolvedToken = extractCodeToken(lastScanned || inputCode);
  const matchedProduct = resolvedToken
    ? products.find(
        (p) =>
          p.barcode.toLowerCase() === resolvedToken.toLowerCase() ||
          p.sku.toLowerCase() === resolvedToken.toLowerCase() ||
          p.qrCodeData.toLowerCase() === resolvedToken.toLowerCase()
      )
    : undefined;

  const matchedWarranty =
    !matchedProduct && resolvedToken
      ? warranties.find(
          (w) =>
            w.warrantyCode.toLowerCase() === resolvedToken.toLowerCase() ||
            w.imei.toLowerCase() === resolvedToken.toLowerCase()
        )
      : undefined;

  const matchedRepair =
    !matchedProduct && !matchedWarranty && resolvedToken
      ? repairs.find(
          (r) =>
            r.ticketCode.toLowerCase() === resolvedToken.toLowerCase() ||
            r.imei.toLowerCase() === resolvedToken.toLowerCase()
        )
      : undefined;

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const token = extractCodeToken(inputCode);
    if (!token) return;
    setLastScanned(token);
    setFeedback(null);
  };

  const handleStockQuick = async (delta: number) => {
    if (!matchedProduct || busy) return;
    setBusy(true);
    try {
      await onAdjustStock(matchedProduct, delta);
      setFeedback(
        `Stock actualizado (${delta > 0 ? `+${delta}` : delta}) para ${matchedProduct.name}.`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Escáner de Código de Barras y QR
              </h2>
              <p className="text-xs text-slate-500">
                Actualiza stock en tiempo real, registra productos nuevos o consulta garantías
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Cerrar escáner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setScanMode('keyboard')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scanMode === 'keyboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Lector USB / Manual
            </button>
            <button
              type="button"
              onClick={() => setScanMode('camera')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scanMode === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Cámara en Vivo
            </button>
          </div>

          {scanMode === 'keyboard' ? (
            <form onSubmit={handleSubmitCode} className="space-y-3">
              <label className="block text-xs font-medium text-slate-700">
                Escanea con pistola USB/Bluetooth o escribe el código de barra, SKU, QR o IMEI
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setLastScanned(e.target.value);
                    }}
                    placeholder="Ej: 7501055301501 o IPH-15PRO-256"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Buscar Código
                </button>
              </div>
              {products.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">Prueba rápida:</span>
                  {products.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setInputCode(p.barcode);
                        setLastScanned(p.barcode);
                      }}
                      className="text-xs font-mono text-blue-700 hover:underline"
                    >
                      {p.barcode}
                    </button>
                  ))}
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-950 overflow-hidden min-h-[220px] flex items-center justify-center relative">
                <div id="nexocell-qr-reader" className="w-full" />
                {!cameraActive && !cameraError && (
                  <p className="text-xs text-slate-300 absolute">
                    Iniciando cámara para lectura de barras y QR...
                  </p>
                )}
              </div>
              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {feedback && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}

          {resolvedToken && matchedProduct && (
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-slate-500">
                    {matchedProduct.sku} · Barra: {matchedProduct.barcode}
                  </p>
                  <h4 className="text-base font-semibold text-slate-900 mt-0.5">
                    {matchedProduct.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {matchedProduct.category} · {matchedProduct.location} · Precio:{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(matchedProduct.salePrice)}
                    </span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">Stock Actual</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {matchedProduct.stock}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStockQuick(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  +1 Stock
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStockQuick(5)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  +5 Stock
                </button>
                <button
                  type="button"
                  disabled={busy || matchedProduct.stock <= 0}
                  onClick={() => handleStockQuick(-1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg transition-colors disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5 text-red-600" />
                  -1 Stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditProduct(matchedProduct);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-900 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Ficha
                </button>
                <button
                  type="button"
                  disabled={matchedProduct.stock <= 0}
                  onClick={() => {
                    onAddToPos(matchedProduct);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors ml-auto disabled:opacity-40"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Agregar a Venta
                </button>
              </div>
            </div>
          )}

          {resolvedToken && matchedWarranty && (
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-500">
                  Garantía {matchedWarranty.warrantyCode} · IMEI {matchedWarranty.imei}
                </p>
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                  {matchedWarranty.productName} — {matchedWarranty.customerName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Estado: {matchedWarranty.status} · Vence: {matchedWarranty.expiresDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLocateWarranty(matchedWarranty);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
              >
                Abrir Garantía
              </button>
            </div>
          )}

          {resolvedToken && matchedRepair && (
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-500">
                  Orden Técnica {matchedRepair.ticketCode} · IMEI {matchedRepair.imei}
                </p>
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                  {matchedRepair.deviceBrand} {matchedRepair.deviceModel} —{' '}
                  {matchedRepair.customerName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Estado actual: {matchedRepair.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLocateRepair(matchedRepair);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
              >
                Ver Reparación
              </button>
            </div>
          )}

          {resolvedToken && !matchedProduct && !matchedWarranty && !matchedRepair && (
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-500">Código sin registro</p>
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                  El código <span className="font-mono">{resolvedToken}</span> no existe en el
                  inventario
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Puedes darlo de alta ahora mismo con código de barras y QR generados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateNewFromCode(resolvedToken);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Subir Producto
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
