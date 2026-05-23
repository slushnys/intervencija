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

  if (!file || !existsSync(file)) file = join(root, 'index.html');

  try {
    const meta = statSync(file);
    if (meta.isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(root, 'index.html');
  }

  const ext = extname(file).toLowerCase();
  const isAsset = !['.html', ''].includes(ext);

  res.writeHead(200, {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-store',
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
