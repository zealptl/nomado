import express from 'express';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const app = express();
app.use(express.json());

const apiDir = join(__dirname, 'api');

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full));
    } else if (entry.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

function fileToRoute(file: string): string {
  let rel = relative(apiDir, file)
    .replace(/\.ts$/, '')
    .replace(/(\/|^)index$/, '')
    .replace(/\[([^\]]+)\]/g, ':$1')
    .replace(/\\/g, '/');
  return '/api' + (rel ? '/' + rel : '');
}

// Sort: more segments first, then fewer dynamic segments, then alphabetical.
// This ensures /api/trips/shared beats /api/trips/:id, and reorder beats :itemId.
function routePriority(route: string): [number, number, string] {
  const segments = route.split('/').filter(Boolean);
  const dynamic = segments.filter(s => s.startsWith(':')).length;
  return [-segments.length, dynamic, route];
}

const routes = collectFiles(apiDir)
  .map(file => ({ file, route: fileToRoute(file) }))
  .sort((a, b) => {
    const [aL, aD, aR] = routePriority(a.route);
    const [bL, bD, bR] = routePriority(b.route);
    return aL !== bL ? aL - bL : aD !== bD ? aD - bD : aR.localeCompare(bR);
  });

for (const { file, route } of routes) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const handler = require(file).default;
  app.all(route as string, handler);
  console.log(`  registered: ${route}`);
}

app.listen(3001, () => {
  console.log('\nBackend running on http://localhost:3001\n');
});
