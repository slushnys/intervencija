import { createReadStream, statSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8765);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const requested = decoded === '/' ? '/index.html' : decoded;
  const candidate = resolve(root, `.${normalize(requested)}`);
  if (candidate !== root.slice(0, -1) && !candidate.startsWith(root.split(sep).join(sep))) return null;
  return candidate;
}

const server = createServer((req, res) => {
  const candidate = safePath(req.url || '/');
  let file = candidate;
  let statusCode = 200;

  if (!file || !existsSync(file)) {
    file = join(root, '404.html');
    statusCode = 404;
  }

  try {
    const meta = statSync(file);
    if (meta.isDirectory()) {
      const directoryIndex = join(file, 'index.html');
      if (existsSync(directoryIndex)) {
        file = directoryIndex;
      } else {
        file = join(root, '404.html');
        statusCode = 404;
      }
    }
  } catch {
    file = join(root, '404.html');
    statusCode = 404;
  }

  const ext = extname(file).toLowerCase();

  res.writeHead(statusCode, {
    'Content-Type': types[ext] || 'application/octet-stream',
    // This is the local preview server. Always reflect the latest source edits.
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'X-Frame-Options': 'SAMEORIGIN'
  });

  createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Intervencija static server: http://${host}:${port}/`);
});
