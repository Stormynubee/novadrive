import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'assets');
const svg = readFileSync(join(dir, 'banner.svg'), 'utf8');
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } });
writeFileSync(join(dir, 'banner.png'), resvg.render().asPng());
console.log('wrote banner.png');
