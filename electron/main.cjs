const { app, BrowserWindow, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const APP_PORT = 41731;
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

let server = null;
let mainWindow = null;

function resolveAssetPath(requestUrl) {
  const cleanUrl = (requestUrl || '/').split('?')[0].split('#')[0];
  let decoded = '/';
  try {
    decoded = decodeURIComponent(cleanUrl);
  } catch {
    decoded = '/';
  }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = path.resolve(DIST_DIR, relative);

  if (!candidate.startsWith(DIST_DIR)) {
    return path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  return path.join(DIST_DIR, 'index.html');
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const httpServer = http.createServer((req, res) => {
      const filePath = resolveAssetPath(req.url);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Archivo no encontrado');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
        });
        res.end(content);
      });
    });

    httpServer.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        httpServer.listen(0, '127.0.0.1', () => {
          const address = httpServer.address();
          resolve({ server: httpServer, port: address.port });
        });
        return;
      }
      reject(err);
    });

    httpServer.listen(APP_PORT, '127.0.0.1', () => {
      const address = httpServer.address();
      resolve({ server: httpServer, port: address.port });
    });
  });
}

function createMainWindow(port) {
  const iconPath = path.join(DIST_DIR, 'pwa-512x512.png');

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: 'NexoCell Studio',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    backgroundColor: '#f8fafc',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('blob:') || url.startsWith('data:')) {
      return { action: 'allow' };
    }
    if (url.startsWith('https://') || url.startsWith('http://')) {
      void shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  void mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      const started = await startStaticServer();
      server = started.server;
      createMainWindow(started.port);
    } catch (err) {
      console.error('Error al iniciar NexoCell Studio:', err);
      app.quit();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    if (server) {
      server.close();
      server = null;
    }
  });
}
