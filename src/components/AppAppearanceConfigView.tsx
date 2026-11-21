import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Coins,
  ImagePlus,
  LayoutDashboard,
  Package,
  Palette,
  QrCode,
  RotateCcw,
  Save,
  ShoppingCart,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import {
  APP_CURRENCY_OPTIONS,
  DEFAULT_APP_APPEARANCE_SETTINGS,
  formatCurrency,
  getLoginFontFamilyCss,
  isHexColorDark,
  type AppAppearanceSettings,
  type AppCurrencyCode,
  type LoginFontStyle,
  type LoginPresentationSettings,
  type ReceiptSettings,
} from '../types/store';
import { saveStoreAppAppearanceSettings } from '../lib/storeOperations';

const THEME_PRESETS: {
  id: string;
  label: string;
  patch: Partial<AppAppearanceSettings>;
}[] = [
  {
    id: 'classic',
    label: 'Estudio Clásico',
    patch: {
      accentColor: '#1d4ed8',
      primaryColor: '#0f172a',
      sidebarBgColor: '#ffffff',
      headerBgColor: '#ffffff',
      canvasBgColor: '#f8fafc',
    },
  },
  {
    id: 'dark-sidebar',
    label: 'Barra Oscura Pro',
    patch: {
      accentColor: '#2563eb',
      primaryColor: '#2563eb',
      sidebarBgColor: '#0f172a',
      headerBgColor: '#ffffff',
      canvasBgColor: '#f8fafc',
    },
  },
  {
    id: 'emerald',
    label: 'Esmeralda Retail',
    patch: {
      accentColor: '#047857',
      primaryColor: '#064e3b',
      sidebarBgColor: '#ffffff',
      headerBgColor: '#ffffff',
      canvasBgColor: '#f8fafc',
    },
  },
  {
    id: 'navy',
    label: 'Azul Ejecutivo',
    patch: {
      accentColor: '#1d4ed8',
      primaryColor: '#1e3a8a',
      sidebarBgColor: '#172554',
      headerBgColor: '#ffffff',
      canvasBgColor: '#f1f5f9',
    },
  },
  {
    id: 'amber',
    label: 'Ámbar Taller',
    patch: {
      accentColor: '#b45309',
      primaryColor: '#78350f',
      sidebarBgColor: '#ffffff',
      headerBgColor: '#ffffff',
      canvasBgColor: '#fafaf9',
    },
  },
  {
    id: 'crimson',
    label: 'Carmín Moderno',
    patch: {
      accentColor: '#be123c',
      primaryColor: '#1e293b',
      sidebarBgColor: '#1e293b',
      headerBgColor: '#ffffff',
      canvasBgColor: '#f8fafc',
    },
  },
];

const FONT_OPTIONS: {
  id: LoginFontStyle;
  label: string;
  sample: string;
  css: string;
}[] = [
  { id: 'modern', label: 'Moderna Sans', sample: 'Aa Bb 123', css: 'var(--font-sans)' },
  { id: 'geometric', label: 'Geométrica', sample: 'Aa Bb 123', css: 'var(--font-geometric)' },
  { id: 'editorial', label: 'Editorial Clásica', sample: 'Aa Bb 123', css: 'var(--font-serif-display)' },
  { id: 'technical', label: 'Técnica Mono', sample: 'Aa Bb 123', css: 'var(--font-mono)' },
];

const ACCENT_SWATCHES = ['#1d4ed8', '#047857', '#b45309', '#be123c', '#6d28d9', '#0f172a'];
const PRIMARY_SWATCHES = ['#0f172a', '#1e3a8a', '#064e3b', '#78350f', '#4c1d95', '#881337'];
const SIDEBAR_SWATCHES = ['#ffffff', '#f8fafc', '#0f172a', '#1e293b', '#172554'];
const HEADER_SWATCHES = ['#ffffff', '#f8fafc', '#f1f5f9', '#0f172a'];
const CANVAS_SWATCHES = ['#f8fafc', '#f1f5f9', '#fafaf9', '#f0fdf4', '#eff6ff'];

function readLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selecciona una imagen válida (PNG, JPG, WEBP o SVG).'));
      return;
    }
    if (file.type === 'image/svg+xml') {
      if (file.size > 150 * 1024) {
        reject(new Error('El SVG supera los 150 KB permitidos.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('No se pudo leer el archivo SVG.'));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo SVG.'));
      reader.readAsDataURL(file);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 240;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas no disponible.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        reject(new Error('No se pudo procesar la imagen del logo.'));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen.'));
    };
    img.src = objectUrl;
  });
}

function ColorSwatchField({
  label,
  value,
  swatches,
  onChange,
}: {
  label: string;
  value: string;
  swatches: string[];
  onChange: (hex: string) => void;
}) {
  return (
    <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-white">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-700 truncate">
          {label}
        </span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded border border-slate-200 cursor-pointer shrink-0"
          aria-label={label}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {swatches.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            style={{ backgroundColor: hex }}
            className={`w-5 h-5 rounded-full border ${
              value.toLowerCase() === hex.toLowerCase()
                ? 'ring-2 ring-blue-600 ring-offset-1 border-slate-400'
                : 'border-slate-300'
            }`}
            title={hex}
          />
        ))}
      </div>
    </div>
  );
}

export function AppAppearanceConfigView({
  settings,
  receiptSettings,
  loginSettings,
}: {
  settings: AppAppearanceSettings;
  receiptSettings: ReceiptSettings;
  loginSettings: LoginPresentationSettings;
}) {
  const [draft, setDraft] = useState<AppAppearanceSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const updateDraft = (patch: Partial<AppAppearanceSettings>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSavedNotice(false);
    setLogoError(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await readLogoFile(file);
      updateDraft({ logoDataUrl: dataUrl, showLogoInSidebar: true });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Error al subir el logo.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await saveStoreAppAppearanceSettings(draft);
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_APP_APPEARANCE_SETTINGS });
    setSavedNotice(false);
    setLogoError(null);
  };

  const previewSidebarDark = isHexColorDark(draft.sidebarBgColor);
  const previewHeaderDark = isHexColorDark(draft.headerBgColor);
  const previewPrimaryDark = isHexColorDark(draft.primaryColor);
  const previewAccentDark = isHexColorDark(draft.accentColor);
  const previewFontCss = getLoginFontFamilyCss(draft.fontStyle);

  const previewCurrencyLabel = formatCurrency(1249.5, draft.currencyCode);

  const availableOtherLogo =
    loginSettings.logoDataUrl || receiptSettings.logoDataUrl || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Configuración general guardada. El nombre, colores, tipografía y moneda ya están aplicados en toda la aplicación.
          </span>
        </div>
      )}

      {logoError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700">
          {logoError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={(e) => void handleSave(e)}
          className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6"
        >
          {/* Section 1: App Name & Logo */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Nombre de la Aplicación y Logo Lateral
              </h2>
              {availableOtherLogo && (
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({
                      logoDataUrl: availableOtherLogo,
                      showLogoInSidebar: true,
                    })
                  }
                  className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
                >
                  Copiar logo guardado
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre completo de la aplicación
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={draft.appName}
                  onChange={(e) => updateDraft({ appName: e.target.value })}
                  placeholder="Ej: NexoCell Studio"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre corto (barra superior y pestaña)
                </label>
                <input
                  type="text"
                  required
                  maxLength={24}
                  value={draft.shortName}
                  onChange={(e) => updateDraft({ shortName: e.target.value })}
                  placeholder="Ej: NexoCell"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {draft.logoDataUrl ? (
                    <img
                      src={draft.logoDataUrl}
                      alt="Logo de la aplicación"
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  ) : (
                    <ImagePlus className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Ícono / logo en menú lateral
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Aparece junto al nombre en el menú izquierdo del sistema.
                  </p>
                  {draft.logoDataUrl && (
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.showLogoInSidebar}
                        onChange={(e) =>
                          updateDraft({ showLogoInSidebar: e.target.checked })
                        }
                        className="rounded border-slate-300"
                      />
                      <span>Mostrar logo en menú</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => void handleLogoUpload(e)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {draft.logoDataUrl ? 'Cambiar' : 'Subir logo'}
                </button>
                {draft.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => updateDraft({ logoDataUrl: '' })}
                    className="inline-flex items-center px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                    title="Quitar logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Quick Themes & Global Colors */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-700" />
              Temas Rápidos y Colores de Toda la App
            </h2>

            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">
                Combinaciones listas en un clic
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const active =
                    draft.accentColor.toLowerCase() ===
                      preset.patch.accentColor?.toLowerCase() &&
                    draft.sidebarBgColor.toLowerCase() ===
                      preset.patch.sidebarBgColor?.toLowerCase() &&
                    draft.primaryColor.toLowerCase() ===
                      preset.patch.primaryColor?.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateDraft(preset.patch)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors ${
                        active
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: preset.patch.sidebarBgColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: preset.patch.primaryColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: preset.patch.accentColor }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ColorSwatchField
                label="Color de acento"
                value={draft.accentColor}
                swatches={ACCENT_SWATCHES}
                onChange={(hex) => updateDraft({ accentColor: hex })}
              />
              <ColorSwatchField
                label="Menú activo / principal"
                value={draft.primaryColor}
                swatches={PRIMARY_SWATCHES}
                onChange={(hex) => updateDraft({ primaryColor: hex })}
              />
              <ColorSwatchField
                label="Fondo barra lateral"
                value={draft.sidebarBgColor}
                swatches={SIDEBAR_SWATCHES}
                onChange={(hex) => updateDraft({ sidebarBgColor: hex })}
              />
              <ColorSwatchField
                label="Fondo barra superior"
                value={draft.headerBgColor}
                swatches={HEADER_SWATCHES}
                onChange={(hex) => updateDraft({ headerBgColor: hex })}
              />
              <ColorSwatchField
                label="Fondo área de trabajo"
                value={draft.canvasBgColor}
                swatches={CANVAS_SWATCHES}
                onChange={(hex) => updateDraft({ canvasBgColor: hex })}
              />
            </div>
          </div>

          {/* Section 3: Typography & Currency */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-700" />
              Letra Global y Formato de Moneda
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_OPTIONS.map((font) => {
                const selected = draft.fontStyle === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateDraft({ fontStyle: font.id })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <p
                      className="text-base font-bold leading-tight"
                      style={{ fontFamily: font.css }}
                    >
                      {font.sample}
                    </p>
                    <p
                      className={`text-[11px] mt-1 truncate ${
                        selected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {font.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="max-w-sm">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
                <Coins className="w-3.5 h-3.5 text-slate-500" />
                Moneda del sistema (POS, Inventario, Reportes y Tickets)
              </label>
              <select
                value={draft.currencyCode}
                onChange={(e) =>
                  updateDraft({ currencyCode: e.target.value as AppCurrencyCode })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
              >
                {APP_CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Ejemplo de formato:{' '}
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {previewCurrencyLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Original
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Apariencia'}
            </button>
          </div>
        </form>

        {/* Live Desktop Shell Preview */}
        <div className="xl:col-span-5 bg-slate-100 border border-slate-200 rounded-xl p-5 space-y-3 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              Vista Previa General de la Aplicación
            </p>
            <span className="text-[11px] font-mono text-slate-500">
              {draft.currencyCode}
            </span>
          </div>

          <div
            className="border border-slate-300 rounded-xl overflow-hidden shadow-xs grid grid-cols-12 min-h-[340px]"
            style={{
              backgroundColor: draft.canvasBgColor,
              fontFamily: previewFontCss,
            }}
          >
            {/* Mini Sidebar */}
            <div
              className={`col-span-4 p-3 border-r flex flex-col justify-between ${
                previewSidebarDark ? 'border-slate-700/60' : 'border-slate-200'
              }`}
              style={{ backgroundColor: draft.sidebarBgColor }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-400/20 min-w-0">
                  {draft.showLogoInSidebar && draft.logoDataUrl && (
                    <img
                      src={draft.logoDataUrl}
                      alt={draft.appName}
                      className="h-5 w-auto object-contain shrink-0"
                    />
                  )}
                  <span
                    className="text-xs font-bold truncate"
                    style={{
                      color: previewSidebarDark ? '#f8fafc' : '#0f172a',
                    }}
                  >
                    {draft.appName || 'NexoCell Studio'}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium"
                    style={{
                      backgroundColor: draft.primaryColor,
                      color: previewPrimaryDark ? '#ffffff' : '#0f172a',
                    }}
                  >
                    <LayoutDashboard className="w-3 h-3 shrink-0" />
                    <span className="truncate">Panel</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
                    style={{
                      color: previewSidebarDark ? '#cbd5e1' : '#475569',
                    }}
                  >
                    <Package className="w-3 h-3 shrink-0" />
                    <span className="truncate">Inventario</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
                    style={{
                      color: previewSidebarDark ? '#cbd5e1' : '#475569',
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 shrink-0" />
                    <span className="truncate">Ventas</span>
                  </div>
                </div>
              </div>

              <p
                className="text-[10px] truncate pt-2 border-t border-slate-400/20"
                style={{
                  color: previewSidebarDark ? '#94a3b8' : '#64748b',
                }}
              >
                @admin · Administrador
              </p>
            </div>

            {/* Mini Main Content */}
            <div className="col-span-8 flex flex-col">
              {/* Mini Topbar */}
              <div
                className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 ${
                  previewHeaderDark ? 'border-slate-700/60' : 'border-slate-200'
                }`}
                style={{ backgroundColor: draft.headerBgColor }}
              >
                <span
                  className="text-[11px] font-medium truncate"
                  style={{
                    color: previewHeaderDark ? '#f8fafc' : '#0f172a',
                  }}
                >
                  <span className="opacity-55">{draft.shortName || 'NexoCell'}</span> / Panel
                </span>

                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium shrink-0"
                  style={{
                    backgroundColor: draft.accentColor,
                    color: previewAccentDark ? '#ffffff' : '#0f172a',
                  }}
                >
                  <QrCode className="w-3 h-3" />
                  Escanear
                </span>
              </div>

              {/* Mini Cards */}
              <div className="p-3.5 space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500">Ventas Hoy</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1">
                      {previewCurrencyLabel}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500">Catálogo</p>
                    <p
                      className="text-sm font-bold font-mono tabular-nums mt-1"
                      style={{ color: draft.accentColor }}
                    >
                      24 equipos
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-900">
                      Acción rápida de muestra
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: draft.accentColor }}
                    >
                      Ver detalle
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full w-2/3 rounded-full"
                      style={{ backgroundColor: draft.accentColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
