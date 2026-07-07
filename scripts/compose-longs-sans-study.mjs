import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const outDir = join(repoRoot, "public/images/projects/longs-sans");
const fontDir = "/Users/christopherabarca/Library/Fonts";
const longsProjectRoot = "/Users/christopherabarca/Documents/Longs Site Project";

const faces = {
  extraLight: "LDSans-ExtraLight.otf",
  light: "LDSans-Light.otf",
  regular: "LDSans-Regular.otf",
  medium: "LDSans-Medium.otf",
  bold: "LDSans-Bold.otf",
  black: "LDSans-Black.otf",
  regularItalic: "LDSans-Italic.otf",
  boldItalic: "LDSans-Bold_Italic.otf",
};

for (const file of Object.values(faces)) {
  const fontPath = join(fontDir, file);
  if (!existsSync(fontPath)) {
    throw new Error(`Missing LD Sans font file: ${fontPath}`);
  }
}

mkdirSync(outDir, { recursive: true });

function fontFace(name, file, weight, style = "normal") {
  const data = readFileSync(join(fontDir, file)).toString("base64");
  return `@font-face{font-family:'${name}';src:url(data:font/otf;base64,${data}) format('opentype');font-weight:${weight};font-style:${style};font-display:block;}`;
}

const fontCss = `
${fontFace("LD Sans ExtraLight", faces.extraLight, 200)}
${fontFace("LD Sans Light", faces.light, 300)}
${fontFace("LD Sans Regular", faces.regular, 400)}
${fontFace("LD Sans Medium", faces.medium, 500)}
${fontFace("LD Sans Bold", faces.bold, 700)}
${fontFace("LD Sans Black", faces.black, 900)}
${fontFace("LD Sans Italic", faces.regularItalic, 400, "italic")}
${fontFace("LD Sans Bold Italic", faces.boldItalic, 700, "italic")}
`;

const palette = {
  cream: "#f7f1e6",
  paper: "#fffaf2",
  sand: "#eadfce",
  red: "#d71920",
  redDark: "#9e1419",
  ink: "#111315",
  charcoal: "#27302d",
  green: "#1d5a42",
  greenDeep: "#173c30",
  blue: "#245f7f",
  blueDeep: "#173d58",
  yellow: "#f3c64d",
  coral: "#ef8b72",
  muted: "#726b61",
  line: "#d5c8b8",
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fitSize(value, maxWidth, preferred, min = 16, ratio = 0.54) {
  const safeLength = Math.max(String(value).length, 1);
  return Math.max(min, Math.min(preferred, Math.floor(maxWidth / (safeLength * ratio))));
}

function textLine({
  x,
  y,
  text,
  maxWidth,
  fill = palette.ink,
  size = 40,
  min = 16,
  cls = "reg",
  spacing = 0,
  ratio = 0.54,
  anchor = "start",
  opacity = 1,
}) {
  const fontSize = maxWidth ? fitSize(text, maxWidth, size, min, ratio) : size;
  return `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-size="${fontSize}" letter-spacing="${spacing}" text-anchor="${anchor}" opacity="${opacity}">${esc(text)}</text>`;
}

function multiline({ x, y, lines, fill = palette.charcoal, size = 34, cls = "reg", leading = 46, spacing = 0 }) {
  return `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-size="${size}" letter-spacing="${spacing}">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : leading}">${esc(line)}</tspan>`).join("")}
  </text>`;
}

function label({ x, y, text, fill = palette.red, size = 25, cls = "bold", spacing = 4 }) {
  return textLine({ x, y, text, fill, size, cls, spacing, ratio: 0.68 });
}

function roundedRect({ x, y, w, h, r = 24, fill = palette.paper, stroke = "none", sw = 0, opacity = 1, filter = "" }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" ${filter ? `filter="${filter}"` : ""}/>`;
}

function svgShell({ width, height, bg = palette.cream, content }) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${fontCss}
      .xl{font-family:'LD Sans Black','Arial',sans-serif;font-weight:900}
      .bold{font-family:'LD Sans Bold','Arial',sans-serif;font-weight:700}
      .med{font-family:'LD Sans Medium','Arial',sans-serif;font-weight:500}
      .reg{font-family:'LD Sans Regular','Arial',sans-serif;font-weight:400}
      .light{font-family:'LD Sans Light','Arial',sans-serif;font-weight:300}
      .extra{font-family:'LD Sans ExtraLight','Arial',sans-serif;font-weight:200}
      .italic{font-family:'LD Sans Italic','Arial',sans-serif;font-style:italic}
      .bolditalic{font-family:'LD Sans Bold Italic','Arial',sans-serif;font-weight:700;font-style:italic}
      text{dominant-baseline:alphabetic}
    </style>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#111315" flood-opacity="0.18"/>
    </filter>
    <filter id="tightShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#111315" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="redPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ed252c"/>
      <stop offset="1" stop-color="#991016"/>
    </linearGradient>
    <linearGradient id="greenPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#277454"/>
      <stop offset="1" stop-color="#12362b"/>
    </linearGradient>
    <linearGradient id="bluePanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2e7698"/>
      <stop offset="1" stop-color="#173d58"/>
    </linearGradient>
    <linearGradient id="paperSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.52"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#c5b5a2" stop-opacity="0.24"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#b9aa9a" stroke-width="1" opacity="0.26"/>
    </pattern>
    <pattern id="microDots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.3" fill="#ffffff" opacity="0.16"/>
    </pattern>
    <pattern id="slash" width="42" height="42" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
      <rect width="10" height="42" fill="#ffffff" opacity="0.13"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${bg}"/>
  ${content}
</svg>`;
}

function priceTag({ x, y, w, h, headline, price, sub, color = palette.red }) {
  const band = Math.min(Math.max(h * 0.26, 46), 76);
  const headlineSize = fitSize(headline, w - 42, Math.min(30, band * 0.45), 13, 0.64);
  const priceSize = fitSize(price, w - 48, Math.min(h * 0.33, 76), 24, 0.5);
  const subSize = fitSize(sub, w - 52, Math.min(h * 0.105, 24), 13, 0.56);
  const priceY = band + (h - band) * 0.54;

  return `<g transform="translate(${x} ${y})" filter="url(#tightShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 18, fill: palette.paper, stroke: "#ccbba9", sw: 2 })}
    <rect x="0" y="0" width="${w}" height="${band}" rx="18" fill="${color}"/>
    <rect x="0" y="${Math.max(0, band - 18)}" width="${w}" height="20" fill="${color}"/>
    ${textLine({ x: 24, y: band * 0.64, text: headline, maxWidth: w - 48, fill: "#fffaf2", size: headlineSize, min: 13, cls: "bold", ratio: 0.64 })}
    ${textLine({ x: 24, y: priceY, text: price, maxWidth: w - 48, fill: palette.ink, size: priceSize, min: 24, cls: "xl", ratio: 0.5 })}
    ${textLine({ x: 28, y: h - 22, text: sub, maxWidth: w - 56, fill: palette.muted, size: subSize, min: 13, cls: "med", ratio: 0.56 })}
  </g>`;
}

function shelfTicket({ x, y, w, h, head, product, meta, color }) {
  const headH = h * 0.29;
  return `<g transform="translate(${x} ${y})" filter="url(#tightShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 18, fill: "#f5ecdd", stroke: "#d5c6b5", sw: 2 })}
    <rect x="0" y="0" width="${w}" height="${headH}" rx="18" fill="${color}"/>
    <rect x="0" y="${headH - 18}" width="${w}" height="20" fill="${color}"/>
    ${textLine({ x: 28, y: headH * 0.62, text: head, maxWidth: w - 56, fill: "#fffaf2", size: h * 0.13, min: 20, cls: "xl", ratio: 0.62 })}
    ${textLine({ x: 28, y: h * 0.51, text: product, maxWidth: w - 56, fill: palette.ink, size: h * 0.105, min: 20, cls: "bold", ratio: 0.54 })}
    ${textLine({ x: 30, y: h * 0.64, text: meta, maxWidth: w - 60, fill: palette.muted, size: h * 0.062, min: 15, cls: "reg", ratio: 0.54 })}
    <rect x="28" y="${h * 0.76}" width="${w - 56}" height="${h * 0.065}" rx="${h * 0.032}" fill="#ded3c4"/>
    <rect x="28" y="${h * 0.88}" width="${w * 0.46}" height="${h * 0.047}" rx="${h * 0.024}" fill="#ded3c4"/>
  </g>`;
}

function browserFrame({ x, y, w, h, content, barFill = "#243b35" }) {
  return `<g transform="translate(${x} ${y})" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 34, fill: barFill })}
    ${roundedRect({ x: 24, y: 30, w: w - 48, h: h - 60, r: 24, fill: palette.paper })}
    ${content}
  </g>`;
}

function phoneFrame({ x, y, w, h, content }) {
  return `<g transform="translate(${x} ${y})" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 44, fill: "#243b35" })}
    ${roundedRect({ x: 18, y: 24, w: w - 36, h: h - 48, r: 32, fill: palette.paper })}
    ${content}
  </g>`;
}

function weightBand({ x, y, w, h, cls, name, weight, sample, color }) {
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="${color}" opacity="0.98"/>
    ${textLine({ x: 32, y: 50, text: name, maxWidth: 190, fill: "#fffaf2", size: 30, min: 18, cls: "bold", ratio: 0.56 })}
    ${textLine({ x: 32, y: 88, text: weight, maxWidth: 130, fill: "#fffaf2", size: 24, min: 16, cls: "reg", ratio: 0.56, opacity: 0.72 })}
    ${textLine({ x: 268, y: 86, text: sample, maxWidth: w - 304, fill: "#fffaf2", size: 72, min: 34, cls, ratio: 0.52 })}
  </g>`;
}

function imageBlock({ id, uri, x, y, w, h, r = 24, opacity = 1, filter = "", preserve = "xMidYMid slice" }) {
  return `<g transform="translate(${x} ${y})" opacity="${opacity}" ${filter ? `filter="${filter}"` : ""}>
    <clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}"/></clipPath>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="#e9dfd0"/>
    <image href="${uri}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="${preserve}" clip-path="url(#${id})"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="url(#paperSheen)" opacity="0.18"/>
  </g>`;
}

async function imageUri(path, { width = 1200, height = 800, fit = "cover", quality = 84 } = {}) {
  if (!existsSync(path)) {
    throw new Error(`Missing Longs project image: ${path}`);
  }

  const buffer = await sharp(path)
    .resize(width, height, { fit })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

async function writeImage(name, svg, options = {}) {
  const output = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(options.width, options.height, { fit: "cover" })
    .webp({ quality: options.quality ?? 90 })
    .toFile(output);
  console.log(output);
}

const longsImages = {
  extraCare: await imageUri(join(longsProjectRoot, "content/images/extracare-homepage.jpg"), { width: 900, height: 520 }),
  vaccine: await imageUri(join(longsProjectRoot, "content/images/vaccine-homepage.jpg"), { width: 900, height: 520 }),
  rx: await imageUri(join(longsProjectRoot, "content/images/rx-homepage.jpg"), { width: 900, height: 520 }),
  everyday: await imageUri(join(longsProjectRoot, "content/images/everyday-homepage.jpg"), { width: 900, height: 520 }),
  appDeals: await imageUri(join(longsProjectRoot, "content/images/app-deals-homepage.jpg"), { width: 780, height: 920 }),
  storeFinder: await imageUri(join(longsProjectRoot, "content/images/action-hub-rx-store-finder.jpg"), { width: 1200, height: 720 }),
  weeklyHero: await imageUri(join(longsProjectRoot, "prototypes/weekly-ad/weekly-ad-hero-desktop.png"), { width: 1600, height: 920 }),
  weeklyMobile: await imageUri(join(longsProjectRoot, "prototypes/weekly-ad/weekly-ad-hero-mobile-large.png"), { width: 920, height: 1180 }),
};

const cover = svgShell({
  width: 2400,
  height: 1600,
  bg: palette.cream,
  content: `
  <rect x="0" y="0" width="1018" height="1600" fill="url(#redPanel)"/>
  <rect x="0" y="0" width="1018" height="1600" fill="url(#slash)"/>
  <rect x="1018" y="0" width="1382" height="1600" fill="url(#grid)" opacity="0.72"/>
  <text class="xl" x="-72" y="1420" fill="#fffaf2" font-size="760" opacity="0.12">LD</text>
  <g transform="translate(116 126)">
    ${label({ x: 0, y: 0, text: "TYPEFACE STUDY / LONGS DRUGS", fill: "#fffaf2", size: 31, spacing: 7 })}
    <text class="xl" x="0" y="224" fill="#fffaf2" font-size="178">Longs</text>
    <text class="xl" x="0" y="388" fill="#fffaf2" font-size="178">Sans</text>
    ${multiline({
      x: 4,
      y: 502,
      fill: "#fffaf2",
      size: 42,
      leading: 56,
      cls: "reg",
      lines: ["A retail type system for", "signage, web, price tags,", "and everyday store use."],
    })}
    <text class="bold" x="4" y="676" fill="#fffaf2" font-size="44">Built for ʻŌlelo Hawaiʻi.</text>
    <text class="reg" x="6" y="728" fill="#fffaf2" font-size="34" opacity="0.82">Natural ʻokina. Local clarity.</text>
    <rect x="2" y="782" width="610" height="2" fill="#fffaf2" opacity="0.42"/>
    ${textLine({ x: 4, y: 886, text: "ExtraLight 200", fill: "#fffaf2", size: 32, cls: "extra", opacity: 0.76 })}
    ${textLine({ x: 4, y: 972, text: "Regular 400", fill: "#fffaf2", size: 46, cls: "reg" })}
    ${textLine({ x: 4, y: 1074, text: "Medium 500", fill: "#fffaf2", size: 58, cls: "med" })}
    ${textLine({ x: 4, y: 1200, text: "Black 900", fill: "#fffaf2", size: 88, cls: "xl" })}
  </g>
  <g transform="translate(1100 116)">
    ${imageBlock({ id: "cover-weekly", uri: longsImages.weeklyHero, x: 0, y: 0, w: 1138, h: 424, r: 34, filter: "url(#softShadow)" })}
    <rect x="0" y="0" width="560" height="424" rx="34" fill="#fff7df" opacity="0.93"/>
    <text class="med" x="58" y="86" fill="${palette.red}" font-size="30" letter-spacing="4">IN-USE TEST</text>
    <text class="xl" x="56" y="198" fill="${palette.ink}" font-size="88">Weekly ad</text>
    <text class="xl" x="56" y="286" fill="${palette.ink}" font-size="88">voice</text>
  </g>
  <g transform="translate(1094 640)">
    <text class="xl" x="0" y="116" fill="${palette.ink}" font-size="148">Aa Bb 123</text>
    <text class="bolditalic" x="4" y="202" fill="${palette.red}" font-size="68">Bold Italic carries urgency.</text>
    <rect x="0" y="284" width="1040" height="2" fill="${palette.line}"/>
    ${textLine({ x: 0, y: 394, text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", maxWidth: 1070, fill: palette.redDark, size: 54, min: 38, cls: "bold", ratio: 0.64 })}
    ${textLine({ x: 0, y: 474, text: "0123456789  $ % / + - ?", maxWidth: 1070, fill: palette.ink, size: 58, min: 36, cls: "reg", ratio: 0.55 })}
  </g>
  <g transform="translate(1098 1242)">
    ${priceTag({ x: 0, y: 0, w: 324, h: 232, headline: "CLUB PRICE", price: "$7.99", sub: "with card", color: palette.red })}
    ${priceTag({ x: 362, y: 34, w: 324, h: 198, headline: "LOCAL BUY", price: "2/$5", sub: "selected", color: palette.green })}
    ${priceTag({ x: 724, y: 0, w: 324, h: 232, headline: "WEEKLY AD", price: "24/7", sub: "online", color: palette.blue })}
  </g>`,
});

const gallery01 = svgShell({
  width: 2400,
  height: 1600,
  bg: palette.paper,
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.46"/>
  <rect x="0" y="0" width="930" height="1600" fill="url(#greenPanel)"/>
  <text class="xl" x="-96" y="1112" fill="#fffaf2" font-size="1010" opacity="0.12">Aa</text>
  <g transform="translate(116 112)">
    ${label({ x: 0, y: 0, text: "LD SANS FAMILY", fill: palette.yellow, size: 34, spacing: 7 })}
    <text class="xl" x="0" y="172" fill="#fffaf2" font-size="136">Weight,</text>
    <text class="xl" x="0" y="300" fill="#fffaf2" font-size="136">width,</text>
    <text class="xl" x="0" y="428" fill="#fffaf2" font-size="136">voice.</text>
    ${multiline({
      x: 4,
      y: 570,
      fill: "#fffaf2",
      size: 39,
      leading: 52,
      cls: "reg",
      lines: ["Made for a local Hawaiʻi", "staple, with ʻŌlelo Hawaiʻi", "treated as a core use case,", "not an afterthought."],
    })}
  </g>
  <g transform="translate(1014 128)">
    ${weightBand({ x: 0, y: 0, w: 1240, h: 148, cls: "extra", name: "ExtraLight", weight: "200", sample: "ʻōlelo Hawaiʻi", color: palette.blue })}
    ${weightBand({ x: 0, y: 172, w: 1240, h: 148, cls: "light", name: "Light", weight: "300", sample: "mālama pharmacy", color: palette.green })}
    ${weightBand({ x: 0, y: 344, w: 1240, h: 148, cls: "reg", name: "Regular", weight: "400", sample: "Hawaiʻi weekly ad", color: "#6f6254" })}
    ${weightBand({ x: 0, y: 516, w: 1240, h: 148, cls: "med", name: "Medium", weight: "500", sample: "store pickup today", color: palette.coral })}
    ${weightBand({ x: 0, y: 688, w: 1240, h: 148, cls: "bold", name: "Bold", weight: "700", sample: "extra savings", color: palette.red })}
    ${weightBand({ x: 0, y: 860, w: 1240, h: 148, cls: "xl", name: "Black", weight: "900", sample: "LONGS DRUGS", color: palette.greenDeep })}
  </g>
  <g transform="translate(1014 1248)">
    <text class="italic" x="0" y="0" fill="${palette.blue}" font-size="48">Italic gives service copy a human pace.</text>
    <text class="bolditalic" x="0" y="86" fill="${palette.red}" font-size="62">Bold Italic works like a sale flag.</text>
  </g>`,
});

const gallery02 = svgShell({
  width: 1600,
  height: 2200,
  bg: palette.sand,
  content: `
  <rect width="1600" height="2200" fill="url(#grid)" opacity="0.4"/>
  <rect x="1260" y="0" width="340" height="2200" fill="${palette.greenDeep}"/>
  <text class="xl" x="1190" y="2066" fill="#fffaf2" font-size="360" opacity="0.1" transform="rotate(-90 1190 2066)">AISLE</text>
  <g transform="translate(104 116)">
    ${label({ x: 0, y: 0, text: "RETAIL SCALE MOCKUP", fill: palette.red, size: 31, spacing: 6 })}
    <text class="xl" x="0" y="154" fill="${palette.ink}" font-size="130">Aisle language</text>
    <text class="reg" x="4" y="226" fill="${palette.muted}" font-size="38">Distance, hierarchy, and numerals in one working store system.</text>
  </g>
  <g transform="translate(112 386)" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w: 1212, h: 344, r: 30, fill: "url(#redPanel)" })}
    <rect width="1212" height="344" rx="30" fill="url(#microDots)"/>
    <text class="xl" x="68" y="162" fill="#fffaf2" font-size="128">Pharmacy</text>
    <text class="med" x="72" y="244" fill="#fffaf2" font-size="43" opacity="0.84">PICKUP / CONSULTATION / VACCINES</text>
  </g>
  <g transform="translate(112 840)">
    ${shelfTicket({ x: 0, y: 0, w: 378, h: 520, head: "HEALTH", product: "Cold Relief", meta: "Aisle 3", color: palette.green })}
    ${shelfTicket({ x: 428, y: 84, w: 378, h: 520, head: "BEAUTY", product: "Skin Care", meta: "New item", color: palette.coral })}
    ${shelfTicket({ x: 856, y: 0, w: 378, h: 520, head: "SNACKS", product: "Island Mix", meta: "Local pick", color: palette.blue })}
  </g>
  <g transform="translate(112 1518)">
    ${priceTag({ x: 0, y: 0, w: 376, h: 388, headline: "EXTRACARE", price: "$12.49", sub: "member price", color: palette.red })}
    ${priceTag({ x: 430, y: 54, w: 376, h: 334, headline: "BOGO", price: "50%", sub: "second item", color: palette.green })}
    ${priceTag({ x: 860, y: 0, w: 376, h: 388, headline: "WEEKLY AD", price: "3/$10", sub: "through Sun", color: palette.blue })}
  </g>
  <text class="med" x="112" y="2082" fill="${palette.muted}" font-size="30" letter-spacing="4">SPACING / NUMERALS / DISTANCE READABILITY</text>`,
});

const gallery03 = svgShell({
  width: 1800,
  height: 1800,
  bg: palette.paper,
  content: `
  <rect width="1800" height="1800" fill="url(#grid)" opacity="0.62"/>
  <rect x="0" y="1316" width="1800" height="484" fill="${palette.greenDeep}"/>
  <g transform="translate(116 116)">
    ${label({ x: 0, y: 0, text: "GLYPH PROPORTION STUDY", fill: palette.red, size: 31, spacing: 6 })}
    <text class="xl" x="0" y="154" fill="${palette.ink}" font-size="120">Forms that hold up.</text>
  </g>
  <g transform="translate(104 384)">
    <line x1="0" y1="0" x2="1592" y2="0" stroke="${palette.red}" stroke-width="6" opacity="0.82"/>
    <line x1="0" y1="238" x2="1592" y2="238" stroke="${palette.blue}" stroke-width="4" opacity="0.44"/>
    <line x1="0" y1="616" x2="1592" y2="616" stroke="${palette.red}" stroke-width="6" opacity="0.82"/>
    <line x1="0" y1="830" x2="1592" y2="830" stroke="${palette.green}" stroke-width="4" opacity="0.42"/>
    <text class="xl" x="42" y="624" fill="${palette.ink}" font-size="650">agR2</text>
    <text class="bolditalic" x="70" y="906" fill="${palette.red}" font-size="218" opacity="0.2">ʻŌ Hawaiʻi</text>
    <circle cx="1444" cy="114" r="102" fill="${palette.yellow}" opacity="0.8"/>
    <rect x="1300" y="664" width="226" height="226" rx="30" fill="${palette.blue}" opacity="0.18"/>
  </g>
  <g transform="translate(126 1414)">
    <text class="reg" x="0" y="0" fill="${palette.yellow}" font-size="34" letter-spacing="4">DETAIL NOTES</text>
    <text class="med" x="0" y="82" fill="#fffaf2" font-size="48">Natural ʻokina. Sturdy curves. Direct numerals.</text>
    <text class="reg" x="0" y="152" fill="#fffaf2" font-size="35" opacity="0.78">Designed for ʻŌlelo Hawaiʻi while holding professional retail clarity.</text>
  </g>`,
});

const gallery04 = svgShell({
  width: 2400,
  height: 1600,
  bg: "#e9dfd0",
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.34"/>
  <rect x="1680" y="0" width="720" height="1600" fill="url(#bluePanel)"/>
  <text class="xl" x="1688" y="1504" fill="#fffaf2" font-size="520" opacity="0.09">AD</text>
  <g transform="translate(118 116)">
    ${label({ x: 0, y: 0, text: "PRINT AND PROMOTION MOCKUPS", fill: palette.red, size: 32, spacing: 6 })}
    <text class="xl" x="0" y="150" fill="${palette.ink}" font-size="126">Proofs for the store floor.</text>
  </g>
  <g transform="translate(128 354)">
    <g transform="rotate(-5 0 0)" filter="url(#softShadow)">
      ${roundedRect({ x: 0, y: 0, w: 664, h: 900, r: 22, fill: palette.paper })}
      <rect x="0" y="0" width="664" height="238" rx="22" fill="url(#redPanel)"/>
      <rect x="0" y="196" width="664" height="44" fill="${palette.redDark}"/>
      <text class="xl" x="56" y="142" fill="#fffaf2" font-size="98">Weekly Ad</text>
      <text class="bold" x="60" y="330" fill="${palette.ink}" font-size="76">Local deals</text>
      <text class="xl" x="58" y="536" fill="${palette.red}" font-size="178">2/$6</text>
      <text class="reg" x="64" y="636" fill="${palette.muted}" font-size="38">Everyday essentials</text>
      <rect x="62" y="724" width="536" height="28" rx="14" fill="#ded4c4"/>
      <rect x="62" y="784" width="382" height="28" rx="14" fill="#ded4c4"/>
    </g>
    <g transform="translate(672 48) rotate(2)" filter="url(#softShadow)">
      ${roundedRect({ x: 0, y: 0, w: 724, h: 888, r: 22, fill: "#f8f3eb" })}
      <rect x="62" y="64" width="600" height="236" rx="20" fill="url(#greenPanel)"/>
      <text class="xl" x="108" y="190" fill="#fffaf2" font-size="80">Store Pickup</text>
      <text class="med" x="112" y="246" fill="#fffaf2" font-size="30" opacity="0.86" letter-spacing="3">READY TODAY</text>
      <text class="bold" x="64" y="424" fill="${palette.ink}" font-size="70">Signage suite</text>
      <text class="reg" x="66" y="500" fill="${palette.muted}" font-size="36">Service, pickup, and aisle IDs.</text>
      <text class="xl" x="66" y="728" fill="${palette.blue}" font-size="172">A12</text>
    </g>
    <g transform="translate(1398 -12) rotate(-1)" filter="url(#softShadow)">
      ${roundedRect({ x: 0, y: 0, w: 704, h: 944, r: 22, fill: palette.paper })}
      ${imageBlock({ id: "print-proof-photo", uri: longsImages.everyday, x: 52, y: 52, w: 600, h: 300, r: 22 })}
      <text class="xl" x="52" y="506" fill="${palette.ink}" font-size="102">Easy to scan,</text>
      <text class="xl" x="52" y="606" fill="${palette.ink}" font-size="102">hard to miss.</text>
      <rect x="54" y="768" width="344" height="86" rx="43" fill="${palette.red}"/>
      <text class="bold" x="110" y="824" fill="#fffaf2" font-size="39">Shop ad</text>
    </g>
  </g>`,
});

const gallery05 = svgShell({
  width: 2400,
  height: 1350,
  bg: "#f2eadf",
  content: `
  <rect width="2400" height="1350" fill="url(#grid)" opacity="0.34"/>
  <rect x="0" y="0" width="2400" height="88" fill="${palette.redDark}"/>
  <g transform="translate(118 146)">
    ${label({ x: 0, y: 0, text: "DIGITAL SYSTEM MOCKUPS", fill: palette.red, size: 32, spacing: 6 })}
    <text class="xl" x="0" y="142" fill="${palette.ink}" font-size="118">Interface type, retail pace.</text>
  </g>
  ${browserFrame({
    x: 118,
    y: 342,
    w: 1360,
    h: 832,
    content: `
      <rect x="24" y="30" width="1312" height="120" rx="24" fill="${palette.red}"/>
      <rect x="24" y="112" width="1312" height="38" fill="${palette.red}"/>
      <text class="xl" x="72" y="104" fill="#fffaf2" font-size="58">Longs Drugs</text>
      ${textLine({ x: 988, y: 96, text: "Weekly Ad / Stores", maxWidth: 300, fill: "#fffaf2", size: 28, min: 20, cls: "med", opacity: 0.9 })}
      ${imageBlock({ id: "digital-browser-img", uri: longsImages.weeklyHero, x: 708, y: 190, w: 574, h: 314, r: 26 })}
      <text class="med" x="78" y="238" fill="${palette.red}" font-size="30" letter-spacing="4">TODAY AT LONGS</text>
      <text class="xl" x="76" y="342" fill="${palette.ink}" font-size="86">Find savings</text>
      <text class="xl" x="76" y="426" fill="${palette.ink}" font-size="86">faster.</text>
      ${priceTag({ x: 78, y: 548, w: 278, h: 224, headline: "TODAY", price: "$4.99", sub: "with card", color: palette.red })}
      ${priceTag({ x: 398, y: 548, w: 278, h: 224, headline: "LOCAL", price: "2/$8", sub: "selected", color: palette.green })}
      ${priceTag({ x: 718, y: 548, w: 278, h: 224, headline: "CARE", price: "24/7", sub: "online", color: palette.blue })}
    `,
  })}
  ${phoneFrame({
    x: 1624,
    y: 232,
    w: 560,
    h: 932,
    content: `
      <rect x="18" y="24" width="524" height="132" rx="32" fill="${palette.red}"/>
      <text class="xl" x="56" y="104" fill="#fffaf2" font-size="50">Longs</text>
      <text class="med" x="56" y="220" fill="${palette.ink}" font-size="36">Store near you</text>
      <text class="xl" x="56" y="314" fill="${palette.ink}" font-size="64">Kahala Mall</text>
      <text class="reg" x="58" y="368" fill="${palette.muted}" font-size="30">Open until 10 PM</text>
      <rect x="56" y="430" width="448" height="142" rx="22" fill="#f0e6d7"/>
      ${textLine({ x: 88, y: 492, text: "Pickup ready", maxWidth: 384, fill: palette.red, size: 35, cls: "bold" })}
      ${textLine({ x: 88, y: 540, text: "Order #4821", maxWidth: 384, fill: palette.ink, size: 29, cls: "reg" })}
      <rect x="56" y="624" width="448" height="92" rx="46" fill="${palette.green}"/>
      <text class="bold" x="138" y="683" fill="#fffaf2" font-size="34">Get directions</text>
      <text class="reg" x="56" y="796" fill="${palette.muted}" font-size="28">Aa Bb Cc 123</text>
      ${textLine({ x: 56, y: 852, text: "Bold Italic alert", maxWidth: 448, fill: palette.red, size: 34, cls: "bolditalic" })}
    `,
  })}`,
});

const gallery06 = svgShell({
  width: 2400,
  height: 1600,
  bg: "#eee5d8",
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.32"/>
  <rect x="0" y="0" width="2400" height="310" fill="url(#greenPanel)"/>
  <text class="xl" x="1520" y="284" fill="#fffaf2" font-size="230" opacity="0.09">WEB</text>
  <g transform="translate(118 118)">
    ${label({ x: 0, y: 0, text: "WEBSITE TYPE-IN-USE STUDY", fill: palette.yellow, size: 32, spacing: 6 })}
    <text class="xl" x="0" y="150" fill="#fffaf2" font-size="124">Homepage modules in LD Sans.</text>
  </g>
  ${browserFrame({
    x: 112,
    y: 390,
    w: 1540,
    h: 980,
    content: `
      <rect x="24" y="30" width="1492" height="116" rx="24" fill="${palette.red}"/>
      <rect x="24" y="110" width="1492" height="36" fill="${palette.red}"/>
      <text class="xl" x="72" y="104" fill="#fffaf2" font-size="58">Longs Drugs</text>
      ${textLine({ x: 1020, y: 96, text: "Weekly ad / Pharmacy / Stores", maxWidth: 430, fill: "#fffaf2", size: 28, min: 20, cls: "med", opacity: 0.9 })}
      <g transform="translate(64 192)">
        ${imageBlock({ id: "homepage-hero-img", uri: longsImages.weeklyHero, x: 618, y: 0, w: 790, h: 390, r: 28 })}
        <rect x="0" y="0" width="780" height="390" rx="28" fill="#fff7df" opacity="0.94"/>
        <text class="med" x="54" y="76" fill="${palette.red}" font-size="30" letter-spacing="4">LOCAL WEEKLY SAVINGS</text>
        <text class="xl" x="52" y="178" fill="${palette.ink}" font-size="86">Your Longs,</text>
        <text class="xl" x="52" y="262" fill="${palette.ink}" font-size="86">closer home.</text>
        <rect x="56" y="310" width="250" height="62" rx="31" fill="${palette.red}"/>
        <text class="bold" x="104" y="350" fill="#fffaf2" font-size="27">Shop deals</text>
      </g>
      <g transform="translate(64 636)">
        ${imageBlock({ id: "homepage-card-extra", uri: longsImages.extraCare, x: 0, y: 0, w: 390, h: 206, r: 20, filter: "url(#tightShadow)" })}
        ${imageBlock({ id: "homepage-card-vaccine", uri: longsImages.vaccine, x: 468, y: 0, w: 390, h: 206, r: 20, filter: "url(#tightShadow)" })}
        ${imageBlock({ id: "homepage-card-rx", uri: longsImages.rx, x: 936, y: 0, w: 390, h: 206, r: 20, filter: "url(#tightShadow)" })}
        ${textLine({ x: 0, y: 270, text: "ExtraCare", maxWidth: 390, fill: palette.ink, size: 42, cls: "bold" })}
        ${textLine({ x: 468, y: 270, text: "Vaccines", maxWidth: 390, fill: palette.ink, size: 42, cls: "bold" })}
        ${textLine({ x: 936, y: 270, text: "Pharmacy", maxWidth: 390, fill: palette.ink, size: 42, cls: "bold" })}
        ${textLine({ x: 0, y: 318, text: "Savings", maxWidth: 390, fill: palette.muted, size: 27, cls: "reg" })}
        ${textLine({ x: 468, y: 318, text: "Care access", maxWidth: 390, fill: palette.muted, size: 27, cls: "reg" })}
        ${textLine({ x: 936, y: 318, text: "Pickup tools", maxWidth: 390, fill: palette.muted, size: 27, cls: "reg" })}
      </g>
    `,
  })}
  ${phoneFrame({
    x: 1762,
    y: 482,
    w: 486,
    h: 820,
    content: `
      ${imageBlock({ id: "homepage-phone-img", uri: longsImages.appDeals, x: 30, y: 48, w: 426, h: 350, r: 26 })}
      <text class="med" x="48" y="462" fill="${palette.red}" font-size="27" letter-spacing="3">MOBILE PROMO</text>
      <text class="xl" x="48" y="548" fill="${palette.ink}" font-size="58">Deals of</text>
      <text class="xl" x="48" y="606" fill="${palette.ink}" font-size="58">the Week</text>
      <text class="reg" x="50" y="660" fill="${palette.muted}" font-size="27">Compact and readable.</text>
      <rect x="48" y="708" width="238" height="58" rx="29" fill="${palette.red}"/>
      <text class="bold" x="84" y="746" fill="#fffaf2" font-size="25">Shop deals</text>
    `,
  })}`,
});

const gallery07 = svgShell({
  width: 2400,
  height: 1600,
  bg: "#f4efe6",
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.34"/>
  <rect x="0" y="0" width="710" height="1600" fill="url(#greenPanel)"/>
  <text class="xl" x="-40" y="1448" fill="#fffaf2" font-size="460" opacity="0.11">MAP</text>
  <g transform="translate(120 118)">
    ${label({ x: 0, y: 0, text: "STORE FINDER EXPERIENCE", fill: palette.yellow, size: 32, spacing: 6 })}
    <text class="xl" x="-70" y="150" fill="#fffaf2" font-size="118">Utility</text>
    <text class="xl" x="-70" y="264" fill="#fffaf2" font-size="98">pages need</text>
    <text class="xl" x="-70" y="380" fill="#fffaf2" font-size="118">warmth.</text>
  </g>
  ${browserFrame({
    x: 610,
    y: 300,
    w: 1580,
    h: 1018,
    content: `
      <rect x="24" y="30" width="1532" height="112" rx="24" fill="${palette.red}"/>
      <rect x="24" y="106" width="1532" height="36" fill="${palette.red}"/>
      <text class="xl" x="72" y="102" fill="#fffaf2" font-size="56">Find a Longs Drugs</text>
      ${textLine({ x: 1180, y: 94, text: "Open now / Pharmacy", maxWidth: 320, fill: "#fffaf2", size: 27, min: 18, cls: "med", opacity: 0.9 })}
      ${imageBlock({ id: "store-finder-hero", uri: longsImages.storeFinder, x: 64, y: 190, w: 650, h: 360, r: 26, filter: "url(#tightShadow)" })}
      <g transform="translate(772 190)">
        <text class="med" x="0" y="32" fill="${palette.red}" font-size="29" letter-spacing="4">LOCATION SEARCH</text>
        <text class="xl" x="0" y="118" fill="${palette.ink}" font-size="76">Stores near you</text>
        <rect x="0" y="174" width="650" height="78" rx="39" fill="#f0e7d9" stroke="#d4c5b3" stroke-width="2"/>
        <text class="reg" x="36" y="226" fill="${palette.muted}" font-size="31">Search by ZIP or island</text>
        <rect x="0" y="294" width="236" height="70" rx="35" fill="${palette.red}"/>
        <text class="bold" x="56" y="340" fill="#fffaf2" font-size="31">Search</text>
      </g>
      <g transform="translate(64 638)">
        ${roundedRect({ x: 0, y: 0, w: 430, h: 236, r: 22, fill: "#f8f1e8", stroke: "#dacdbc", sw: 2, filter: "url(#tightShadow)" })}
        ${textLine({ x: 32, y: 62, text: "Kahala Mall", maxWidth: 364, fill: palette.ink, size: 39, cls: "bold" })}
        <text class="reg" x="34" y="110" fill="${palette.muted}" font-size="27">Open until 10 PM</text>
        <text class="med" x="34" y="166" fill="${palette.green}" font-size="29">Pharmacy open</text>
        ${roundedRect({ x: 284, y: 148, w: 112, h: 50, r: 25, fill: palette.red })}
        <text class="bold" x="312" y="181" fill="#fffaf2" font-size="22">Map</text>
        ${roundedRect({ x: 506, y: 0, w: 430, h: 236, r: 22, fill: "#f8f1e8", stroke: "#dacdbc", sw: 2, filter: "url(#tightShadow)" })}
        ${textLine({ x: 538, y: 62, text: "Pearl City", maxWidth: 364, fill: palette.ink, size: 39, cls: "bold" })}
        <text class="reg" x="540" y="110" fill="${palette.muted}" font-size="27">Pickup available</text>
        <text class="med" x="540" y="166" fill="${palette.blue}" font-size="29">Weekly ad store</text>
        ${roundedRect({ x: 790, y: 148, w: 112, h: 50, r: 25, fill: palette.red })}
        <text class="bold" x="818" y="181" fill="#fffaf2" font-size="22">Map</text>
        ${roundedRect({ x: 1012, y: 0, w: 430, h: 236, r: 22, fill: "#f8f1e8", stroke: "#dacdbc", sw: 2, filter: "url(#tightShadow)" })}
        ${textLine({ x: 1044, y: 62, text: "Hilo", maxWidth: 364, fill: palette.ink, size: 39, cls: "bold" })}
        <text class="reg" x="1046" y="110" fill="${palette.muted}" font-size="27">Local services</text>
        <text class="med" x="1046" y="166" fill="${palette.green}" font-size="29">Hours today</text>
        ${roundedRect({ x: 1296, y: 148, w: 112, h: 50, r: 25, fill: palette.red })}
        <text class="bold" x="1324" y="181" fill="#fffaf2" font-size="22">Map</text>
      </g>
    `,
  })}
  ${phoneFrame({
    x: 140,
    y: 520,
    w: 430,
    h: 760,
    content: `
      <rect x="18" y="24" width="394" height="118" rx="32" fill="${palette.red}"/>
      <text class="xl" x="52" y="96" fill="#fffaf2" font-size="44">Stores</text>
      <text class="med" x="48" y="206" fill="${palette.ink}" font-size="34">Nearest</text>
      <text class="xl" x="48" y="290" fill="${palette.ink}" font-size="58">Kahala</text>
      <text class="xl" x="48" y="348" fill="${palette.ink}" font-size="58">Mall</text>
      <text class="reg" x="50" y="400" fill="${palette.muted}" font-size="25">4211 Waialae Ave.</text>
      <rect x="48" y="464" width="334" height="108" rx="22" fill="#f0e7d9"/>
      ${textLine({ x: 78, y: 514, text: "Open until 10 PM", maxWidth: 274, fill: palette.red, size: 30, min: 22, cls: "bold" })}
      <text class="reg" x="80" y="552" fill="${palette.ink}" font-size="23">Pharmacy / pickup</text>
      <rect x="48" y="624" width="334" height="82" rx="41" fill="${palette.green}"/>
      <text class="bold" x="112" y="677" fill="#fffaf2" font-size="29">Directions</text>
    `,
  })}`,
});

const gallery08 = svgShell({
  width: 2400,
  height: 1350,
  bg: "#ebe2d4",
  content: `
  <rect width="2400" height="1350" fill="url(#grid)" opacity="0.3"/>
  <rect x="0" y="0" width="2400" height="1350" fill="${palette.red}" opacity="0.08"/>
  <g transform="translate(112 100)">
    ${label({ x: 0, y: 0, text: "WEEKLY AD WEB MOCKUP", fill: palette.red, size: 32, spacing: 6 })}
    <text class="xl" x="0" y="142" fill="${palette.ink}" font-size="116">High-impact offer language.</text>
  </g>
  ${browserFrame({
    x: 112,
    y: 306,
    w: 1538,
    h: 838,
    content: `
      ${imageBlock({ id: "weekly-web-hero", uri: longsImages.weeklyHero, x: 24, y: 30, w: 1490, h: 780, r: 24 })}
      <rect x="24" y="30" width="720" height="780" rx="24" fill="#fff7df" opacity="0.94"/>
      <text class="med" x="82" y="118" fill="${palette.red}" font-size="31" letter-spacing="4">THIS WEEK AT LONGS</text>
      <text class="xl" x="78" y="244" fill="${palette.ink}" font-size="98">Weekly ad</text>
      <text class="xl" x="78" y="338" fill="${palette.ink}" font-size="98">without</text>
      <text class="xl" x="78" y="432" fill="${palette.ink}" font-size="98">the noise.</text>
      <rect x="84" y="560" width="276" height="72" rx="36" fill="${palette.red}"/>
      <text class="bold" x="132" y="607" fill="#fffaf2" font-size="30">View ad</text>
      ${priceTag({ x: 430, y: 548, w: 246, h: 236, headline: "LOCAL", price: "2/$5", sub: "with card", color: palette.green })}
    `,
  })}
  ${phoneFrame({
    x: 1744,
    y: 214,
    w: 486,
    h: 874,
    content: `
      ${imageBlock({ id: "weekly-phone-img", uri: longsImages.weeklyMobile, x: 30, y: 48, w: 426, h: 280, r: 26 })}
      <text class="med" x="48" y="398" fill="${palette.red}" font-size="27" letter-spacing="3">MOBILE WEEKLY AD</text>
      <text class="xl" x="48" y="484" fill="${palette.ink}" font-size="60">Oahu</text>
      <text class="xl" x="48" y="544" fill="${palette.ink}" font-size="60">savings</text>
      ${priceTag({ x: 48, y: 606, w: 184, h: 168, headline: "AD", price: "$4.99", sub: "today", color: palette.red })}
      ${priceTag({ x: 252, y: 606, w: 184, h: 168, headline: "BUY", price: "50%", sub: "select", color: palette.blue })}
    `,
  })}
  <g transform="translate(112 1212)">
    <text class="italic" x="0" y="0" fill="${palette.blue}" font-size="42">The same family moves from campaign hero scale to compact mobile deal labels.</text>
  </g>`,
});

await writeImage("cover.webp", cover, { width: 2400, height: 1600, quality: 92 });
await writeImage("gallery-01.webp", gallery01, { width: 2400, height: 1600, quality: 92 });
await writeImage("gallery-02.webp", gallery02, { width: 1600, height: 2200, quality: 92 });
await writeImage("gallery-03.webp", gallery03, { width: 1800, height: 1800, quality: 92 });
await writeImage("gallery-04.webp", gallery04, { width: 2400, height: 1600, quality: 92 });
await writeImage("gallery-05.webp", gallery05, { width: 2400, height: 1350, quality: 92 });
await writeImage("gallery-06.webp", gallery06, { width: 2400, height: 1600, quality: 92 });
await writeImage("gallery-07.webp", gallery07, { width: 2400, height: 1600, quality: 92 });
await writeImage("gallery-08.webp", gallery08, { width: 2400, height: 1350, quality: 92 });
