import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const logoPath = join(root, "public/images/projects/wai-shield-care/source/wai-shield-logo.png");
const sourceRender = join(root, "public/images/projects/wai-shield-care/source/waishield-dieline-render-144.png");
const outDir = join(root, "public/images/projects/wai-shield-care/mockup-candidates-v2");
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
    <linearGradient id="sideShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#061B2F" stop-opacity="0.28"/>
    </linearGradient>
    <pattern id="grid" width="58" height="58" patternUnits="userSpaceOnUse">
      <path d="M58 0H0V58" fill="none" stroke="#B8C9CE" stroke-width="1" opacity="0.22"/>
    </pattern>
    <pattern id="padTexture" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(31)">
      <path d="M0 10H50M0 31H50" stroke="#D9EFF4" stroke-width="6" opacity="0.72"/>
      <path d="M24 0V50" stroke="#F7FDFE" stroke-width="4" opacity="0.9"/>
    </pattern>
  </defs>`;
}

function shell({ width, height, bg = "url(#table)", content }) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs()}
  ${rect({ x: 0, y: 0, w: width, h: height, fill: bg })}
  ${rect({ x: 0, y: 0, w: width, h: height, fill: "url(#grid)", opacity: 0.34 })}
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
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})" filter="url(#softShadow)" opacity="${opacity}">
    ${hasSide ? `<clipPath id="${id}-side"><polygon points="${sidePoly}"/></clipPath>
      <polygon points="${sidePoly}" fill="#198EB8"/>
      <image href="${side}" x="${w}" y="0" width="${sideW}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-side)"/>
      <polygon points="${sidePoly}" fill="url(#sideShade)"/>
      <path d="M${w} 22V${h}" stroke="#0B2948" stroke-width="2" opacity="0.26"/>` : ""}
    <clipPath id="${id}-front"><rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}"/></clipPath>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="#1A9AC4"/>
    <image href="${front}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-front)"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="url(#filmHighlight)" clip-path="url(#${id}-front)" opacity="0.62"/>
    ${crinkles(w, h, 0.28)}
    <path d="M${w * 0.06} ${h * 0.055}H${w * 0.94}" stroke="#ffffff" stroke-width="${Math.max(3, w * 0.012)}" opacity="0.44"/>
    <path d="M${w * 0.06} ${h * 0.94}H${w * 0.94}" stroke="#06253A" stroke-width="${Math.max(2, w * 0.006)}" opacity="0.16"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(w * 0.08)}" fill="none" stroke="#0B2948" stroke-width="2" opacity="0.13"/>
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
  <path d="M0 1120C306 960 640 1016 960 820C1270 630 1510 298 1880 244C2104 212 2268 262 2400 166V1600H0Z" fill="${aqua}" opacity="0.22"/>
  ${rect({ x: 1664, y: 0, w: 736, h: 1600, fill: deepBlue, opacity: 0.98 })}
  <g transform="translate(118 122)">
    ${text({ x: 0, y: 0, value: "SOURCE-FAITHFUL PACKAGING MOCKUPS", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 166, value: "Wai Shield", size: 154, fill: ink, cls: "black" })}
    ${text({ x: 4, y: 274, value: "bed pads", size: 96, fill: ink, cls: "black" })}
    ${lines({ x: 6, y: 374, values: ["Photoreal studies built from", "the supplied die cut artwork,", "not a reinterpreted package."], size: 42, leading: 56, fill: gray, cls: "med" })}
  </g>
  ${pouch({ id: "cover-a", x: 878, y: 282, w: 444, h: 780, front: rightFront, side: rightSide, sideW: 88, rotate: -3 })}
  ${pouch({ id: "cover-b", x: 1190, y: 356, w: 392, h: 690, front: leftFront, side: centerInfo, sideW: 78, rotate: 3 })}
  ${pouch({ id: "cover-c", x: 642, y: 520, w: 336, h: 590, front: rightFront, rotate: -8, scale: 0.96 })}
  ${imageBlock({ id: "cover-logo", href: logo, x: 1814, y: 1110, w: 360, h: 310, r: 0, fit: "xMidYMid meet" })}
  <g transform="translate(118 1168)">
    ${imageBlock({ id: "cover-proof", href: printArea, x: 0, y: 0, w: 762, h: 450, r: 22, filter: "url(#tightShadow)" })}
    ${text({ x: 28, y: 390, value: "Actual die cut artwork used as texture source", size: 28, fill: ink, cls: "black" })}
  </g>`,
});

const gallery01 = shell({
  width: 2400,
  height: 1600,
  content: `
  <g transform="translate(104 92)">
    ${text({ x: 0, y: 0, value: "DIE CUT SOURCE", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 126, value: "The supplied wrap remains the source of truth.", size: 88, fill: ink, cls: "black" })}
  </g>
  <g transform="translate(144 356) rotate(-1.1)" filter="url(#softShadow)">
    ${imageBlock({ id: "proof-full", href: fullArt, x: 0, y: 0, w: 2070, h: 1030, r: 8, fit: "xMidYMid meet" })}
  </g>
  ${text({ x: 152, y: 1460, value: "Includes the exact logo placement, wave field, pad illustrations, icons, barcode, claim text, and bottom glue-flap structure.", size: 34, fill: gray, cls: "med" })}`,
});

const gallery02 = shell({
  width: 1800,
  height: 1800,
  content: `
  <g transform="translate(108 108)">
    ${text({ x: 0, y: 0, value: "PHOTOREAL FRONT MOCKUP", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 128, value: "Right face from the dieline.", size: 100, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "hero-right", x: 238, y: 384, w: 570, h: 1004, front: rightFront, side: rightSide, sideW: 126, rotate: -2 })}
  <g transform="translate(1000 520)">
    ${imageBlock({ id: "hero-logo", href: logo, x: 0, y: 0, w: 360, h: 310, r: 0, fit: "xMidYMid meet" })}
    ${text({ x: 0, y: 418, value: "Logo reference", size: 40, fill: ink, cls: "black" })}
    ${lines({ x: 0, y: 480, values: ["Using the supplied PNG logo", "and the logo placements already", "embedded in the die cut."], size: 30, leading: 42, fill: gray, cls: "med" })}
  </g>
  ${rect({ x: 0, y: 1502, w: 1800, h: 298, fill: deepBlue })}
  ${text({ x: 118, y: 1632, value: "Realism layer: soft pouch volume, glossy film, seams, crinkles, and contact shadows.", size: 38, fill: white, cls: "bold" })}`,
});

const gallery03 = shell({
  width: 1800,
  height: 1800,
  content: `
  <g transform="translate(108 108)">
    ${text({ x: 0, y: 0, value: "SECONDARY FACE MOCKUP", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 128, value: "Flying-pad panel preserved.", size: 100, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "hero-left", x: 618, y: 316, w: 560, h: 986, front: leftFront, side: centerInfo, sideW: 122, rotate: 3 })}
  ${pad({ x: 176, y: 988, w: 640, h: 278, rotate: -12 })}
  ${imageBlock({ id: "left-crop", href: leftFront, x: 126, y: 368, w: 358, h: 630, r: 24, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  ${lines({ x: 130, y: 1422, values: ["The existing front art is not redrawn.", "It is cropped from the PDF render", "and applied as the package surface."], size: 36, leading: 52, fill: gray, cls: "med" })}`,
});

const gallery04 = shell({
  width: 2400,
  height: 1600,
  content: `
  ${rect({ x: 0, y: 1118, w: 2400, h: 482, fill: "#DDE9EC" })}
  ${rect({ x: 0, y: 1218, w: 2400, h: 54, fill: "#B9CCD2" })}
  <g transform="translate(104 90)">
    ${text({ x: 0, y: 0, value: "RETAIL SHELF MOCKUP", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 126, value: "Same design, real shelf behavior.", size: 94, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "shelf-a", x: 338, y: 486, w: 390, h: 688, front: leftFront, rotate: -3 })}
  ${pouch({ id: "shelf-b", x: 706, y: 354, w: 488, h: 860, front: rightFront, side: rightSide, sideW: 92 })}
  ${pouch({ id: "shelf-c", x: 1168, y: 456, w: 408, h: 718, front: rightFront, side: centerInfo, sideW: 82, rotate: 2 })}
  ${pouch({ id: "shelf-d", x: 1570, y: 570, w: 248, h: 582, front: rightSide, rotate: 0 })}
  ${shelfRail({ x: 188, y: 1310, w: 1902 })}`,
});

const gallery05 = shell({
  width: 2400,
  height: 1350,
  content: `
  <g transform="translate(96 80)">
    ${text({ x: 0, y: 0, value: "BACK AND SIDE PANELS", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 116, value: "Claims, barcode, and icons stay intact.", size: 88, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "back-info", x: 188, y: 274, w: 382, h: 816, front: centerInfo, rotate: -2 })}
  ${pouch({ id: "side-icons", x: 632, y: 274, w: 382, h: 816, front: rightSide, rotate: 2 })}
  ${imageBlock({ id: "info-flat", href: centerInfo, x: 1218, y: 284, w: 300, h: 740, r: 18, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  ${imageBlock({ id: "side-flat", href: rightSide, x: 1564, y: 284, w: 300, h: 740, r: 18, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  ${lines({ x: 1218, y: 1122, values: ["The mockup uses the actual PDF panels:", "information/back panel at left, icon/side panel at right."], size: 34, leading: 48, fill: gray, cls: "med" })}`,
});

const gallery06 = shell({
  width: 2400,
  height: 1600,
  content: `
  <g transform="translate(104 90)">
    ${text({ x: 0, y: 0, value: "COLOR STUDY", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 126, value: "Palette studies stay tied to the supplied blue system.", size: 82, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "color-master", x: 170, y: 372, w: 460, h: 810, front: rightFront, side: rightSide, sideW: 90 })}
  <g transform="translate(780 424)">
    ${chip({ x: 0, y: 0, fill: "#AFE6EF", label: "Sky aqua" })}
    ${chip({ x: 170, y: 0, fill: "#31A8CB", label: "Wave blue" })}
    ${chip({ x: 340, y: 0, fill: "#123A62", label: "Shield navy" })}
    ${chip({ x: 510, y: 0, fill: "#FFFFFF", label: "Pad white" })}
    ${chip({ x: 680, y: 0, fill: "#2A89AD", label: "Deep water" })}
  </g>
  ${imageBlock({ id: "palette-proof", href: printArea, x: 780, y: 764, w: 1300, h: 448, r: 22, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  ${text({ x: 780, y: 1328, value: "Recommendation: keep the master blue direction. Explore color through accent systems, not a full redesign.", size: 34, fill: gray, cls: "med" })}`,
});

const gallery07 = shell({
  width: 1600,
  height: 2200,
  content: `
  <g transform="translate(96 118)">
    ${text({ x: 0, y: 0, value: "MATERIAL DETAIL MOCKUP", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 132, value: "Plastic film and pad texture.", size: 92, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "open-pack", x: 190, y: 452, w: 508, h: 895, front: rightFront, side: rightSide, sideW: 98, rotate: -6 })}
  ${pad({ x: 626, y: 1048, w: 680, h: 300, rotate: -6 })}
  ${pad({ x: 642, y: 1182, w: 640, h: 282, rotate: -6 })}
  ${pad({ x: 650, y: 1310, w: 590, h: 260, rotate: -6 })}
  ${rect({ x: 138, y: 1694, w: 1324, h: 272, r: 34, fill: deepBlue })}
  ${text({ x: 204, y: 1794, value: "Photoreal layer", size: 42, fill: white, cls: "black" })}
  ${lines({ x: 204, y: 1864, values: ["Realistic seams, crinkles, shadows, and quilted pad material", "are added around the exact package art from the die cut."], size: 34, leading: 46, fill: white, cls: "med", opacity: 0.82 })}`,
});

const gallery08 = shell({
  width: 2400,
  height: 1600,
  content: `
  <g transform="translate(104 90)">
    ${text({ x: 0, y: 0, value: "LOGO FIDELITY", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 126, value: "Supplied mark, source package placement.", size: 90, fill: ink, cls: "black" })}
  </g>
  ${imageBlock({ id: "big-logo", href: logo, x: 160, y: 390, w: 660, h: 566, r: 0, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  ${imageBlock({ id: "logo-panel-a", href: leftFront, x: 1016, y: 360, w: 398, h: 700, r: 22, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  ${imageBlock({ id: "logo-panel-b", href: rightFront, x: 1504, y: 360, w: 398, h: 700, r: 22, fit: "xMidYMid slice", filter: "url(#tightShadow)" })}
  ${text({ x: 164, y: 1132, value: "The logo asset provided in Downloads is copied into the project and used in study boards.", size: 34, fill: gray, cls: "med" })}
  ${text({ x: 1016, y: 1132, value: "The package mockups retain the logo placements embedded in the supplied PDF.", size: 34, fill: gray, cls: "med" })}`,
});

const gallery09 = shell({
  width: 1800,
  height: 1800,
  content: `
  <g transform="translate(108 108)">
    ${text({ x: 0, y: 0, value: "FOLDED WRAP STUDY", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 128, value: "Flat proof to pack form.", size: 102, fill: ink, cls: "black" })}
  </g>
  <g transform="translate(120 420) rotate(-3)" filter="url(#softShadow)">
    ${imageBlock({ id: "fold-flat", href: fullArt, x: 0, y: 0, w: 1000, h: 742, r: 8, fit: "xMidYMid meet" })}
  </g>
  ${pouch({ id: "fold-pack", x: 1030, y: 496, w: 418, h: 736, front: rightFront, side: rightSide, sideW: 96, rotate: 4 })}
  ${text({ x: 156, y: 1438, value: "The package form is a mockup layer over the same source artwork, not a redesigned face.", size: 36, fill: gray, cls: "med" })}`,
});

const gallery10 = shell({
  width: 2400,
  height: 1600,
  content: `
  <g transform="translate(104 90)">
    ${text({ x: 0, y: 0, value: "RECOMMENDED DIRECTION", size: 30, fill: "#0B717D", cls: "bold", tracking: 5 })}
    ${text({ x: 0, y: 126, value: "Use the current die cut as the master artwork.", size: 88, fill: ink, cls: "black" })}
  </g>
  ${pouch({ id: "rec-pack", x: 164, y: 424, w: 500, h: 880, front: rightFront, side: rightSide, sideW: 112 })}
  ${imageBlock({ id: "rec-proof", href: printArea, x: 804, y: 464, w: 1344, h: 508, r: 22, fit: "xMidYMid meet", filter: "url(#tightShadow)" })}
  <g transform="translate(804 1124)">
    ${chip({ x: 0, y: 0, fill: "#AFE6EF", label: "Base" })}
    ${chip({ x: 170, y: 0, fill: "#31A8CB", label: "Field" })}
    ${chip({ x: 340, y: 0, fill: "#123A62", label: "Type" })}
    ${chip({ x: 510, y: 0, fill: "#FFFFFF", label: "Pad" })}
  </g>
  ${lines({ x: 1480, y: 1148, values: ["Best next step: refine photography and package finish", "around the existing PDF artwork before changing", "layout, typography, icons, or logo placement."], size: 34, leading: 48, fill: gray, cls: "med" })}`,
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
