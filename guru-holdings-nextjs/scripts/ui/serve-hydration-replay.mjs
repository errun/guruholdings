import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const bundled = require('next/dist/compiled/webpack/webpack');
bundled.init();
const out = path.resolve('.next/cache/hydration-replay');
await mkdir(out, { recursive: true });
await new Promise((resolve, reject) => bundled.webpack({
  mode: 'production', target: 'web',
  entry: path.resolve('scripts/ui/hydration-replay-client.js'),
  output: { path: out, filename: 'fixture.js' },
  resolve: { alias: { 'react$': require.resolve('next/dist/compiled/react'),
    'react-dom/client$': require.resolve('next/dist/compiled/react-dom/client') } },
  optimization: { minimize: false },
}, (error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve()));
const script = await readFile(path.join(out, 'fixture.js'));
createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (request.url === '/fixture.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(script); return; }
  const boundary = new URL(request.url, 'http://localhost').searchParams.get('boundary') === '1';
  const section = '<section id="research-ready">Research content</section>';
  const content = boundary ? '<!--$-->' + section + '<!--/$-->' : section;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end('<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"><div id="shell"><header>Header</header><main>' + content + '</main><footer>Footer</footer></div></div><script defer src="/fixture.js"></script></body></html>');
}).listen(3192, '127.0.0.1', () => console.log(JSON.stringify({ fixture: 'hydration-replay', port: 3192,
  react: require('next/dist/compiled/react').version, productionRoutesAdded: false })));
