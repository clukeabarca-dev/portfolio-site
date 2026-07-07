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
  red: "#d71920",
  redDark: "#9e1419",
  ink: "#111315",
  charcoal: "#27302d",
  green: "#1d5a42",
  greenDeep: "#173c30",
  blue: "#2b607c",
  yellow: "#f3c64d",
  coral: "#ef8b72",
  muted: "#7b7468",
  line: "#d9cfbf",
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#111315" flood-opacity="0.16"/>
    </filter>
    <filter id="tightShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#111315" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="redPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ed262c"/>
      <stop offset="1" stop-color="#a90f16"/>
    </linearGradient>
    <linearGradient id="greenPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#277454"/>
      <stop offset="1" stop-color="#12362b"/>
    </linearGradient>
    <linearGradient id="paperSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.42"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#c7b9a6" stop-opacity="0.22"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#bdaea0" stroke-width="1" opacity="0.28"/>
    </pattern>
    <pattern id="microDots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.3" fill="#ffffff" opacity="0.16"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${bg}"/>
  ${content}
</svg>`;
}

function label({ x, y, text, fill = palette.muted, size = 25, cls = "med", spacing = 3 }) {
  return `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-size="${size}" letter-spacing="${spacing}">${esc(text)}</text>`;
}

function paragraph({ x, y, lines, fill = palette.charcoal, size = 38, cls = "reg", leading = 48 }) {
  return `<text class="${cls}" x="${x}" y="${y}" fill="${fill}" font-size="${size}">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : leading}">${esc(line)}</tspan>`).join("")}
  </text>`;
}

function roundedRect({ x, y, w, h, r = 28, fill = palette.paper, stroke = "none", sw = 0, opacity = 1, filter = "" }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" ${filter ? `filter="${filter}"` : ""}/>`;
}

function priceTag({ x, y, w, h, headline, price, sub, color = palette.red }) {
  const priceSize = Math.min(h * 0.38, ((w - 54) / Math.max(price.length, 3)) * 1.75);
  return `<g transform="translate(${x} ${y})" filter="url(#tightShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 18, fill: palette.paper, stroke: "#cbbcab", sw: 2 })}
    <rect x="0" y="0" width="${w}" height="72" rx="18" fill="${color}"/>
    <rect x="0" y="52" width="${w}" height="22" fill="${color}"/>
    <text class="bold" x="28" y="46" fill="#fffaf2" font-size="31">${esc(headline)}</text>
    <text class="xl" x="28" y="${h - 72}" fill="${palette.ink}" font-size="${priceSize}">${esc(price)}</text>
    <text class="med" x="34" y="${h - 30}" fill="${palette.muted}" font-size="27">${esc(sub)}</text>
  </g>`;
}

function shelfBox({ x, y, w, h, labelText, color, product, meta }) {
  const productSize = Math.min(h * 0.17, ((w - 56) / Math.max(product.length, 5)) * 1.8);
  return `<g transform="translate(${x} ${y})" filter="url(#tightShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 16, fill: "#f0e6d7", stroke: "#d2c4b3", sw: 2 })}
    <rect x="0" y="0" width="${w}" height="${h * 0.26}" rx="16" fill="${color}"/>
    <rect x="0" y="${h * 0.18}" width="${w}" height="${h * 0.1}" fill="${color}"/>
    <text class="xl" x="28" y="${h * 0.17}" fill="#fffaf2" font-size="${h * 0.14}">${esc(labelText)}</text>
    <text class="bold" x="28" y="${h * 0.48}" fill="${palette.ink}" font-size="${productSize}">${esc(product)}</text>
    <text class="reg" x="30" y="${h * 0.63}" fill="${palette.muted}" font-size="${h * 0.07}">${esc(meta)}</text>
    <rect x="28" y="${h * 0.74}" width="${w - 56}" height="${h * 0.08}" rx="${h * 0.04}" fill="#d8cfbf"/>
    <rect x="28" y="${h * 0.86}" width="${w * 0.46}" height="${h * 0.055}" rx="${h * 0.027}" fill="#d8cfbf"/>
  </g>`;
}

function specimenRow({ y, cls, labelText, sample, weight, size = 96 }) {
  return `<g transform="translate(0 ${y})">
    <text class="med" x="142" y="6" fill="${palette.muted}" font-size="27" letter-spacing="2">${esc(labelText)}</text>
    <text class="reg" x="142" y="48" fill="${palette.muted}" font-size="24">${esc(weight)}</text>
    <line x1="142" y1="82" x2="2220" y2="82" stroke="${palette.line}" stroke-width="2"/>
    <text class="${cls}" x="458" y="62" fill="${palette.ink}" font-size="${size}">${esc(sample)}</text>
  </g>`;
}

function phoneFrame({ x, y, w, h, content }) {
  return `<g transform="translate(${x} ${y})" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w, h, r: 42, fill: "#101412" })}
    ${roundedRect({ x: 18, y: 24, w: w - 36, h: h - 48, r: 32, fill: palette.paper })}
    ${content}
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

function imageBlock({ id, uri, x, y, w, h, r = 24, opacity = 1, filter = "", preserve = "xMidYMid slice" }) {
  return `<g transform="translate(${x} ${y})" opacity="${opacity}" ${filter ? `filter="${filter}"` : ""}>
    <clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}"/></clipPath>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="#e9dfd0"/>
    <image href="${uri}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="${preserve}" clip-path="url(#${id})"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="url(#paperSheen)" opacity="0.16"/>
  </g>`;
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
  <rect x="0" y="0" width="2400" height="1600" fill="url(#grid)" opacity="0.8"/>
  <circle cx="2050" cy="160" r="470" fill="${palette.yellow}" opacity="0.48"/>
  <circle cx="254" cy="1390" r="390" fill="${palette.blue}" opacity="0.16"/>
  <g transform="translate(128 126)">
    ${label({ x: 0, y: 0, text: "TYPEFACE STUDY / LONGS DRUGS", fill: palette.red, size: 30, cls: "bold", spacing: 7 })}
    <text class="xl" x="0" y="220" fill="${palette.ink}" font-size="214">Longs Sans</text>
    <text class="bolditalic" x="4" y="310" fill="${palette.red}" font-size="72">Retail clarity with a local, practical voice.</text>
    ${paragraph({
      x: 8,
      y: 414,
      size: 42,
      leading: 55,
      cls: "reg",
      lines: [
        "A sans serif system for signage, price messaging,",
        "website modules, and everyday store communication.",
      ],
    })}
  </g>
  <g transform="translate(132 682)">
    ${specimenRow({ y: 0, cls: "extra", labelText: "ExtraLight", weight: "200", sample: "Weekly Ads 24/7", size: 90 })}
    ${specimenRow({ y: 166, cls: "light", labelText: "Light", weight: "300", sample: "Pharmacy Pickup", size: 90 })}
    ${specimenRow({ y: 332, cls: "reg", labelText: "Regular", weight: "400", sample: "Hilo Store Hours", size: 90 })}
    ${specimenRow({ y: 498, cls: "med", labelText: "Medium", weight: "500", sample: "ExtraCare Savings", size: 90 })}
    ${specimenRow({ y: 664, cls: "bold", labelText: "Bold", weight: "700", sample: "Local Deals", size: 90 })}
    ${specimenRow({ y: 830, cls: "xl", labelText: "Black", weight: "900", sample: "Aisle 12", size: 90 })}
  </g>
  <g transform="translate(1518 194)">
    ${roundedRect({ x: 0, y: 0, w: 704, h: 372, r: 34, fill: "url(#redPanel)", filter: "url(#softShadow)" })}
    <rect width="704" height="372" rx="34" fill="url(#microDots)"/>
    <text class="xl" x="54" y="146" fill="#fffaf2" font-size="96">Longs</text>
    <text class="xl" x="54" y="236" fill="#fffaf2" font-size="96">Drugs</text>
    <text class="med" x="58" y="310" fill="#fffaf2" font-size="34" opacity="0.82" letter-spacing="2">SIGNAGE SCALE TEST</text>
  </g>
  <g transform="translate(1536 690)">
    ${priceTag({ x: 0, y: 0, w: 318, h: 392, headline: "CLUB PRICE", price: "$7.99", sub: "with card", color: palette.red })}
    ${priceTag({ x: 356, y: 48, w: 318, h: 344, headline: "LOCAL BUY", price: "2/$5", sub: "selected items", color: palette.green })}
  </g>
  <g transform="translate(1528 1186)">
    ${roundedRect({ x: 0, y: 0, w: 694, h: 186, r: 28, fill: palette.paper, stroke: "#cdbfab", sw: 2, filter: "url(#tightShadow)" })}
    <text class="bold" x="38" y="78" fill="${palette.red}" font-size="40">ABCDEFGHIJKLMNOPQRSTUVWXYZ</text>
    <text class="reg" x="42" y="134" fill="${palette.ink}" font-size="38">0123456789  $ %  /  +  -  ?</text>
  </g>`,
});

const gallery01 = svgShell({
  width: 2400,
  height: 1600,
  bg: palette.paper,
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.54"/>
  <g transform="translate(132 128)">
    ${label({ x: 0, y: 0, text: "LD SANS FAMILY", fill: palette.red, size: 34, cls: "bold", spacing: 7 })}
    <text class="xl" x="0" y="144" fill="${palette.ink}" font-size="130">Weight, width, and voice.</text>
    <text class="reg" x="4" y="224" fill="${palette.muted}" font-size="40">A working specimen for retail hierarchy, compact labels, and display-sized store language.</text>
  </g>
  <g transform="translate(0 426)">
    ${specimenRow({ y: 0, cls: "extra", labelText: "ExtraLight", weight: "200", sample: "aloha essentials", size: 103 })}
    ${specimenRow({ y: 182, cls: "light", labelText: "Light", weight: "300", sample: "pharmacy rewards", size: 103 })}
    ${specimenRow({ y: 364, cls: "reg", labelText: "Regular", weight: "400", sample: "weekly ad circular", size: 103 })}
    ${specimenRow({ y: 546, cls: "med", labelText: "Medium", weight: "500", sample: "store pickup today", size: 103 })}
    ${specimenRow({ y: 728, cls: "bold", labelText: "Bold", weight: "700", sample: "extra savings", size: 103 })}
    ${specimenRow({ y: 910, cls: "xl", labelText: "Black", weight: "900", sample: "LONGS DRUGS", size: 103 })}
  </g>
  <g transform="translate(142 1514)">
    <text class="italic" x="0" y="0" fill="${palette.blue}" font-size="43">Italic: practical emphasis without losing utility.</text>
    <text class="bolditalic" x="982" y="0" fill="${palette.red}" font-size="43">Bold Italic: sale, alert, and campaign tone.</text>
  </g>`,
});

const gallery02 = svgShell({
  width: 1600,
  height: 2200,
  bg: "#ebe2d4",
  content: `
  <rect width="1600" height="2200" fill="url(#grid)" opacity="0.45"/>
  <g transform="translate(96 116)">
    ${label({ x: 0, y: 0, text: "RETAIL SCALE MOCKUP", fill: palette.red, size: 30, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="154" fill="${palette.ink}" font-size="122">Aisle language</text>
    <text class="reg" x="2" y="224" fill="${palette.muted}" font-size="35">Testing hierarchy at the distance of a shelf, door, and promotional endcap.</text>
  </g>
  <g transform="translate(108 390)" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w: 1384, h: 330, r: 28, fill: "url(#redPanel)" })}
    <rect width="1384" height="330" rx="28" fill="url(#microDots)"/>
    <text class="xl" x="70" y="150" fill="#fffaf2" font-size="118">Pharmacy</text>
    <text class="med" x="74" y="230" fill="#fffaf2" font-size="42" opacity="0.84">PICKUP  •  CONSULTATION  •  VACCINES</text>
  </g>
  <g transform="translate(108 820)">
    ${shelfBox({ x: 0, y: 0, w: 420, h: 540, labelText: "HEALTH", color: palette.green, product: "Cold Relief", meta: "Aisle 3 / everyday care" })}
    ${shelfBox({ x: 484, y: 72, w: 420, h: 540, labelText: "BEAUTY", color: palette.coral, product: "Skin Care", meta: "New item callouts" })}
    ${shelfBox({ x: 968, y: 0, w: 420, h: 540, labelText: "SNACKS", color: palette.blue, product: "Island Mix", meta: "Local favorites" })}
  </g>
  <g transform="translate(108 1478)">
    ${priceTag({ x: 0, y: 0, w: 408, h: 420, headline: "EXTRACARE", price: "$12.49", sub: "member price", color: palette.red })}
    ${priceTag({ x: 486, y: 52, w: 408, h: 368, headline: "BUY 1 GET 1", price: "50%", sub: "second item", color: palette.green })}
    ${priceTag({ x: 972, y: 0, w: 408, h: 420, headline: "WEEKLY AD", price: "3/$10", sub: "through Sunday", color: palette.blue })}
  </g>
  <text class="med" x="116" y="2074" fill="${palette.muted}" font-size="30" letter-spacing="4">SPACING / NUMERALS / DISTANCE READABILITY</text>`,
});

const gallery03 = svgShell({
  width: 1800,
  height: 1800,
  bg: palette.paper,
  content: `
  <rect width="1800" height="1800" fill="url(#grid)" opacity="0.66"/>
  <g transform="translate(118 118)">
    ${label({ x: 0, y: 0, text: "GLYPH PROPORTION STUDY", fill: palette.red, size: 30, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="154" fill="${palette.ink}" font-size="118">Forms that hold up.</text>
  </g>
  <g transform="translate(108 408)">
    <line x1="0" y1="0" x2="1584" y2="0" stroke="${palette.red}" stroke-width="6" opacity="0.75"/>
    <line x1="0" y1="234" x2="1584" y2="234" stroke="${palette.blue}" stroke-width="4" opacity="0.45"/>
    <line x1="0" y1="614" x2="1584" y2="614" stroke="${palette.red}" stroke-width="6" opacity="0.75"/>
    <line x1="0" y1="826" x2="1584" y2="826" stroke="${palette.green}" stroke-width="4" opacity="0.38"/>
    <text class="xl" x="72" y="615" fill="${palette.ink}" font-size="650">agR2</text>
    <text class="bolditalic" x="94" y="1070" fill="${palette.red}" font-size="260">a g R 2</text>
  </g>
  <g transform="translate(128 1300)">
    ${roundedRect({ x: 0, y: 0, w: 1544, h: 290, r: 26, fill: "#f1e8da", stroke: "#d0c2ae", sw: 2 })}
    <text class="reg" x="48" y="84" fill="${palette.muted}" font-size="32" letter-spacing="4">DETAIL NOTES</text>
    <text class="med" x="48" y="156" fill="${palette.ink}" font-size="44">Open counters, sturdy curves, and direct numerals support fast retail reading.</text>
    <text class="reg" x="48" y="226" fill="${palette.muted}" font-size="34">Black for store and campaign scale. Regular and Medium for dense digital and shelf information.</text>
  </g>`,
});

const gallery04 = svgShell({
  width: 2400,
  height: 1600,
  bg: "#e9dfd0",
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.38"/>
  <g transform="translate(120 118)">
    ${label({ x: 0, y: 0, text: "PRINT AND PROMOTION MOCKUPS", fill: palette.red, size: 32, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="150" fill="${palette.ink}" font-size="126">Proofs for the store floor.</text>
  </g>
  <g transform="translate(138 360)">
    <g transform="rotate(-3 0 0)" filter="url(#softShadow)">
      ${roundedRect({ x: 0, y: 0, w: 650, h: 900, r: 22, fill: palette.paper })}
      <rect x="0" y="0" width="650" height="222" rx="22" fill="url(#redPanel)"/>
      <rect x="0" y="180" width="650" height="42" fill="${palette.redDark}"/>
      <text class="xl" x="54" y="132" fill="#fffaf2" font-size="96">Weekly Ad</text>
      <text class="bold" x="58" y="326" fill="${palette.ink}" font-size="74">Local deals</text>
      <text class="xl" x="58" y="520" fill="${palette.red}" font-size="168">2/$6</text>
      <text class="reg" x="62" y="622" fill="${palette.muted}" font-size="38">Everyday essentials, clearer pricing, practical rhythm.</text>
      <rect x="58" y="706" width="534" height="28" rx="14" fill="#ded4c4"/>
      <rect x="58" y="768" width="376" height="28" rx="14" fill="#ded4c4"/>
    </g>
    <g transform="translate(720 62) rotate(2)" filter="url(#softShadow)">
      ${roundedRect({ x: 0, y: 0, w: 640, h: 860, r: 22, fill: "#f8f3eb" })}
      <rect x="46" y="50" width="548" height="214" rx="18" fill="url(#greenPanel)"/>
      <text class="xl" x="82" y="178" fill="#fffaf2" font-size="86">Store Pickup</text>
      <text class="med" x="84" y="230" fill="#fffaf2" font-size="29" opacity="0.85" letter-spacing="3">READY TODAY</text>
      <text class="bold" x="48" y="394" fill="${palette.ink}" font-size="66">Signage suite</text>
      <text class="reg" x="50" y="464" fill="${palette.muted}" font-size="36">Directional, promotional, and service moments use one consistent type voice.</text>
      <text class="xl" x="50" y="688" fill="${palette.blue}" font-size="160">A12</text>
    </g>
    <g transform="translate(1448 -16) rotate(-1)" filter="url(#softShadow)">
      ${roundedRect({ x: 0, y: 0, w: 710, h: 940, r: 22, fill: palette.paper })}
      <text class="reg" x="58" y="96" fill="${palette.muted}" font-size="34" letter-spacing="4">BODY COPY TEST</text>
      <text class="xl" x="54" y="236" fill="${palette.ink}" font-size="104">Easy to scan,</text>
      <text class="xl" x="54" y="338" fill="${palette.ink}" font-size="104">hard to miss.</text>
      ${paragraph({
        x: 58,
        y: 458,
        size: 39,
        leading: 54,
        cls: "reg",
        fill: palette.charcoal,
        lines: [
          "Longs Sans keeps words direct at",
          "small sizes while still carrying",
          "enough warmth for promotions,",
          "local campaigns, and service copy.",
        ],
      })}
      <rect x="58" y="764" width="594" height="86" rx="43" fill="${palette.red}"/>
      <text class="bold" x="116" y="820" fill="#fffaf2" font-size="40">Shop weekly ad</text>
    </g>
  </g>`,
});

const gallery05 = svgShell({
  width: 2400,
  height: 1350,
  bg: "#f2eadf",
  content: `
  <rect width="2400" height="1350" fill="url(#grid)" opacity="0.38"/>
  <g transform="translate(120 112)">
    ${label({ x: 0, y: 0, text: "DIGITAL SYSTEM MOCKUPS", fill: palette.red, size: 32, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="142" fill="${palette.ink}" font-size="118">Interface type, retail pace.</text>
  </g>
  <g transform="translate(118 326)" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w: 1340, h: 850, r: 34, fill: "#111315" })}
    ${roundedRect({ x: 24, y: 28, w: 1292, h: 794, r: 24, fill: palette.paper })}
    <rect x="24" y="28" width="1292" height="118" rx="24" fill="${palette.red}"/>
    <rect x="24" y="110" width="1292" height="36" fill="${palette.red}"/>
    <text class="xl" x="72" y="102" fill="#fffaf2" font-size="56">Longs Drugs</text>
    <text class="med" x="918" y="96" fill="#fffaf2" font-size="28" opacity="0.9">Weekly Ad  /  Pharmacy  /  Stores</text>
    <text class="xl" x="78" y="266" fill="${palette.ink}" font-size="82">Find local savings faster.</text>
    <text class="reg" x="82" y="338" fill="${palette.muted}" font-size="36">A digital hierarchy for quick shopping, pickup, and service decisions.</text>
    ${priceTag({ x: 82, y: 424, w: 300, h: 280, headline: "TODAY", price: "$4.99", sub: "with card", color: palette.red })}
    ${priceTag({ x: 430, y: 424, w: 300, h: 280, headline: "LOCAL", price: "2/$8", sub: "selected", color: palette.green })}
    ${priceTag({ x: 778, y: 424, w: 300, h: 280, headline: "CARE", price: "24/7", sub: "online", color: palette.blue })}
    <rect x="82" y="742" width="258" height="46" rx="23" fill="${palette.red}"/>
    <text class="bold" x="124" y="773" fill="#fffaf2" font-size="24">View all deals</text>
  </g>
  ${phoneFrame({
    x: 1608,
    y: 248,
    w: 566,
    h: 932,
    content: `
      <rect x="18" y="24" width="530" height="132" rx="32" fill="${palette.red}"/>
      <text class="xl" x="56" y="104" fill="#fffaf2" font-size="48">Longs</text>
      <text class="med" x="56" y="218" fill="${palette.ink}" font-size="36">Store near you</text>
      <text class="xl" x="56" y="312" fill="${palette.ink}" font-size="64">Kahala Mall</text>
      <text class="reg" x="58" y="366" fill="${palette.muted}" font-size="30">Open until 10 PM</text>
      <rect x="56" y="432" width="454" height="142" rx="22" fill="#f0e6d7"/>
      <text class="bold" x="88" y="492" fill="${palette.red}" font-size="34">Pickup ready</text>
      <text class="reg" x="88" y="540" fill="${palette.ink}" font-size="29">Pharmacy order #4821</text>
      <rect x="56" y="624" width="454" height="92" rx="46" fill="${palette.green}"/>
      <text class="bold" x="138" y="683" fill="#fffaf2" font-size="34">Get directions</text>
      <text class="reg" x="56" y="796" fill="${palette.muted}" font-size="28">Aa Bb Cc 123</text>
      <text class="bolditalic" x="56" y="852" fill="${palette.red}" font-size="33">Bold Italic for timely alerts</text>
    `,
  })}`,
});

const gallery06 = svgShell({
  width: 2400,
  height: 1600,
  bg: "#eee5d8",
  content: `
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.34"/>
  <circle cx="2108" cy="126" r="420" fill="${palette.yellow}" opacity="0.34"/>
  <g transform="translate(120 118)">
    ${label({ x: 0, y: 0, text: "WEBSITE TYPE-IN-USE STUDY", fill: palette.red, size: 32, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="150" fill="${palette.ink}" font-size="124">Homepage modules in LD Sans.</text>
    <text class="reg" x="4" y="220" fill="${palette.muted}" font-size="38">Using Longs prototype imagery to test hero copy, service cards, and promotional calls to action.</text>
  </g>
  <g transform="translate(118 360)" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w: 1510, h: 990, r: 34, fill: "#111315" })}
    ${roundedRect({ x: 24, y: 30, w: 1462, h: 930, r: 24, fill: palette.paper })}
    <rect x="24" y="30" width="1462" height="116" rx="24" fill="${palette.red}"/>
    <rect x="24" y="110" width="1462" height="36" fill="${palette.red}"/>
    <text class="xl" x="72" y="104" fill="#fffaf2" font-size="58">Longs Drugs</text>
    <text class="med" x="974" y="96" fill="#fffaf2" font-size="28" opacity="0.9">Weekly ad  /  Pharmacy  /  ExtraCare  /  Stores</text>
    <g transform="translate(64 192)">
      ${roundedRect({ x: 0, y: 0, w: 1368, h: 360, r: 28, fill: "#f8f1e8" })}
      ${imageBlock({ id: "homepage-hero-img", uri: longsImages.weeklyHero, x: 710, y: 0, w: 658, h: 360, r: 28 })}
      <rect x="0" y="0" width="850" height="360" rx="28" fill="#fff8df" opacity="0.92"/>
      <text class="med" x="54" y="72" fill="${palette.red}" font-size="29" letter-spacing="4">LOCAL WEEKLY SAVINGS</text>
      <text class="xl" x="52" y="164" fill="${palette.ink}" font-size="82">Your Longs,</text>
      <text class="xl" x="52" y="244" fill="${palette.ink}" font-size="82">closer to home.</text>
      <text class="reg" x="56" y="306" fill="${palette.muted}" font-size="31">A warmer retail voice for savings, care, and everyday errands.</text>
    </g>
    <g transform="translate(64 584)">
      ${imageBlock({ id: "homepage-card-extra", uri: longsImages.extraCare, x: 0, y: 0, w: 410, h: 210, r: 20, filter: "url(#tightShadow)" })}
      ${imageBlock({ id: "homepage-card-vaccine", uri: longsImages.vaccine, x: 480, y: 0, w: 410, h: 210, r: 20, filter: "url(#tightShadow)" })}
      ${imageBlock({ id: "homepage-card-rx", uri: longsImages.rx, x: 960, y: 0, w: 410, h: 210, r: 20, filter: "url(#tightShadow)" })}
      <text class="bold" x="0" y="274" fill="${palette.ink}" font-size="40">ExtraCare</text>
      <text class="bold" x="480" y="274" fill="${palette.ink}" font-size="40">Vaccines</text>
      <text class="bold" x="960" y="274" fill="${palette.ink}" font-size="40">Pharmacy</text>
      <text class="reg" x="0" y="322" fill="${palette.muted}" font-size="24">Direct savings language.</text>
      <text class="reg" x="480" y="322" fill="${palette.muted}" font-size="24">Compact service labels.</text>
      <text class="reg" x="960" y="322" fill="${palette.muted}" font-size="24">Practical digital utility.</text>
    </g>
  </g>
  ${phoneFrame({
    x: 1746,
    y: 444,
    w: 486,
    h: 820,
    content: `
      ${imageBlock({ id: "homepage-phone-img", uri: longsImages.appDeals, x: 30, y: 48, w: 426, h: 350, r: 26 })}
      <text class="med" x="48" y="462" fill="${palette.red}" font-size="27" letter-spacing="3">MOBILE PROMO CARD</text>
      <text class="xl" x="48" y="546" fill="${palette.ink}" font-size="58">Deals of</text>
      <text class="xl" x="48" y="604" fill="${palette.ink}" font-size="58">the Week</text>
      <text class="reg" x="50" y="660" fill="${palette.muted}" font-size="27">LD Sans keeps compact digital modules readable.</text>
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
  <rect width="2400" height="1600" fill="url(#grid)" opacity="0.38"/>
  <g transform="translate(120 118)">
    ${label({ x: 0, y: 0, text: "STORE FINDER EXPERIENCE", fill: palette.red, size: 32, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="150" fill="${palette.ink}" font-size="124">Utility pages need warmth.</text>
    <text class="reg" x="4" y="220" fill="${palette.muted}" font-size="38">A type study for search, location cards, map context, and service details.</text>
  </g>
  <g transform="translate(112 346)" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w: 1568, h: 1010, r: 34, fill: "#111315" })}
    ${roundedRect({ x: 24, y: 30, w: 1520, h: 950, r: 24, fill: palette.paper })}
    <rect x="24" y="30" width="1520" height="112" rx="24" fill="${palette.red}"/>
    <rect x="24" y="106" width="1520" height="36" fill="${palette.red}"/>
    <text class="xl" x="72" y="102" fill="#fffaf2" font-size="56">Find a Longs Drugs</text>
    <text class="med" x="1156" y="94" fill="#fffaf2" font-size="27" opacity="0.9">Open now  /  Pharmacy  /  Pickup</text>
    ${imageBlock({ id: "store-finder-hero", uri: longsImages.storeFinder, x: 64, y: 190, w: 660, h: 360, r: 26, filter: "url(#tightShadow)" })}
    <g transform="translate(780 190)">
      <text class="med" x="0" y="32" fill="${palette.red}" font-size="29" letter-spacing="4">LOCATION SEARCH</text>
      <text class="xl" x="0" y="118" fill="${palette.ink}" font-size="74">Stores near you</text>
      <rect x="0" y="172" width="650" height="78" rx="39" fill="#f0e7d9" stroke="#d4c5b3" stroke-width="2"/>
      <text class="reg" x="36" y="224" fill="${palette.muted}" font-size="31">Search by ZIP, city, or island</text>
      <rect x="0" y="292" width="236" height="70" rx="35" fill="${palette.red}"/>
      <text class="bold" x="56" y="338" fill="#fffaf2" font-size="31">Search</text>
    </g>
    <g transform="translate(64 640)">
      ${roundedRect({ x: 0, y: 0, w: 430, h: 236, r: 22, fill: "#f8f1e8", stroke: "#dacdbc", sw: 2, filter: "url(#tightShadow)" })}
      <text class="bold" x="32" y="62" fill="${palette.ink}" font-size="39">Kahala Mall</text>
      <text class="reg" x="34" y="110" fill="${palette.muted}" font-size="27">Open until 10 PM</text>
      <text class="med" x="34" y="166" fill="${palette.green}" font-size="29">Pharmacy open</text>
      ${roundedRect({ x: 284, y: 148, w: 112, h: 50, r: 25, fill: palette.red })}
      <text class="bold" x="312" y="181" fill="#fffaf2" font-size="22">Map</text>
      ${roundedRect({ x: 504, y: 0, w: 430, h: 236, r: 22, fill: "#f8f1e8", stroke: "#dacdbc", sw: 2, filter: "url(#tightShadow)" })}
      <text class="bold" x="536" y="62" fill="${palette.ink}" font-size="39">Pearl City</text>
      <text class="reg" x="538" y="110" fill="${palette.muted}" font-size="27">Pickup available</text>
      <text class="med" x="538" y="166" fill="${palette.blue}" font-size="29">Weekly ad store</text>
      ${roundedRect({ x: 788, y: 148, w: 112, h: 50, r: 25, fill: palette.red })}
      <text class="bold" x="816" y="181" fill="#fffaf2" font-size="22">Map</text>
      ${roundedRect({ x: 1008, y: 0, w: 430, h: 236, r: 22, fill: "#f8f1e8", stroke: "#dacdbc", sw: 2, filter: "url(#tightShadow)" })}
      <text class="bold" x="1040" y="62" fill="${palette.ink}" font-size="39">Hilo</text>
      <text class="reg" x="1042" y="110" fill="${palette.muted}" font-size="27">Local services</text>
      <text class="med" x="1042" y="166" fill="${palette.green}" font-size="29">Store hours today</text>
      ${roundedRect({ x: 1292, y: 148, w: 112, h: 50, r: 25, fill: palette.red })}
      <text class="bold" x="1320" y="181" fill="#fffaf2" font-size="22">Map</text>
    </g>
  </g>
  ${phoneFrame({
    x: 1774,
    y: 440,
    w: 462,
    h: 812,
    content: `
      <rect x="18" y="24" width="426" height="118" rx="32" fill="${palette.red}"/>
      <text class="xl" x="52" y="96" fill="#fffaf2" font-size="44">Stores</text>
      <text class="med" x="48" y="206" fill="${palette.ink}" font-size="35">Nearest location</text>
      <text class="xl" x="48" y="292" fill="${palette.ink}" font-size="58">Kahala</text>
      <text class="xl" x="48" y="350" fill="${palette.ink}" font-size="58">Mall</text>
      <text class="reg" x="50" y="402" fill="${palette.muted}" font-size="26">4211 Waialae Ave.</text>
      <rect x="48" y="466" width="366" height="112" rx="22" fill="#f0e7d9"/>
      <text class="bold" x="78" y="516" fill="${palette.red}" font-size="31">Open until 10 PM</text>
      <text class="reg" x="80" y="554" fill="${palette.ink}" font-size="24">Pharmacy, pickup, photo</text>
      <rect x="48" y="632" width="366" height="82" rx="41" fill="${palette.green}"/>
      <text class="bold" x="124" y="685" fill="#fffaf2" font-size="30">Get directions</text>
    `,
  })}`,
});

const gallery08 = svgShell({
  width: 2400,
  height: 1350,
  bg: "#ebe2d4",
  content: `
  <rect width="2400" height="1350" fill="url(#grid)" opacity="0.34"/>
  <g transform="translate(112 102)">
    ${label({ x: 0, y: 0, text: "WEEKLY AD WEB MOCKUP", fill: palette.red, size: 32, cls: "bold", spacing: 6 })}
    <text class="xl" x="0" y="142" fill="${palette.ink}" font-size="116">High-impact offer language.</text>
  </g>
  <g transform="translate(112 306)" filter="url(#softShadow)">
    ${roundedRect({ x: 0, y: 0, w: 1528, h: 838, r: 34, fill: "#111315" })}
    ${roundedRect({ x: 24, y: 30, w: 1480, h: 780, r: 24, fill: palette.paper })}
    ${imageBlock({ id: "weekly-web-hero", uri: longsImages.weeklyHero, x: 24, y: 30, w: 1480, h: 780, r: 24 })}
    <rect x="24" y="30" width="736" height="780" rx="24" fill="#fff7df" opacity="0.94"/>
    <text class="med" x="82" y="118" fill="${palette.red}" font-size="31" letter-spacing="4">THIS WEEK AT LONGS</text>
    <text class="xl" x="78" y="238" fill="${palette.ink}" font-size="92">Weekly ad</text>
    <text class="xl" x="78" y="328" fill="${palette.ink}" font-size="92">without the</text>
    <text class="xl" x="78" y="418" fill="${palette.ink}" font-size="92">noise.</text>
    <text class="reg" x="84" y="492" fill="${palette.muted}" font-size="35">Large offer type, tighter navigation, and direct category labels.</text>
    <rect x="84" y="584" width="276" height="72" rx="36" fill="${palette.red}"/>
    <text class="bold" x="132" y="631" fill="#fffaf2" font-size="30">View ad</text>
    ${priceTag({ x: 430, y: 560, w: 246, h: 220, headline: "LOCAL", price: "2/$5", sub: "with card", color: palette.green })}
  </g>
  ${phoneFrame({
    x: 1746,
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
  <g transform="translate(112 1192)">
    <text class="italic" x="0" y="0" fill="${palette.blue}" font-size="42">The same type family moves from campaign hero to compact mobile deal labels.</text>
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
