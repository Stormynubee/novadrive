import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'assets');

function renderSvgToPng(svgName, pngName) {
  const svg = readFileSync(join(dir, svgName), 'utf8');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } });
  writeFileSync(join(dir, pngName), resvg.render().asPng());
  console.log(`wrote ${pngName}`);
}

renderSvgToPng('banner.svg', 'banner.png');
renderSvgToPng('banner-light.svg', 'banner-light.png');
