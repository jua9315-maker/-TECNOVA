import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { MobileCompanionScanner } from './components/MobileCompanionScanner';
import './index.css';

const isElectronRuntime =
  typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);

if (!isElectronRuntime) {
  registerSW({ immediate: true });
}

const isMobileCompanionMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mobile-scanner') === '1';

createRoot(document.getElementById('root')!).render(
  isMobileCompanionMode ? <MobileCompanionScanner /> : <App />
);
