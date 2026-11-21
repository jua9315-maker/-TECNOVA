import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AppWindow,
  CheckCircle2,
  Download,
  ImagePlus,
  Laptop,
  MonitorDown,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  DEFAULT_INSTALLED_APP_SETTINGS,
  isHexColorDark,
  type AppAppearanceSettings,
  type InstalledAppSettings,
  type InstalledDisplayMode,
  type LoginPresentationSettings,
  type ReceiptSettings,
} from '../types/store';
import { saveStoreInstalledAppSettings } from '../lib/storeOperations';
import { PWAInstallButton } from './PWAInstallButton';

const THEME_SWATCHES = ['#0f172a', '#1e3a8a', '#064e3b', '#4c1d95', '#881337', '#ffffff'];
const BG_SWATCHES = ['#f8fafc', '#ffffff', '#0f172a', '#111827', '#eff6ff'];
const ICON_BG_SWATCHES = ['#0f172a', '#1d4ed8', '#047857', '#7c3aed', '#ffffff', 'transparent'];

function readRawImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selecciona una imagen válida (PNG, JPG, WEBP o SVG).'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('El archivo supera los 2 MB permitidos.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('No se pudo leer la imagen.'));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

function renderIconPng(
  img: HTMLImageElement,
  size: number,
  bgColor: string,
  paddingPercent: number,
  forceSolidFill: boolean
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const effectiveBg =
    bgColor === 'transparent' ? (forceSolidFill ? '#0f172a' : '') : bgColor;

  if (effectiveBg) {
    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  const padPx = Math.round((size * Math.max(0, Math.min(30, paddingPercent))) / 100);
  const avail = Math.max(1, size - padPx * 2);
  const scale = Math.min(avail / img.width, avail / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (size - drawW) / 2;
  const dy = (size - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);
  return canvas.toDataURL('image/png');
}

async function generateInstalledIconSet(
  sourceDataUrl: string,
  iconBgColor: string,
  paddingPercent: number
): Promise<{
  icon192DataUrl: string;
  icon512DataUrl: string;
  iconMaskable512DataUrl: string;
  appleTouchIcon180DataUrl: string;
}> {
  if (!sourceDataUrl) {
    return {
      icon192DataUrl: '',
      icon512DataUrl: '',
      iconMaskable512DataUrl: '',
      appleTouchIcon180DataUrl: '',
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maskablePad = Math.max(14, paddingPercent + 4);
        resolve({
          icon192DataUrl: renderIconPng(img, 192, iconBgColor, paddingPercent, false),
          icon512DataUrl: renderIconPng(img, 512, iconBgColor, paddingPercent, false),
          iconMaskable512DataUrl: renderIconPng(img, 512, iconBgColor, maskablePad, true),
          appleTouchIcon180DataUrl: renderIconPng(img, 180, iconBgColor, paddingPercent, true),
        });
      } catch {
        reject(new Error('No se pudieron generar los íconos PNG de instalación.'));
      }
    };
    img.onerror = () => reject(new Error('No se pudo procesar el logo seleccionado.'));
    img.src = sourceDataUrl;
  });
}

export function InstalledAppConfigView({
  settings,
  appAppearance,
  loginSettings,
  receiptSettings,
}: {
  settings: InstalledAppSettings;
  appAppearance: AppAppearanceSettings;
  loginSettings: LoginPresentationSettings;
  receiptSettings: ReceiptSettings;
}) {
  const [draft, setDraft] = useState<InstalledAppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [renderingIcons, setRenderingIcons] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const regenerateIcons = useCallback(
    async (
      logoDataUrl: string,
      iconBgColor: string,
      paddingPercent: number,
      extraPatch?: Partial<InstalledAppSettings>
    ) => {
      setRenderingIcons(true);
      setErrorMsg(null);
      try {
        const iconSet = await generateInstalledIconSet(
          logoDataUrl,
          iconBgColor,
          paddingPercent
        );
        setDraft((prev) => ({
          ...prev,
          ...extraPatch,
          logoDataUrl,
          iconBgColor,
          iconPaddingPercent: paddingPercent,
          ...iconSet,
        }));
        setSavedNotice(false);
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Error al procesar los íconos.'
        );
      } finally {
        setRenderingIcons(false);
      }
    },
    []
  );

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await readRawImageAsDataUrl(file);
      await regenerateIcons(dataUrl, draft.iconBgColor, draft.iconPaddingPercent);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo cargar el logo.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    setErrorMsg(null);
    try {
      await saveStoreInstalledAppSettings(draft);
      setSavedNotice(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo guardar la configuración.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_INSTALLED_APP_SETTINGS });
    setSavedNotice(false);
    setErrorMsg(null);
  };

  const handleDownload512Icon = () => {
    const src = draft.icon512DataUrl || '/pwa-512x512.png';
    const a = document.createElement('a');
    a.href = src;
    a.download = 'icono-programa-512x512.png';
    a.click();
  };

  const handleDownloadManifest = () => {
    const manifestObj = {
      id: '/',
      name: draft.installedName || DEFAULT_INSTALLED_APP_SETTINGS.installedName,
      short_name:
        draft.installedShortName || DEFAULT_INSTALLED_APP_SETTINGS.installedShortName,
      description: draft.description || DEFAULT_INSTALLED_APP_SETTINGS.description,
      theme_color: draft.themeColor || '#0f172a',
      background_color: draft.backgroundColor || '#f8fafc',
      display: draft.displayMode || 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    };
    const blob = new Blob([JSON.stringify(manifestObj, null, 2)], {
      type: 'application/manifest+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.webmanifest';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fallbackSharedLogo =
    appAppearance.logoDataUrl ||
    loginSettings.logoDataUrl ||
    receiptSettings.logoDataUrl ||
    '';

  const previewIconSrc = draft.icon192DataUrl || draft.logoDataUrl || '/pwa-192x192.png';
  const themeBarDark = isHexColorDark(draft.themeColor);
  const shortLen = draft.installedShortName.trim().length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Identidad del programa instalado guardada y aplicada al manifiesto.
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              La pestaña del navegador, barra de ventana y el manifiesto de instalación ya usan el nuevo nombre e ícono. Si ya habías instalado el programa previamente, vuelve a instalarlo desde Chrome/Edge para actualizar el acceso directo del escritorio.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={(e) => void handleSave(e)}
          className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6"
        >
          {/* Section 1: Installed Program Identity */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <MonitorDown className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Nombre y Metadatos del Programa Instalado
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    installedName: appAppearance.appName || prev.installedName,
                    installedShortName: (
                      appAppearance.shortName ||
                      appAppearance.appName ||
                      prev.installedShortName
                    ).slice(0, 12),
                  }))
                }
                className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
              >
                Sincronizar nombre de la app
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre completo al instalar
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={draft.installedName}
                  onChange={(e) => {
                    setDraft((p) => ({ ...p, installedName: e.target.value }));
                    setSavedNotice(false);
                  }}
                  placeholder="Ej: TECNOVA Escritorio"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Se muestra en el instalador, ventana y lista de programas.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Nombre corto (acceso directo)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      shortLen > 12 ? 'text-amber-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {shortLen}/12
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={draft.installedShortName}
                  onChange={(e) => {
                    setDraft((p) => ({ ...p, installedShortName: e.target.value }));
                    setSavedNotice(false);
                  }}
                  placeholder="Ej: TECNOVA"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Recomendado ≤ 12 caracteres para no cortarse en el escritorio.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descripción del programa
              </label>
              <textarea
                rows={2}
                maxLength={180}
                value={draft.description}
                onChange={(e) => {
                  setDraft((p) => ({ ...p, description: e.target.value }));
                  setSavedNotice(false);
                }}
                placeholder="Descripción breve que aparece al instalar la aplicación..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Modo de ventana
                </label>
                <select
                  value={draft.displayMode}
                  onChange={(e) => {
                    setDraft((p) => ({
                      ...p,
                      displayMode: e.target.value as InstalledDisplayMode,
                    }));
                    setSavedNotice(false);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="standalone">App independiente (Sin URL)</option>
                  <option value="minimal-ui">Ventana mínima</option>
                  <option value="fullscreen">Pantalla completa</option>
                </select>
              </div>

              <div className="p-2.5 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    Color de barra
                  </span>
                  <input
                    type="color"
                    value={draft.themeColor}
                    onChange={(e) => {
                      setDraft((p) => ({ ...p, themeColor: e.target.value }));
                      setSavedNotice(false);
                    }}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {THEME_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        setDraft((p) => ({ ...p, themeColor: hex }));
                        setSavedNotice(false);
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-4 h-4 rounded-full border ${
                        draft.themeColor.toLowerCase() === hex.toLowerCase()
                          ? 'ring-2 ring-blue-600 ring-offset-1 border-slate-400'
                          : 'border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-2.5 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    Fondo al abrir
                  </span>
                  <input
                    type="color"
                    value={draft.backgroundColor}
                    onChange={(e) => {
                      setDraft((p) => ({ ...p, backgroundColor: e.target.value }));
                      setSavedNotice(false);
                    }}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {BG_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        setDraft((p) => ({ ...p, backgroundColor: hex }));
                        setSavedNotice(false);
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-4 h-4 rounded-full border ${
                        draft.backgroundColor.toLowerCase() === hex.toLowerCase()
                          ? 'ring-2 ring-blue-600 ring-offset-1 border-slate-400'
                          : 'border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Installed Logo / Icon Studio */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                Logo e Ícono del Programa Instalado (192px y 512px)
              </h2>
              {fallbackSharedLogo && (
                <button
                  type="button"
                  onClick={() =>
                    void regenerateIcons(
                      fallbackSharedLogo,
                      draft.iconBgColor,
                      draft.iconPaddingPercent
                    )
                  }
                  className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
                >
                  Usar logo guardado del sistema
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-16 h-16 rounded-2xl border border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {previewIconSrc ? (
                    <img
                      src={previewIconSrc}
                      alt="Ícono del programa"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    {draft.logoDataUrl
                      ? 'Logo personalizado activo (PNG 192×192, 512×512 y iOS 180×180)'
                      : 'Usando ícono predeterminado de TECNOVA'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Al subir tu logo se generan automáticamente todas las resoluciones requeridas para Windows, macOS, Android y iOS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => void handleUploadLogo(e)}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={renderingIcons}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {renderingIcons
                    ? 'Procesando...'
                    : draft.logoDataUrl
                      ? 'Cambiar logo'
                      : 'Subir logo'}
                </button>
                {draft.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        logoDataUrl: '',
                        icon192DataUrl: '',
                        icon512DataUrl: '',
                        iconMaskable512DataUrl: '',
                        appleTouchIcon180DataUrl: '',
                      }))
                    }
                    className="inline-flex items-center px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Volver al ícono predeterminado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {draft.logoDataUrl && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Fondo del ícono
                    </span>
                    <input
                      type="color"
                      value={
                        draft.iconBgColor === 'transparent'
                          ? '#0f172a'
                          : draft.iconBgColor
                      }
                      onChange={(e) =>
                        void regenerateIcons(
                          draft.logoDataUrl,
                          e.target.value,
                          draft.iconPaddingPercent
                        )
                      }
                      className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ICON_BG_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() =>
                          void regenerateIcons(
                            draft.logoDataUrl,
                            swatch,
                            draft.iconPaddingPercent
                          )
                        }
                        style={
                          swatch === 'transparent'
                            ? {
                                backgroundImage:
                                  'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                                backgroundSize: '8px 8px',
                                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
                              }
                            : { backgroundColor: swatch }
                        }
                        className={`w-6 h-6 rounded-full border cursor-pointer ${
                          draft.iconBgColor.toLowerCase() === swatch.toLowerCase()
                            ? 'ring-2 ring-blue-600 ring-offset-1 border-slate-400'
                            : 'border-slate-300'
                        }`}
                        title={swatch === 'transparent' ? 'Transparente' : swatch}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      Margen / Zona segura
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {draft.iconPaddingPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={draft.iconPaddingPercent}
                    onChange={(e) =>
                      void regenerateIcons(
                        draft.logoDataUrl,
                        draft.iconBgColor,
                        Number(e.target.value)
                      )
                    }
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    10–16% evita recortes en íconos redondeados de Android o macOS.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Original
            </button>

            <button
              type="submit"
              disabled={saving || renderingIcons}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Programa Instalado'}
            </button>
          </div>
        </form>

        {/* Right Column: Realistic Installed Previews + Install Button */}
        <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-24">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-cyan-400" />
                Vista Previa al Instalar el Programa
              </p>
              <span className="text-[11px] font-mono text-cyan-300 uppercase">
                {draft.displayMode}
              </span>
            </div>

            {/* 1. Desktop Window Titlebar Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-700 shadow-md">
              <div
                className="px-3 py-2 flex items-center justify-between gap-2 border-b border-black/15"
                style={{
                  backgroundColor: draft.themeColor || '#0f172a',
                  color: themeBarDark ? '#ffffff' : '#0f172a',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={previewIconSrc}
                    alt="Icono barra"
                    className="w-4 h-4 rounded object-contain shrink-0"
                  />
                  <span className="text-xs font-semibold truncate">
                    {draft.installedName || 'TECNOVA Escritorio'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-60 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-current" />
                  <span className="w-2.5 h-2.5 rounded-full bg-current" />
                  <span className="w-2.5 h-2.5 rounded-full bg-current" />
                </div>
              </div>
              <div
                className="p-4 flex items-center gap-3"
                style={{ backgroundColor: draft.backgroundColor || '#f8fafc' }}
              >
                <img
                  src={previewIconSrc}
                  alt="Splash"
                  className="w-10 h-10 rounded-xl shadow-xs object-contain shrink-0"
                />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isHexColorDark(draft.backgroundColor)
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    {draft.installedName}
                  </p>
                  <p
                    className={`text-[11px] line-clamp-2 mt-0.5 ${
                      isHexColorDark(draft.backgroundColor)
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {draft.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Shortcuts: Desktop Tile + Mobile Maskable Circle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Laptop className="w-3 h-3" />
                  Acceso Escritorio
                </span>
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-white/15 bg-white">
                  <img
                    src={previewIconSrc}
                    alt="Acceso directo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-white truncate max-w-full">
                  {draft.installedShortName || 'TECNOVA'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Smartphone className="w-3 h-3" />
                  Móvil / Adaptable
                </span>
                <div className="w-14 h-14 rounded-full overflow-hidden shadow-md border border-white/20 bg-slate-900">
                  <img
                    src={
                      draft.iconMaskable512DataUrl ||
                      draft.icon512DataUrl ||
                      '/pwa-maskable-512x512.png'
                    }
                    alt="Ícono circular"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-white truncate max-w-full">
                  {draft.installedShortName || 'TECNOVA'}
                </span>
              </div>
            </div>

            {/* Install & Static Export Actions */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <PWAInstallButton variant="full" />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownload512Icon}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-300" />
                  Bajar Ícono 512px
                </button>
                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  Bajar Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
