import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const logoPath = join(root, "public/images/projects/wai-shield-care/source/wai-shield-logo.png");
const sourceRender = join(root, "public/images/projects/wai-shield-care/source/waishield-dieline-render-144.png");
const outDir = join(root, "public/images/projects/wai-shield-care/mockup-candidates-v3");
const fontDir = "/Users/christopherabarca/Library/Fonts";

const faces = {
  regular: "LDSans-Regular.otf",
  medium: "LDSans-Medium.otf",
  bold: "LDSans-Bold.otf",
  black: "LDSans-Black.otf",
};

for (const path of [sourceRender, logoPath, ...Object.values(faces).map((file) => join(fontDir, file))]) {
  if (!existsSync(path)) throw new Error(`Missing source asset: ${path}`);
}

mkdirSync(outDir, { recursive: true });

const ink = "#142F54";
const deepBlue = "#0B2948";
const aqua = "#9DDDED";
const white = "#FFFFFF";
const gray = "#61707D";

const crops = {
  fullArt: { left: 430, top: 330, width: 4260, height: 3160 },
  printArea: { left: 430, top: 330, width: 4260, height: 2500 },
  leftFront: { left: 430, top: 330, width: 1420, height: 2500 },
  centerInfo: { left: 1848, top: 330, width: 710, height: 2500 },
  rightFront: { left: 2558, top: 330, width: 1420, height: 2500 },
  rightSide: { left: 3978, top: 330, width: 710, height: 2500 },
};

function fontFace(name, file, weight) {
  const data = readFileSync(join(fontDir, file)).toString("base64");
  return `@font-face{font-family:'${name}';src:url(data:font/otf;base64,${data}) format('opentype');font-weight:${weight};font-style:normal;font-display:block;}`;
}

const fontCss = `
${fontFace("LD Regular", faces.regular, 400)}
${fontFace("LD Medium", faces.medium, 500)}
${fontFace("LD Bold", faces.bold, 700)}
${fontFace("LD Black", faces.black, 900)}
`;

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function text({ x, y, value, size = 32, fill = ink, cls = "reg", anchor = "start", tracking = 0, opacity = 1 }) {
  return `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="${anchor}" letter-spacing="${tracking}" opacity="${opacity}">${esc(value)}</text>`;
}

function lines({ x, y, values, size = 28, leading = 38, fill = ink, cls = "reg", opacity = 1 }) {
  return `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-size="${size}" opacity="${opacity}">
    ${values.map((value, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : leading}">${esc(value)}</tspan>`).join("")}
  </text>`;
}

function rect({ x, y, w, h, r = 0, fill = "none", stroke = "none", sw = 0, opacity = 1, filter = "" }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"${filter ? ` filter="${filter}"` : ""}/>`;
}

async function dataUriFromSharp(pipeline, format = "png") {
  const buffer = await pipeline[format]().toBuffer();
  return `data:image/${format};base64,${buffer.toString("base64")}`;
}

async function cropUri(crop, width) {
  return dataUriFromSharp(sharp(sourceRender).extract(crop).resize({ width }), "png");
}

async function logoUri(width = 520) {
  return dataUriFromSharp(sharp(logoPath).resize({ width }), "png");
}

function defs() {
  return `<defs>
    <style>
      ${fontCss}
      .reg{font-family:'LD Regular','Arial',sans-serif;font-weight:400}
      .med{font-family:'LD Medium','Arial',sans-serif;font-weight:500}
      .bold{font-family:'LD Bold','Arial',sans-serif;font-weight:700}
      .black{font-family:'LD Black','Arial Black',sans-serif;font-weight:900}
      text{dominant-baseline:alphabetic}
    </style>
    <filter id="softShadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="30" stdDeviation="28" flood-color="#10263A" flood-opacity="0.2"/>
    </filter>
    <filter id="tightShadow" x="-14%" y="-14%" width="128%" height="136%">
      <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#10263A" flood-opacity="0.16"/>
    </filter>
    <linearGradient id="table" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFDF8"/>
      <stop offset="0.58" stop-color="#F2EFE8"/>
      <stop offset="1" stop-color="#E2EEF1"/>
    </linearGradient>
    <radialGradient id="studioGlow" cx="46%" cy="18%" r="76%">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.46" stop-color="#F8F4EC"/>
      <stop offset="1" stop-color="#DCECEF"/>
    </radialGradient>
    <linearGradient id="photoBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C7EEF5"/>
      <stop offset="0.48" stop-color="#42B5D3"/>
      <stop offset="1" stop-color="#177CA4"/>
    </linearGradient>
    <linearGradient id="filmHighlight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.52"/>
      <stop offset="0.36" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="0.64" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#06253A" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="curvedFilm" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#041C30" stop-opacity="0.18"/>
      <stop offset="0.16" stop-color="#FFFFFF" stop-opacity="0.18"/>
      <stop offset="0.44" stop-color="#FFFFFF" stop-opacity="0.03"/>
      <stop offset="0.68" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#041C30" stop-opacity="0.24"/>
    </linearGradient>
    <linearGradient id="sideShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#061B2F" stop-opacity="0.28"/>
    </linearGradient>
    <pattern id="grid" width="58" height="58" patternUnits="userSpaceOnUse">
      <path d="M58 0H0V58" fill="none" stroke="#B8C9CE" stroke-width="1" opacity="0.22"/>
    </pattern>
    <pattern id="grain" width="72" height="72" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="12" r="1.1" fill="#4E6470" opacity="0.06"/>
      <circle cx="34" cy="18" r="0.9" fill="#FFFFFF" opacity="0.1"/>
      <circle cx="58" cy="48" r="1.2" fill="#4E6470" opacity="0.05"/>
      <circle cx="18" cy="62" r="0.8" fill="#FFFFFF" opacity="0.08"/>
    </pattern>
    <pattern id="padTexture" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(31)">
      <path d="M0 10H50M0 31H50" stroke="#D9EFF4" stroke-width="6" opacity="0.72"/>
      <path d="M24 0V50" stroke="#F7FDFE" stroke-width="4" opacity="0.9"/>
    </pattern>
  </defs>`;
}

function shell({ width, height, bg = "url(#studioGlow)", content, grid = false }) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs()}
  ${rect({ x: 0, y: 0, w: width, h: height, fill: bg })}
  ${grid ? rect({ x: 0, y: 0, w: width, h: height, fill: "url(#grid)", opacity: 0.2 }) : ""}
  ${rect({ x: 0, y: 0, w: width, h: height, fill: "url(#grain)", opacity: 0.65 })}
  ${content}
</svg>`;
}

function imageBlock({ id, href, x, y, w, h, r = 24, fit = "xMidYMid meet", filter = "", opacity = 1 }) {
  return `<g transform="translate(${x} ${y})" ${filter ? `filter="${filter}"` : ""} opacity="${opacity}">
    <clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}"/></clipPath>
    ${rect({ x: 0, y: 0, w, h, r, fill: white })}
    <image href="${href}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="${fit}" clip-path="url(#${id})"/>
    ${rect({ x: 0, y: 0, w, h, r, fill: "url(#filmHighlight)", opacity: 0.16 })}
  </g>`;
}

function crinkles(w, h, opacity = 0.22) {
  return `<g opacity="${opacity}" fill="none" stroke="#FFFFFF" stroke-linecap="round">
    <path d="M${w * 0.08} ${h * 0.12}C${w * 0.28} ${h * 0.06} ${w * 0.5} ${h * 0.08} ${w * 0.82} ${h * 0.13}" stroke-width="${w * 0.012}"/>
    <path d="M${w * 0.14} ${h * 0.28}C${w * 0.34} ${h * 0.24} ${w * 0.55} ${h * 0.29} ${w * 0.78} ${h * 0.25}" stroke-width="${w * 0.006}"/>
    <path d="M${w * 0.22} ${h * 0.52}C${w * 0.42} ${h * 0.48} ${w * 0.66} ${h * 0.55} ${w * 0.9} ${h * 0.5}" stroke-width="${w * 0.007}"/>
    <path d="M${w * 0.12} ${h * 0.76}C${w * 0.32} ${h * 0.72} ${w * 0.58} ${h * 0.78} ${w * 0.86} ${h * 0.74}" stroke-width="${w * 0.006}"/>
  </g>`;
}

function pouch({ id, x, y, w, h, front, side, rotate = 0, sideW = 0, scale = 1, opacity = 1 }) {
  const hasSide = side && sideW > 0;
  const totalW = w + (hasSide ? sideW : 0);
  const sidePoly = `${w},22 ${totalW},68 ${totalW},${h - 44} ${w},${h}`;
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})" opacity="${opacity}">
    <ellipse cx="${w * 0.52}" cy="${h + 32}" rx="${w * 0.52}" ry="${Math.max(28, h * 0.055)}" fill="#0A2030" opacity="0.16" filter="url(#tightShadow)"/>
    <g filter="url(#softShadow)">
    ${hasSide ? `<clipPath id="${id}-side"><polygon points="${sidePoly}"/></clipPath>
      <polygon points="${sidePoly}" fill="#198EB8"/>
      <image href="${side}" x="${w}" y="0" width="${sideW}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-side)"/>
      <polygon points="${sidePoly}" fill="url(#sideShade)"/>
      <path d="M${w} 22V${h}" stroke="#0B2948" stroke-width="2" opacity="0.26"/>` : ""}
    <clipPath id="${id}-front"><rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}"/></clipPath>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="#1A9AC4"/>
    <image href="${front}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-front)"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="url(#filmHighlight)" clip-path="url(#${id}-front)" opacity="0.62"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="url(#curvedFilm)" clip-path="url(#${id}-front)" opacity="0.75"/>
    ${crinkles(w, h, 0.28)}
    <path d="M${w * 0.16} ${h * 0.08}C${w * 0.32} ${h * 0.02} ${w * 0.55} ${h * 0.03} ${w * 0.82} ${h * 0.08}" stroke="#FFFFFF" stroke-width="${Math.max(5, w * 0.018)}" opacity="0.36" fill="none" stroke-linecap="round"/>
    <path d="M${w * 0.06} ${h * 0.055}H${w * 0.94}" stroke="#ffffff" stroke-width="${Math.max(3, w * 0.012)}" opacity="0.44"/>
    <path d="M${w * 0.035} ${h * 0.1}V${h * 0.9}" stroke="#FFFFFF" stroke-width="${Math.max(2, w * 0.006)}" opacity="0.16"/>
    <path d="M${w * 0.965} ${h * 0.1}V${h * 0.9}" stroke="#061B2F" stroke-width="${Math.max(2, w * 0.007)}" opacity="0.2"/>
    <path d="M${w * 0.06} ${h * 0.94}H${w * 0.94}" stroke="#06253A" stroke-width="${Math.max(2, w * 0.006)}" opacity="0.16"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="none" stroke="#0B2948" stroke-width="2" opacity="0.13"/>
    </g>
  </g>`;
}

function pad({ x, y, w, h, rotate = 0 }) {
  return `<g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#tightShadow)">
    <path d="M0 ${h * 0.2}C${w * 0.28} 0 ${w * 0.67} ${-h * 0.04} ${w} ${h * 0.15}L${w * 0.84} ${h * 0.76}C${w * 0.58} ${h * 0.98} ${w * 0.26} ${h * 0.94} ${w * 0.04} ${h * 0.68}Z" fill="#FFFFFF" stroke="#CDECF4" stroke-width="${Math.max(8, w * 0.02)}"/>
    <path d="M0 ${h * 0.2}C${w * 0.28} 0 ${w * 0.67} ${-h * 0.04} ${w} ${h * 0.15}L${w * 0.84} ${h * 0.76}C${w * 0.58} ${h * 0.98} ${w * 0.26} ${h * 0.94} ${w * 0.04} ${h * 0.68}Z" fill="url(#padTexture)" opacity="0.82"/>
  </g>`;
}

function chip({ x, y, fill, label }) {
  return `<g transform="translate(${x} ${y})">
    ${rect({ x: 0, y: 0, w: 122, h: 122, r: 22, fill, filter: "url(#tightShadow)" })}
    ${text({ x: 0, y: 164, value: label, size: 24, fill: gray, cls: "bold" })}
  </g>`;
}

function shelfRail({ x, y, w }) {
  return `<g transform="translate(${x} ${y})" filter="url(#tightShadow)">
    ${rect({ x: 0, y: 0, w, h: 156, r: 18, fill: white })}
    ${text({ x: 42, y: 62, value: "WAI SHIELD BED PADS", size: 34, fill: ink, cls: "black", tracking: 3 })}
    ${text({ x: 42, y: 112, value: "16 disposable bed pads / 29 in x 36 in", size: 28, fill: gray, cls: "med" })}
    ${text({ x: w - 48, y: 102, value: "$19.99", size: 46, fill: ink, cls: "black", anchor: "end" })}
  </g>`;
}

async function writeAsset(name, width, height, svg) {
  const svgPath = join(outDir, `${name}.svg`);
  const webpPath = join(outDir, `${name}.webp`);
  writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: "cover" })
    .webp({ quality: 91 })
    .toFile(webpPath);
  console.log(webpPath);
}

const fullArt = await cropUri(crops.fullArt, 2400);
const printArea = await cropUri(crops.printArea, 2400);
const leftFront = await cropUri(crops.leftFront, 1200);
const centerInfo = await cropUri(crops.centerInfo, 760);
const rightFront = await cropUri(crops.rightFront, 1200);
const rightSide = await cropUri(crops.rightSide, 760);
const logo = await logoUri(620);

const cover = shell({
  width: 2400,
  height: 1600,
  content: `
  <path d="M0 1110C390 960 700 980 1040 810C1328 666 1602 426 1940 384C2140 360 2290 402 2400 320V1600H0Z" fill="${aqua}" opacity="0.18"/>
  ${rect({ x: 0, y: 1190, w: 2400, h: 410, fill: "#DCEDEF", opacity: 0.62 })}
  ${pouch({ id: "cover-back", x: 890, y: 278, w: 470, h: 828, front: leftFront, side: centerInfo, sideW: 92, rotate: -5, opacity: 0.96 })}
  ${pouch({ id: "cover-main", x: 1132, y: 246, w: 552, h: 974, front: rightFront, side: rightSide, sideW: 118, rotate: 3 })}
  ${pouch({ id: "cover-small", x: 564, y: 556, w: 368, h: 648, front: rightFront, rotate: -8, opacity: 0.96 })}
  <g transform="translate(160 1084) rotate(-2)">
    ${imageBlock({ id: "cover-proof", href: printArea, x: 0, y: 0, w: 780, h: 460, r: 16, filter: "url(#tightShadow)" })}
  </g>
  <g transform="translate(1806 1072) rotate(1.5)">
    ${imageBlock({ id: "cover-logo", href: logo, x: 0, y: 0, w: 360, h: 310, r: 10, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery01 = shell({
  width: 2400,
  height: 1600,
  content: `
  <g transform="translate(142 280) rotate(-1.4)">
    ${rect({ x: -36, y: -42, w: 2180, h: 1188, r: 12, fill: "#FFFFFF", filter: "url(#softShadow)" })}
    ${imageBlock({ id: "proof-full", href: fullArt, x: 0, y: 0, w: 2106, h: 1048, r: 6, fit: "xMidYMid meet" })}
  </g>
  ${rect({ x: 1740, y: 194, w: 78, h: 1050, r: 16, fill: "#E6D9C7", filter: "url(#tightShadow)", opacity: 0.86 })}
  ${rect({ x: 1756, y: 244, w: 8, h: 930, r: 4, fill: "#A99B88", opacity: 0.58 })}
  <g transform="translate(1540 1190) rotate(2)">
    ${imageBlock({ id: "proof-logo", href: logo, x: 0, y: 0, w: 330, h: 284, r: 8, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery02 = shell({
  width: 1800,
  height: 1800,
  content: `
  ${rect({ x: 0, y: 1320, w: 1800, h: 480, fill: "#DDEDEF", opacity: 0.76 })}
  ${pouch({ id: "hero-right", x: 434, y: 214, w: 622, h: 1094, front: rightFront, side: rightSide, sideW: 146, rotate: -2 })}
  <g transform="translate(1116 974) rotate(1.6)">
    ${imageBlock({ id: "hero-logo", href: logo, x: 0, y: 0, w: 312, h: 268, r: 8, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery03 = shell({
  width: 1800,
  height: 1800,
  content: `
  ${rect({ x: 0, y: 1288, w: 1800, h: 512, fill: "#DFEEF1", opacity: 0.74 })}
  ${pouch({ id: "hero-left", x: 678, y: 226, w: 590, h: 1038, front: leftFront, side: centerInfo, sideW: 126, rotate: 2.4 })}
  ${pad({ x: 206, y: 1054, w: 670, h: 292, rotate: -11 })}
  ${pad({ x: 260, y: 1162, w: 604, h: 264, rotate: -10 })}
  <g transform="translate(118 306) rotate(-3.4)">
    ${imageBlock({ id: "left-proof-crop", href: leftFront, x: 0, y: 0, w: 356, h: 626, r: 18, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery04 = shell({
  width: 2400,
  height: 1600,
  content: `
  ${rect({ x: 0, y: 1048, w: 2400, h: 552, fill: "#DDE9EC" })}
  ${rect({ x: 0, y: 1164, w: 2400, h: 62, fill: "#B8CDD3" })}
  ${rect({ x: 0, y: 1230, w: 2400, h: 70, fill: "#EFF5F6" })}
  ${pouch({ id: "shelf-a", x: 312, y: 448, w: 416, h: 734, front: leftFront, rotate: -2.6 })}
  ${pouch({ id: "shelf-b", x: 700, y: 308, w: 526, h: 926, front: rightFront, side: rightSide, sideW: 98 })}
  ${pouch({ id: "shelf-c", x: 1204, y: 430, w: 430, h: 758, front: rightFront, side: centerInfo, sideW: 88, rotate: 2.2 })}
  ${pouch({ id: "shelf-d", x: 1638, y: 522, w: 280, h: 650, front: rightSide, rotate: 0 })}
  ${shelfRail({ x: 188, y: 1340, w: 1902 })}`,
});

const gallery05 = shell({
  width: 2400,
  height: 1350,
  content: `
  ${rect({ x: 0, y: 986, w: 2400, h: 364, fill: "#E0EEF1", opacity: 0.72 })}
  ${pouch({ id: "back-info", x: 270, y: 218, w: 438, h: 934, front: centerInfo, rotate: -2.3 })}
  ${pouch({ id: "side-icons", x: 778, y: 230, w: 430, h: 916, front: rightSide, rotate: 2.4 })}
  <g transform="translate(1458 278) rotate(-1.2)">
    ${imageBlock({ id: "info-flat", href: centerInfo, x: 0, y: 0, w: 316, h: 780, r: 16, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  </g>
  <g transform="translate(1796 270) rotate(2)">
    ${imageBlock({ id: "side-flat", href: rightSide, x: 0, y: 0, w: 316, h: 780, r: 16, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery06 = shell({
  width: 2400,
  height: 1600,
  content: `
  ${rect({ x: 0, y: 1150, w: 2400, h: 450, fill: "#E1EEF0", opacity: 0.68 })}
  ${pouch({ id: "color-master", x: 258, y: 292, w: 520, h: 916, front: rightFront, side: rightSide, sideW: 106, rotate: -2 })}
  <g transform="translate(940 420)">
    ${chip({ x: 0, y: 0, fill: "#AFE6EF", label: "Sky aqua" })}
    ${chip({ x: 180, y: 0, fill: "#31A8CB", label: "Wave blue" })}
    ${chip({ x: 360, y: 0, fill: "#123A62", label: "Shield navy" })}
    ${chip({ x: 540, y: 0, fill: "#FFFFFF", label: "Pad white" })}
    ${chip({ x: 720, y: 0, fill: "#2A89AD", label: "Deep water" })}
  </g>
  <g transform="translate(888 818) rotate(1.2)">
    ${imageBlock({ id: "palette-proof", href: printArea, x: 0, y: 0, w: 1260, h: 470, r: 18, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery07 = shell({
  width: 1600,
  height: 2200,
  content: `
  ${rect({ x: 0, y: 1470, w: 1600, h: 730, fill: "#E0EEF1", opacity: 0.72 })}
  ${pouch({ id: "open-pack", x: 214, y: 324, w: 520, h: 916, front: rightFront, side: rightSide, sideW: 104, rotate: -5.2 })}
  ${pad({ x: 596, y: 1004, w: 720, h: 318, rotate: -5.5 })}
  ${pad({ x: 620, y: 1162, w: 680, h: 300, rotate: -5.5 })}
  ${pad({ x: 638, y: 1310, w: 622, h: 274, rotate: -5.5 })}
  <g transform="translate(182 1640) rotate(-2)">
    ${imageBlock({ id: "detail-logo", href: logo, x: 0, y: 0, w: 286, h: 246, r: 8, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery08 = shell({
  width: 2400,
  height: 1600,
  content: `
  ${rect({ x: 0, y: 1128, w: 2400, h: 472, fill: "#DFEEF1", opacity: 0.68 })}
  <g transform="translate(178 352) rotate(-1.2)">
    ${imageBlock({ id: "big-logo", href: logo, x: 0, y: 0, w: 694, h: 596, r: 10, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>
  ${pouch({ id: "logo-pack-a", x: 1040, y: 318, w: 392, h: 690, front: leftFront, rotate: -2.4 })}
  ${pouch({ id: "logo-pack-b", x: 1424, y: 286, w: 430, h: 758, front: rightFront, side: rightSide, sideW: 90, rotate: 2.2 })}
  <g transform="translate(1016 1104) rotate(1)">
    ${imageBlock({ id: "logo-strip", href: printArea, x: 0, y: 0, w: 760, h: 284, r: 14, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>`,
});

const gallery09 = shell({
  width: 1800,
  height: 1800,
  content: `
  ${rect({ x: 0, y: 1286, w: 1800, h: 514, fill: "#E0EEF1", opacity: 0.72 })}
  <g transform="translate(122 412) rotate(-3.2)">
    ${rect({ x: -22, y: -28, w: 1080, h: 802, r: 10, fill: "#FFFFFF", filter: "url(#softShadow)" })}
    ${imageBlock({ id: "fold-flat", href: fullArt, x: 0, y: 0, w: 1024, h: 760, r: 6, fit: "xMidYMid meet" })}
  </g>
  ${pouch({ id: "fold-pack", x: 1022, y: 470, w: 432, h: 760, front: rightFront, side: rightSide, sideW: 104, rotate: 4.2 })}`,
});

const gallery10 = shell({
  width: 2400,
  height: 1600,
  content: `
  ${rect({ x: 0, y: 1138, w: 2400, h: 462, fill: "#DFEEF1", opacity: 0.7 })}
  ${pouch({ id: "rec-main", x: 438, y: 236, w: 602, h: 1060, front: rightFront, side: rightSide, sideW: 132, rotate: -1.4 })}
  ${pouch({ id: "rec-secondary", x: 1028, y: 380, w: 418, h: 736, front: leftFront, side: centerInfo, sideW: 88, rotate: 3.4, opacity: 0.96 })}
  <g transform="translate(1446 466) rotate(1.1)">
    ${imageBlock({ id: "rec-proof", href: printArea, x: 0, y: 0, w: 710, h: 420, r: 18, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  </g>
  <g transform="translate(1452 1036)">
    ${chip({ x: 0, y: 0, fill: "#AFE6EF", label: "Base" })}
    ${chip({ x: 168, y: 0, fill: "#31A8CB", label: "Field" })}
    ${chip({ x: 336, y: 0, fill: "#123A62", label: "Type" })}
    ${chip({ x: 504, y: 0, fill: "#FFFFFF", label: "Pad" })}
  </g>`,
});

const assets = [
  ["cover-source-faithful-lineup", 2400, 1600, cover],
  ["gallery-01-source-dieline-proof", 2400, 1600, gallery01],
  ["gallery-02-front-pouch-mockup", 1800, 1800, gallery02],
  ["gallery-03-secondary-panel-mockup", 1800, 1800, gallery03],
  ["gallery-04-retail-shelf-mockup", 2400, 1600, gallery04],
  ["gallery-05-side-back-panels", 2400, 1350, gallery05],
  ["gallery-06-color-study", 2400, 1600, gallery06],
  ["gallery-07-material-detail", 1600, 2200, gallery07],
  ["gallery-08-logo-fidelity", 2400, 1600, gallery08],
  ["gallery-09-folded-wrap-study", 1800, 1800, gallery09],
  ["gallery-10-recommended-direction", 2400, 1600, gallery10],
];

for (const [name, width, height, svg] of assets) {
  await writeAsset(name, width, height, svg);
}
