export interface StoreTimestamp {
  toDate(): Date;
  toMillis(): number;
}

export const STORE_ID = 'nexocell-main' as const;
export const BOOTSTRAP_ADMIN_EMAIL = 'jua9315@gmail.com';
export const BOOTSTRAP_ADMIN_USERNAME = 'admin';
export const INTERNAL_AUTH_DOMAIN = 'nexocell.local' as const;
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
export const DEFAULT_LOCAL_ADMIN = {
  username: 'admin',
  password: 'admin123',
  displayName: 'Administrador Principal',
} as const;
export const DEFAULT_LOCAL_DEVELOPER = {
  username: 'desarrollador',
  password: 'dev@2026',
  displayName: 'Desarrollador del Sistema',
} as const;

export const PRODUCT_CATEGORIES = [
  'Smartphones',
  'Accesorios',
  'Cargadores y Cables',
  'Audio',
  'Pantallas y Repuestos',
  'Protección',
] as const;

export type ProductCategory = string;

export const PRODUCT_CONDITIONS = ['Nuevo', 'Seminuevo', 'Repuesto'] as const;
export type ProductCondition = string;

export const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Mixto'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const WARRANTY_STATUSES = ['Vigente', 'En Revisión', 'Reclamada', 'Vencida'] as const;
export type WarrantyStatus = (typeof WARRANTY_STATUSES)[number];

export const REPAIR_STATUSES = [
  'Recibido',
  'En Diagnóstico',
  'Esperando Repuesto',
  'En Reparación',
  'Listo para Entrega',
  'Entregado',
  'Cancelado',
] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export type UserRole = 'admin' | 'staff' | 'developer';

export type NavTab =
  | 'dashboard'
  | 'inventory'
  | 'pos'
  | 'sales'
  | 'warranties'
  | 'repairs'
  | 'reports'
  | 'team'
  | 'settings';

export const MENU_PERMISSION_OPTIONS: {
  id: NavTab;
  label: string;
  description: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Panel Principal',
    description: 'Resumen operativo y accesos rápidos',
  },
  {
    id: 'inventory',
    label: 'Inventario y QR',
    description: 'Consultar, editar y subir productos',
  },
  {
    id: 'pos',
    label: 'Punto de Venta',
    description: 'Cobrar ventas, descuentos y tickets',
  },
  {
    id: 'sales',
    label: 'Ventas Realizadas',
    description: 'Consultar historial de ventas y eliminar registros',
  },
  {
    id: 'warranties',
    label: 'Garantías',
    description: 'Validar y registrar garantías IMEI',
  },
  {
    id: 'repairs',
    label: 'Reparaciones',
    description: 'Órdenes técnicas y diagnósticos',
  },
  {
    id: 'reports',
    label: 'Reportes Diarios',
    description: 'Ver cortes diarios y exportar CSV',
  },
  {
    id: 'team',
    label: 'Equipo y Roles',
    description: 'Crear usuarios y respaldos locales',
  },
  {
    id: 'settings',
    label: 'Opciones',
    description: 'Inicio, apariencia y comprobante (solo Desarrollador)',
  },
];

export const DEFAULT_DEVELOPER_MENU_TABS: NavTab[] = [
  'dashboard',
  'inventory',
  'pos',
  'sales',
  'warranties',
  'repairs',
  'reports',
  'team',
  'settings',
];

export const DEFAULT_ADMIN_MENU_TABS: NavTab[] = [
  'dashboard',
  'inventory',
  'pos',
  'sales',
  'warranties',
  'repairs',
  'reports',
  'team',
];

export const DEFAULT_STAFF_MENU_TABS: NavTab[] = [
  'dashboard',
  'inventory',
  'pos',
  'sales',
  'warranties',
  'repairs',
  'reports',
];

export function resolveUserAllowedTabs(
  role: UserRole,
  allowedTabs?: NavTab[],
  username?: string
): NavTab[] {
  const validIds = new Set<NavTab>(MENU_PERMISSION_OPTIONS.map((o) => o.id));
  const fallback =
    role === 'developer'
      ? DEFAULT_DEVELOPER_MENU_TABS
      : role === 'admin'
        ? DEFAULT_ADMIN_MENU_TABS
        : DEFAULT_STAFF_MENU_TABS;

  const base =
    Array.isArray(allowedTabs) && allowedTabs.length > 0
      ? MENU_PERMISSION_OPTIONS.map((o) => o.id).filter(
          (id) => validIds.has(id) && allowedTabs.includes(id)
        )
      : [...fallback];

  if (base.length === 0) {
    base.push(...fallback);
  }

  // Solo el rol Desarrollador puede ver y acceder a Opciones ('settings')
  const filtered =
    role === 'developer'
      ? base
      : base.filter((tab) => tab !== 'settings');

  if (filtered.length === 0) {
    filtered.push(...fallback);
  }

  if (role === 'developer') {
    if (!filtered.includes('sales')) filtered.push('sales');
    if (!filtered.includes('settings')) filtered.push('settings');
  }

  if (username && username.toLowerCase() === BOOTSTRAP_ADMIN_USERNAME) {
    for (const req of ['dashboard', 'sales', 'team'] as NavTab[]) {
      if (!filtered.includes(req)) filtered.push(req);
    }
  }

  return filtered;
}

// Validation constants synchronized with firebase-blueprint.json & firestore.rules
export const BLUEPRINT_LIMITS = {
  idRegex: /^[a-zA-Z0-9_-]+$/,
  dateKeyRegex: /^\d{4}-\d{2}-\d{2}$/,
  skuMax: 40,
  barcodeMax: 64,
  qrMax: 128,
  nameMax: 120,
  brandMax: 60,
  modelMax: 80,
  storageMax: 32,
  colorMax: 40,
  supplierMax: 80,
  locationMax: 60,
  descriptionMax: 500,
  imageUrlMax: 250000,
  customerNameMax: 100,
  customerPhoneMax: 32,
  imeiMax: 40,
  notesMax: 500,
  partsUsedMax: 300,
  maxSaleItems: 30,
  maxHistoryLog: 30,
} as const;

export interface UserProfile {
  id: string;
  uid: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  allowedTabs?: NavTab[];
  active: boolean;
  storeId: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export interface TeamMember {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  role: UserRole;
  allowedTabs?: NavTab[];
  active: boolean;
  storeId: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  qrCodeData: string;
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  condition: ProductCondition;
  storage: string;
  color: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  warrantyMonths: number;
  imeiRequired: boolean;
  supplier: string;
  location: string;
  description: string;
  imageUrl: string;
  active: boolean;
  storeId: string;
  updatedBy: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export interface SaleLineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  imei: string;
  warrantyMonths: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  dateKey: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  items: SaleLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  profit: number;
  sellerUid: string;
  sellerName: string;
  status: 'Completada' | 'Anulada';
  storeId: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export interface Warranty {
  id: string;
  warrantyCode: string;
  saleId: string;
  productId: string;
  productName: string;
  imei: string;
  customerName: string;
  customerPhone: string;
  purchaseDate: string;
  expiresDate: string;
  warrantyMonths: number;
  status: WarrantyStatus;
  notes: string;
  createdBy: string;
  storeId: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export interface RepairTicket {
  id: string;
  ticketCode: string;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string;
  issueDescription: string;
  diagnosis: string;
  partsUsed: string;
  estimatedCost: number;
  finalCost: number;
  warrantyCovered: boolean;
  warrantyId: string;
  status: RepairStatus;
  technicianUid: string;
  technicianName: string;
  historyLog: string[];
  storeId: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export interface DailyReport {
  id: string;
  dateKey: string;
  totalSalesCount: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  repairsRevenue: number;
  cashTotal: number;
  cardTotal: number;
  transferTotal: number;
  topProduct: string;
  generatedByUid: string;
  generatedByName: string;
  status: 'Abierto' | 'Cerrado';
  notes: string;
  storeId: string;
  createdAt?: StoreTimestamp | null;
  updatedAt?: StoreTimestamp | null;
}

export type ReceiptPaperWidth = '80mm' | '58mm' | 'A4';

export interface ReceiptSettings {
  businessName: string;
  tagline: string;
  taxId: string;
  phone: string;
  address: string;
  logoDataUrl: string;
  showLogo: boolean;
  paperWidth: ReceiptPaperWidth;
  showQrCode: boolean;
  showImei: boolean;
  showSeller: boolean;
  showWarrantyNote: boolean;
  footerMessage: string;
  updatedAtMs?: number;
}

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  businessName: 'NexoCell Studio',
  tagline: 'Venta de Celulares, Accesorios y Servicio Técnico',
  taxId: '',
  phone: '+52 55 0000 0000',
  address: 'Sucursal Principal · Mostrador',
  logoDataUrl: '',
  showLogo: true,
  paperWidth: '80mm',
  showQrCode: true,
  showImei: true,
  showSeller: true,
  showWarrantyNote: true,
  footerMessage:
    '¡Gracias por su compra! Conserve este comprobante para hacer válida su garantía.',
};

export type LoginFontStyle = 'modern' | 'geometric' | 'editorial' | 'technical';
export type LoginHeadlineSize = 'compact' | 'normal' | 'large';
export type LoginLogoSize = 'sm' | 'md' | 'lg';

export interface LoginPresentationSettings {
  brandName: string;
  showBrandName: boolean;
  logoDataUrl: string;
  showLogo: boolean;
  logoSize: LoginLogoSize;
  headline: string;
  subtitle: string;
  buttonLabel: string;
  fontStyle: LoginFontStyle;
  headlineSize: LoginHeadlineSize;
  textColor: string;
  accentColor: string;
  panelBgColor: string;
  heroImageUrl: string;
  showHeroImage: boolean;
  heroCaption: string;
  updatedAtMs?: number;
}

export const LOGIN_HERO_PRESETS: { id: string; label: string; url: string }[] = [
  {
    id: 'showcase',
    label: 'Mostrador Principal',
    url: '/src/assets/images/store_hero_showcase_1795020480393.jpg',
  },
  {
    id: 'flagship',
    label: 'Smartphones Pro',
    url: '/src/assets/images/phone_flagship_pro_1795020479508.jpg',
  },
  {
    id: 'accessories',
    label: 'Accesorios y Audio',
    url: '/src/assets/images/phone_accessories_bundle_1795020479568.jpg',
  },
  {
    id: 'workshop',
    label: 'Taller Técnico',
    url: '/src/assets/images/phone_repair_workbench_1795020480890.jpg',
  },
];

export const DEFAULT_LOGIN_PRESENTATION_SETTINGS: LoginPresentationSettings = {
  brandName: 'NexoCell Studio',
  showBrandName: true,
  logoDataUrl: '',
  showLogo: true,
  logoSize: 'md',
  headline: 'Control local para tu tienda de celulares.',
  subtitle:
    'Todos tus productos, ventas, descuentos, garantías y reparaciones se guardan directamente en tu computadora de forma privada y sin depender de internet.',
  buttonLabel: 'Entrar al sistema',
  fontStyle: 'modern',
  headlineSize: 'normal',
  textColor: '#0f172a',
  accentColor: '#0f172a',
  panelBgColor: '#ffffff',
  heroImageUrl: '/src/assets/images/store_hero_showcase_1795020480393.jpg',
  showHeroImage: true,
  heroCaption: '',
};

export function getLoginFontFamilyCss(fontStyle: LoginFontStyle): string {
  switch (fontStyle) {
    case 'geometric':
      return 'var(--font-geometric)';
    case 'editorial':
      return 'var(--font-serif-display)';
    case 'technical':
      return 'var(--font-mono)';
    case 'modern':
    default:
      return 'var(--font-sans)';
  }
}

export function isHexColorDark(hex: string): boolean {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.52;
}

export function darkenHexColor(hex: string, amount = 0.16): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return hex;
  const r = Math.max(0, Math.round(parseInt(clean.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(clean.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(clean.slice(4, 6), 16) * (1 - amount)));
  if ([r, g, b].some((n) => Number.isNaN(n))) return hex;
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

export function mixHexWithWhite(hex: string, whiteRatio = 0.9): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return '#eff6ff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return '#eff6ff';
  const mr = Math.round(r * (1 - whiteRatio) + 255 * whiteRatio);
  const mg = Math.round(g * (1 - whiteRatio) + 255 * whiteRatio);
  const mb = Math.round(b * (1 - whiteRatio) + 255 * whiteRatio);
  return `#${[mr, mg, mb].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

export type AppCurrencyCode =
  | 'USD'
  | 'MXN'
  | 'GTQ'
  | 'HNL'
  | 'NIO'
  | 'CRC'
  | 'PAB'
  | 'DOP'
  | 'COP'
  | 'VES'
  | 'PEN'
  | 'BOB'
  | 'PYG'
  | 'UYU'
  | 'ARS'
  | 'CLP'
  | 'BRL'
  | 'CAD'
  | 'EUR'
  | 'GBP'
  | 'CHF';

export interface AppCurrencyOption {
  code: AppCurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const APP_CURRENCY_OPTIONS: AppCurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'Dólar Estadounidense (USD $)', locale: 'en-US' },
  { code: 'MXN', symbol: '$', label: 'Peso Mexicano (MXN $)', locale: 'es-MX' },
  { code: 'GTQ', symbol: 'Q', label: 'Quetzal Guatemalteco (GTQ Q)', locale: 'es-GT' },
  { code: 'HNL', symbol: 'L', label: 'Lempira Hondureño (HNL L)', locale: 'es-HN' },
  { code: 'NIO', symbol: 'C$', label: 'Córdoba Nicaragüense (NIO C$)', locale: 'es-NI' },
  { code: 'CRC', symbol: '₡', label: 'Colón Costarricense (CRC ₡)', locale: 'es-CR' },
  { code: 'PAB', symbol: 'B/.', label: 'Balboa Panameño (PAB B/.)', locale: 'es-PA' },
  { code: 'DOP', symbol: 'RD$', label: 'Peso Dominicano (DOP RD$)', locale: 'es-DO' },
  { code: 'COP', symbol: '$', label: 'Peso Colombiano (COP $)', locale: 'es-CO' },
  { code: 'VES', symbol: 'Bs.', label: 'Bolívar Venezolano (VES Bs.)', locale: 'es-VE' },
  { code: 'PEN', symbol: 'S/', label: 'Sol Peruano (PEN S/)', locale: 'es-PE' },
  { code: 'BOB', symbol: 'Bs', label: 'Boliviano (BOB Bs)', locale: 'es-BO' },
  { code: 'PYG', symbol: '₲', label: 'Guaraní Paraguayo (PYG ₲)', locale: 'es-PY' },
  { code: 'UYU', symbol: '$U', label: 'Peso Uruguayo (UYU $U)', locale: 'es-UY' },
  { code: 'ARS', symbol: '$', label: 'Peso Argentino (ARS $)', locale: 'es-AR' },
  { code: 'CLP', symbol: '$', label: 'Peso Chileno (CLP $)', locale: 'es-CL' },
  { code: 'BRL', symbol: 'R$', label: 'Real Brasileño (BRL R$)', locale: 'pt-BR' },
  { code: 'CAD', symbol: 'CA$', label: 'Dólar Canadiense (CAD CA$)', locale: 'en-CA' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR €)', locale: 'es-ES' },
  { code: 'GBP', symbol: '£', label: 'Libra Esterlina (GBP £)', locale: 'en-GB' },
  { code: 'CHF', symbol: 'CHF', label: 'Franco Suizo (CHF)', locale: 'de-CH' },
];

export function getCurrencyOption(code?: AppCurrencyCode | string): AppCurrencyOption {
  return (
    APP_CURRENCY_OPTIONS.find((c) => c.code === code) ||
    APP_CURRENCY_OPTIONS[0]
  );
}

export interface AppAppearanceSettings {
  appName: string;
  shortName: string;
  logoDataUrl: string;
  showLogoInSidebar: boolean;
  fontStyle: LoginFontStyle;
  accentColor: string;
  primaryColor: string;
  sidebarBgColor: string;
  headerBgColor: string;
  canvasBgColor: string;
  currencyCode: AppCurrencyCode;
  updatedAtMs?: number;
}

export const DEFAULT_APP_APPEARANCE_SETTINGS: AppAppearanceSettings = {
  appName: 'NexoCell Studio',
  shortName: 'NexoCell',
  logoDataUrl: '',
  showLogoInSidebar: true,
  fontStyle: 'modern',
  accentColor: '#1d4ed8',
  primaryColor: '#0f172a',
  sidebarBgColor: '#ffffff',
  headerBgColor: '#ffffff',
  canvasBgColor: '#f8fafc',
  currencyCode: 'USD',
};

export interface VisualElementPatch {
  id: string;
  scope: string;
  selector: string;
  label?: string;
  customText?: string;
  offsetX?: number;
  offsetY?: number;
  orderOffset?: number;
  fontSizePx?: number;
  textColor?: string;
  bgColor?: string;
  hidden?: boolean;
}

export interface VisualCustomizationSettings {
  patches: Record<string, VisualElementPatch>;
  navOrder: NavTab[];
  navLabels: Partial<Record<NavTab, string>>;
  updatedAtMs?: number;
}

export const DEFAULT_VISUAL_CUSTOMIZATION_SETTINGS: VisualCustomizationSettings = {
  patches: {},
  navOrder: [
    'dashboard',
    'inventory',
    'pos',
    'sales',
    'warranties',
    'repairs',
    'reports',
    'team',
    'settings',
  ],
  navLabels: {},
};

export type InstalledDisplayMode = 'standalone' | 'minimal-ui' | 'fullscreen';

export interface InstalledAppSettings {
  installedName: string;
  installedShortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: InstalledDisplayMode;
  logoDataUrl: string;
  iconBgColor: string;
  iconPaddingPercent: number;
  icon192DataUrl: string;
  icon512DataUrl: string;
  iconMaskable512DataUrl: string;
  appleTouchIcon180DataUrl: string;
  updatedAtMs?: number;
}

export const DEFAULT_INSTALLED_APP_SETTINGS: InstalledAppSettings = {
  installedName: 'NexoCell Studio Escritorio',
  installedShortName: 'NexoCell',
  description:
    'Sistema de escritorio sin conexión para inventario móvil QR, punto de venta, garantías, reparaciones y reportes diarios.',
  themeColor: '#0f172a',
  backgroundColor: '#f8fafc',
  displayMode: 'standalone',
  logoDataUrl: '',
  iconBgColor: '#0f172a',
  iconPaddingPercent: 12,
  icon192DataUrl: '',
  icon512DataUrl: '',
  iconMaskable512DataUrl: '',
  appleTouchIcon180DataUrl: '',
};

export interface CatalogImagePreset {
  id: string;
  label: string;
  url: string;
}

export const DEFAULT_CATALOG_IMAGE_PRESETS: CatalogImagePreset[] = [
  {
    id: 'preset_flagship',
    label: 'Smartphone Titanio',
    url: '/src/assets/images/phone_flagship_pro_1795020479508.jpg',
  },
  {
    id: 'preset_accessories',
    label: 'Accesorios y Carga',
    url: '/src/assets/images/phone_accessories_bundle_1795020479568.jpg',
  },
  {
    id: 'preset_repairs',
    label: 'Repuestos y Pantallas',
    url: '/src/assets/images/phone_repair_workbench_1795020480890.jpg',
  },
];

export interface DeveloperSystemSettings {
  defaultStoreBranch: string;
  qrCodePrefix: string;
  defaultPhoneWarrantyMonths: number;
  defaultAccessoryWarrantyMonths: number;
  lowStockDefaultMin: number;
  maxPosDiscountPercent: number;
  allowNegativeStockSale: boolean;
  requireAdminToReopenCash: boolean;
  autoOpenWarrantyOnPhoneSale: boolean;
  showDevRoleSwitcher: boolean;
  showOfflineBanner: boolean;
  catalogImagePresets?: CatalogImagePreset[];
  productConditions?: string[];
  updatedAtMs?: number;
}

export const DEFAULT_DEVELOPER_SYSTEM_SETTINGS: DeveloperSystemSettings = {
  defaultStoreBranch: 'Sucursal Principal · Mostrador',
  qrCodePrefix: 'NEXOCELL',
  defaultPhoneWarrantyMonths: 12,
  defaultAccessoryWarrantyMonths: 3,
  lowStockDefaultMin: 2,
  maxPosDiscountPercent: 100,
  allowNegativeStockSale: false,
  requireAdminToReopenCash: true,
  autoOpenWarrantyOnPhoneSale: true,
  showDevRoleSwitcher: true,
  showOfflineBanner: true,
  catalogImagePresets: DEFAULT_CATALOG_IMAGE_PRESETS,
  productConditions: [...PRODUCT_CONDITIONS],
};

export type PosCardSize = 'xs' | 'sm' | 'md' | 'lg';
export type PosGridColumns = 'auto' | 2 | 3 | 4 | 5;
export type PosImageFit = 'cover' | 'contain';
export type PosCartPosition = 'right' | 'left';
export type PosCatalogWidth = 'balanced' | 'wide';

export interface PosSettings {
  productCardSize: PosCardSize;
  gridColumnsDesktop: PosGridColumns;
  showProductImages: boolean;
  customImageHeightPx: number;
  imageFitMode: PosImageFit;
  showCategoryBadge: boolean;
  showSkuCode: boolean;
  showBrandModel: boolean;
  showStockBadge: boolean;
  showCartQtyBadge: boolean;
  hideOutOfStock: boolean;
  cartPosition: PosCartPosition;
  catalogWidthRatio: PosCatalogWidth;
  showHeaderBanner: boolean;
  showCategoryTabs: boolean;
  showQuickPayButtons: boolean;
  allowDiscountPanel: boolean;
  requireCustomerInfo: boolean;
  clearSearchAfterAdd: boolean;
  autoPrintReceiptOnSale: boolean;
  playSoundFeedback: boolean;
  defaultPaymentMethod: PaymentMethod;
  defaultCustomerName: string;
  posTitle: string;
  cartSectionTitle: string;
  checkoutButtonLabel: string;
  updatedAtMs?: number;
}

export const DEFAULT_POS_SETTINGS: PosSettings = {
  productCardSize: 'sm',
  gridColumnsDesktop: 'auto',
  showProductImages: true,
  customImageHeightPx: 0,
  imageFitMode: 'cover',
  showCategoryBadge: true,
  showSkuCode: true,
  showBrandModel: false,
  showStockBadge: true,
  showCartQtyBadge: true,
  hideOutOfStock: false,
  cartPosition: 'right',
  catalogWidthRatio: 'balanced',
  showHeaderBanner: true,
  showCategoryTabs: true,
  showQuickPayButtons: false,
  allowDiscountPanel: true,
  requireCustomerInfo: false,
  clearSearchAfterAdd: false,
  autoPrintReceiptOnSale: false,
  playSoundFeedback: false,
  defaultPaymentMethod: 'Efectivo',
  defaultCustomerName: 'Cliente Mostrador',
  posTitle: 'Punto de Venta y Facturación',
  cartSectionTitle: 'Área de Ventas',
  checkoutButtonLabel: 'Cobrar y Emitir Garantías',
};

export function sanitizeCode(value: string, maxLen: number): string {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
  return cleaned.slice(0, maxLen) || 'CODE-001';
}

export function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addMonthsToDateKey(dateKey: string, months: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1 + months, d);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

let activeCurrencyCode: AppCurrencyCode = 'USD';
let activeCurrencyLocale = 'en-US';

export function setActiveAppCurrency(code: AppCurrencyCode): void {
  const found = getCurrencyOption(code);
  activeCurrencyCode = found.code;
  activeCurrencyLocale = found.locale;
}

export function getActiveAppCurrencyOption(): AppCurrencyOption {
  return getCurrencyOption(activeCurrencyCode);
}

export function formatCurrency(
  amount: number,
  overrideCode?: AppCurrencyCode
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const opt = overrideCode
    ? getCurrencyOption(overrideCode)
    : { code: activeCurrencyCode, locale: activeCurrencyLocale, symbol: '$' };
  try {
    return new Intl.NumberFormat(opt.locale, {
      style: 'currency',
      currency: opt.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${opt.code} ${safeAmount.toFixed(2)}`;
  }
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, '');
}

export function isValidUsername(value: string): boolean {
  const clean = normalizeUsername(value);
  return clean.length >= 3 && clean.length <= 40 && USERNAME_REGEX.test(clean);
}

export function usernameToInternalEmail(username: string): string {
  return `${normalizeUsername(username)}@${INTERNAL_AUTH_DOMAIN}`;
}

export function deriveUsernameFromEmail(email?: string | null): string {
  const raw = (email || '').split('@')[0] || 'usuario';
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .slice(0, 40);
  if (cleaned.length >= 3) return cleaned;
  return `${cleaned}_user`.slice(0, 40);
}
