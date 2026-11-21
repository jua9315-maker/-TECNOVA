import React from 'react';
import {
  Code2,
  Image as ImageIcon,
  Monitor,
  MonitorDown,
  Palette,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sliders,
} from 'lucide-react';
import type {
  AppAppearanceSettings,
  DeveloperSystemSettings,
  InstalledAppSettings,
  LoginPresentationSettings,
  PosSettings,
  ReceiptSettings,
  UserProfile,
  VisualCustomizationSettings,
  WarrantySheetSettings,
} from '../types/store';
import { AppAppearanceConfigView } from './AppAppearanceConfigView';
import { CatalogSettingsView } from './CatalogSettingsView';
import { DeveloperModeConfigView } from './DeveloperModeConfigView';
import { InstalledAppConfigView } from './InstalledAppConfigView';
import { PosConfigView } from './PosConfigView';
import { PresentationConfigView } from './PresentationConfigView';
import { ReceiptConfigView } from './ReceiptConfigView';
import { WarrantySheetConfigView } from './WarrantySheetConfigView';

export type SettingsSection =
  | 'app'
  | 'installed'
  | 'presentation'
  | 'receipt'
  | 'warranty'
  | 'catalog'
  | 'pos'
  | 'developer';

export function SettingsWorkspaceView({
  appSettings,
  receiptSettings,
  loginSettings,
  installedSettings,
  developerSettings,
  posSettings,
  warrantySettings,
  visualCustomization,
  developerProfile,
  section,
  onChangeSection,
  onOpenVisualEditor,
  onSeedCatalog,
}: {
  appSettings: AppAppearanceSettings;
  receiptSettings: ReceiptSettings;
  loginSettings: LoginPresentationSettings;
  installedSettings: InstalledAppSettings;
  developerSettings: DeveloperSystemSettings;
  posSettings: PosSettings;
  warrantySettings: WarrantySheetSettings;
  visualCustomization: VisualCustomizationSettings;
  developerProfile: UserProfile | null;
  section: SettingsSection;
  onChangeSection: (next: SettingsSection) => void;
  onOpenVisualEditor?: () => void;
  onSeedCatalog?: () => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-700" />
              <h1 className="text-xl font-semibold text-slate-900">
                Configuración del Sistema
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Personaliza la apariencia, nombre y logo del programa instalado, pantalla de inicio, comprobantes y reglas de Modo Desarrollador.
            </p>
          </div>

          {onOpenVisualEditor && (
            <button
              type="button"
              onClick={onOpenVisualEditor}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-cyan-300 hover:bg-slate-900 border border-cyan-500/40 shadow-xs transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              Abrir Editor Visual Sin Código
            </button>
          )}
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => onChangeSection('app')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'app'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Aplicación y Colores
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('installed')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'installed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MonitorDown className="w-3.5 h-3.5" />
            Programa Instalado
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('presentation')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'presentation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Presentación de Inicio
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('receipt')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'receipt'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Comprobante de Ventas
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('warranty')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'warranty'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Hoja de Garantía
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('catalog')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'catalog'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Catálogo e Imágenes
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('pos')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'pos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Punto de Venta
          </button>
          <button
            type="button"
            onClick={() => onChangeSection('developer')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'developer'
                ? 'bg-slate-950 text-cyan-300 shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Modo Desarrollador
          </button>
        </div>
      </div>

      {section === 'app' && (
        <AppAppearanceConfigView
          settings={appSettings}
          receiptSettings={receiptSettings}
          loginSettings={loginSettings}
        />
      )}

      {section === 'installed' && (
        <InstalledAppConfigView
          settings={installedSettings}
          appAppearance={appSettings}
          loginSettings={loginSettings}
          receiptSettings={receiptSettings}
        />
      )}

      {section === 'presentation' && (
        <PresentationConfigView
          settings={loginSettings}
          receiptSettings={receiptSettings}
        />
      )}

      {section === 'receipt' && (
        <ReceiptConfigView settings={receiptSettings} />
      )}

      {section === 'warranty' && (
        <WarrantySheetConfigView
          settings={warrantySettings}
          receiptSettings={receiptSettings}
        />
      )}

      {section === 'catalog' && (
        <CatalogSettingsView developerSettings={developerSettings} />
      )}

      {section === 'pos' && <PosConfigView settings={posSettings} />}

      {section === 'developer' && (
        <DeveloperModeConfigView
          developerProfile={developerProfile}
          developerSettings={developerSettings}
          visualCustomization={visualCustomization}
          appSettings={appSettings}
          installedSettings={installedSettings}
          onChangeSection={onChangeSection}
          onOpenVisualEditor={onOpenVisualEditor}
          onSeedCatalog={onSeedCatalog}
        />
      )}
    </div>
  );
}
