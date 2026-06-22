import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const apiRoot = path.resolve(serverRoot, '..', 'api');

await esbuild.build({
  entryPoints: [path.join(serverRoot, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: path.join(apiRoot, 'handler.cjs'),
  tsconfig: path.join(serverRoot, 'tsconfig.json'),
  // Prisma 必须在运行时从 node_modules 加载
  external: ['@prisma/client', '.prisma/client'],
  sourcemap: true,
  logLevel: 'info',
});

console.log('Vercel handler bundled -> api/handler.cjs');
