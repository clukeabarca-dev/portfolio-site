const QR_BASE = "/qr-generator";
const COOKIE_NAME = "qr_admin_session";
const SESSION_DAYS = 7;
const MAX_LOGO_BYTES = 240 * 1024;
const LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

let schemaReady = null;

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function htmlPage(title, body, status) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;margin:0;display:grid;min-height:100vh;place-items:center;background:#f4f1ea;color:#111315}.box{max-width:30rem;padding:2rem;text-align:center}h1{font-size:1.35rem;margin:0 0 .5rem}p{line-height:1.6;color:#62645f}</style></head><body><main class="box"><h1>${title}</h1><p>${body}</p></main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

function getD1(env) {
  if (!env.DB) {
    throw new Error("Missing D1 binding DB");
  }
  return env.DB;
}

function getAssets(env) {
  if (!env.QR_ASSETS) {
    throw new Error("Missing R2 binding QR_ASSETS");
  }
  return env.QR_ASSETS;
}

function getAdminPassword(env) {
  return (env.ADMIN_PASSWORD || "").trim();
}

async function hashPassword(password, salt = randomToken(16)) {
  const encoder = new TextEncoder();
  const iterations = 120000;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    key,
    256
  );
  return `${iterations}:${salt}:${base64Url(bits)}`;
}

async function verifyPassword(password, stored) {
  const [iterationsRaw, salt, expected] = String(stored || "").split(":");
  const iterations = Number(iterationsRaw);
  if (!iterations || !salt || !expected) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    key,
    256
  );
  return base64Url(bits) === expected;
}

function base64Url(bytes) {
  const raw = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(raw).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function randomToken(byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sign(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function isValidAdminSession(request, env) {
  const secret = await getAdminSecret(env);
  if (!secret) {
    return false;
  }

  const token = getCookie(request, COOKIE_NAME);
  if (!token) {
    return false;
  }

  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expires || !signature || expires < Date.now()) {
    return false;
  }

  return signature === (await sign(expiresRaw, secret));
}

async function createAdminSessionCookie(request, env) {
  const secret = await getAdminSecret(env);
  if (!secret) {
    return "";
  }

  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${expires}.${await sign(String(expires), secret)}; Path=${QR_BASE}; HttpOnly; SameSite=Lax; Max-Age=${
    SESSION_DAYS * 24 * 60 * 60
  }${secure}`;
}

function clearAdminSessionCookie() {
  return `${COOKIE_NAME}=; Path=${QR_BASE}; HttpOnly; SameSite=Lax; Max-Age=0`;
}

async function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = createSchema(env).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

async function createSchema(env) {
  const db = getD1(env);
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS qr_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      destination_url TEXT NOT NULL,
      fg_color TEXT NOT NULL DEFAULT '#17352f',
      bg_color TEXT NOT NULL DEFAULT '#fbfaf6',
      logo_key TEXT,
      logo_mime TEXT,
      logo_enabled INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS qr_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qr_code_id INTEGER NOT NULL,
      slug TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      country TEXT,
      region TEXT,
      city TEXT,
      device_type TEXT NOT NULL DEFAULT 'unknown',
      browser TEXT NOT NULL DEFAULT 'unknown',
      os TEXT NOT NULL DEFAULT 'unknown',
      referer TEXT,
      user_agent TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS qr_code_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qr_code_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'editor',
      access_key TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(qr_code_id, email)
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS qr_codes_slug_idx ON qr_codes (slug)"),
    db.prepare("CREATE INDEX IF NOT EXISTS qr_scans_code_time_idx ON qr_scans (qr_code_id, scanned_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS qr_scans_time_idx ON qr_scans (scanned_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS qr_code_users_access_idx ON qr_code_users (access_key)"),
    db.prepare("CREATE INDEX IF NOT EXISTS qr_code_users_code_idx ON qr_code_users (qr_code_id)"),
  ]);
  await ensureColumn(db, "qr_codes", "logo_key", "TEXT");
  await ensureColumn(db, "qr_codes", "logo_mime", "TEXT");
  await ensureColumn(db, "qr_codes", "logo_enabled", "INTEGER NOT NULL DEFAULT 0");
}

async function ensureColumn(db, table, column, definition) {
  const { results = [] } = await db.prepare(`PRAGMA table_info(${table})`).all();
  if (!results.some((row) => row.name === column)) {
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

async function getStoredAdminHash(env) {
  const row = await getD1(env)
    .prepare("SELECT value FROM qr_settings WHERE key = 'admin_password_hash'")
    .first();
  return row?.value || "";
}

async function getAdminSecret(env) {
  const envPassword = getAdminPassword(env);
  if (envPassword) {
    return envPassword;
  }
  return getStoredAdminHash(env);
}

async function isAdminConfigured(env) {
  return Boolean(await getAdminSecret(env));
}

async function setAdminPassword(env, password) {
  const trimmed = String(password || "");
  if (trimmed.length < 12) {
    throw new Error("Use an admin password with at least 12 characters.");
  }

  const db = getD1(env);
  const stored = await hashPassword(trimmed);
  await db
    .prepare(
      `INSERT INTO qr_settings (key, value)
       VALUES ('admin_password_hash', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(stored)
    .run();
}

async function seedLongsTestCode(env) {
  const db = getD1(env);
  const existing = await db.prepare("SELECT COUNT(*) AS count FROM qr_codes").first();
  if (Number(existing?.count || 0) > 0) {
    return;
  }

  await db
    .prepare(
      `INSERT INTO qr_codes (name, slug, destination_url, fg_color, bg_color)
       VALUES ('Longs Test QR', 'longs-test', 'https://www.longs.com/', '#17352f', '#fbfaf6')`
    )
    .run();
}

function normalizeSlug(value, fallback = "") {
  const raw = String(value || fallback || randomToken(5));
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);
  return slug || randomToken(5).toLowerCase();
}

function normalizeUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Destination URL is required");
  }
  const raw = value.trim();
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Destination URL must use http or https");
  }
  return url.toString();
}

function normalizeColor(value, fallback) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim().toLowerCase()
    : fallback;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function channelLuminance(value) {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [red, green, blue] = hexToRgb(hex).map(channelLuminance);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function validateQrColors(fgColor, bgColor) {
  const fg = luminance(fgColor);
  const bg = luminance(bgColor);
  const contrast = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);

  if (fg >= bg || contrast < 3) {
    throw new Error("Choose a darker QR color and lighter background with stronger contrast.");
  }
}

function normalizeUser(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  const role = user?.role === "viewer" ? "viewer" : "editor";
  return {
    email,
    role,
    name: String(user?.name || "").trim().slice(0, 120),
  };
}

function toCode(row, users = []) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    destinationUrl: row.destination_url,
    fgColor: row.fg_color,
    bgColor: row.bg_color,
    isActive: row.is_active === 1,
    hasLogo: Boolean(row.logo_key),
    logoEnabled: row.logo_enabled === 1 && Boolean(row.logo_key),
    logoMime: row.logo_mime || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalScans: Number(row.total_scans || 0),
    lastScannedAt: row.last_scanned_at || null,
    users,
  };
}

function toUser(row) {
  return {
    id: row.id,
    qrCodeId: row.qr_code_id,
    email: row.email,
    name: row.name || "",
    role: row.role,
    accessKey: row.access_key,
  };
}

function parseUserAgent(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  return {
    deviceType: /ipad|tablet/.test(ua)
      ? "tablet"
      : /mobile|android|iphone|ipod/.test(ua)
        ? "mobile"
        : "desktop",
    browser: /edg\//.test(ua)
      ? "Edge"
      : /chrome|crios/.test(ua)
        ? "Chrome"
        : /safari/.test(ua) && !/chrome|crios/.test(ua)
          ? "Safari"
          : /firefox|fxios/.test(ua)
            ? "Firefox"
            : /instagram/.test(ua)
              ? "Instagram"
              : /fbav|fban/.test(ua)
                ? "Facebook"
                : "Unknown",
    os: /iphone|ipad|ipod/.test(ua)
      ? "iOS"
      : /android/.test(ua)
        ? "Android"
        : /mac os x|macintosh/.test(ua)
          ? "macOS"
          : /windows/.test(ua)
            ? "Windows"
            : /linux/.test(ua)
              ? "Linux"
              : "Unknown",
  };
}

function clamp(value, maxLength) {
  return value ? String(value).slice(0, maxLength) : null;
}

function routeError(error) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const normalized = message.toLowerCase();
  if (normalized.includes("unique") && normalized.includes("slug")) {
    return "That short slug is already in use.";
  }
  return message;
}

function accessHeader(request) {
  return (request.headers.get("x-qr-access-key") || "").trim();
}

async function authenticate(request, env) {
  await ensureSchema(env);
  if (await isValidAdminSession(request, env)) {
    return { type: "admin" };
  }

  const key = accessHeader(request);
  if (!key) {
    return null;
  }

  const user = await getD1(env)
    .prepare("SELECT * FROM qr_code_users WHERE access_key = ?")
    .bind(key)
    .first();

  return user ? { type: "collaborator", user: toUser(user) } : null;
}

function deny(status, message) {
  return json({ error: message }, { status });
}

function codeScopeClause(auth, tableAlias = "s") {
  if (auth.type === "admin") {
    return { sql: "", args: [] };
  }
  return {
    sql: `WHERE ${tableAlias}.qr_code_id IN (SELECT qr_code_id FROM qr_code_users WHERE access_key = ?)`,
    args: [auth.user.accessKey],
  };
}

async function listUsers(env, codeIds, auth) {
  if (!codeIds.length) {
    return new Map();
  }

  const db = getD1(env);
  let sql = `SELECT * FROM qr_code_users WHERE qr_code_id IN (${codeIds.map(() => "?").join(",")})`;
  let args = codeIds;
  if (auth.type !== "admin") {
    sql += " AND access_key = ?";
    args = [...args, auth.user.accessKey];
  }
  sql += " ORDER BY email ASC";

  const { results = [] } = await db.prepare(sql).bind(...args).all();
  const byCode = new Map();
  for (const row of results) {
    const users = byCode.get(row.qr_code_id) || [];
    users.push(toUser(row));
    byCode.set(row.qr_code_id, users);
  }
  return byCode;
}

async function listCodes(env, auth) {
  const db = getD1(env);
  const collaboratorJoin =
    auth.type === "admin"
      ? ""
      : "JOIN qr_code_users u ON u.qr_code_id = c.id AND u.access_key = ?";
  const args = auth.type === "admin" ? [] : [auth.user.accessKey];
  const { results = [] } = await db
    .prepare(
      `SELECT c.*, COUNT(s.id) AS total_scans, MAX(s.scanned_at) AS last_scanned_at
       FROM qr_codes c
       ${collaboratorJoin}
       LEFT JOIN qr_scans s ON s.qr_code_id = c.id
       GROUP BY c.id
       ORDER BY c.updated_at DESC, c.id DESC`
    )
    .bind(...args)
    .all();

  const codeIds = results.map((row) => row.id);
  const usersByCode = await listUsers(env, codeIds, auth);
  return results.map((row) => toCode(row, usersByCode.get(row.id) || []));
}

async function getCode(env, id, auth) {
  const db = getD1(env);
  const collaboratorJoin =
    auth.type === "admin"
      ? ""
      : "JOIN qr_code_users u ON u.qr_code_id = c.id AND u.access_key = ?";
  const args = auth.type === "admin" ? [id] : [auth.user.accessKey, id];
  const row = await db
    .prepare(
      `SELECT c.*, COUNT(s.id) AS total_scans, MAX(s.scanned_at) AS last_scanned_at
       FROM qr_codes c
       ${collaboratorJoin}
       LEFT JOIN qr_scans s ON s.qr_code_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`
    )
    .bind(...args)
    .first();

  if (!row) {
    return null;
  }

  const usersByCode = await listUsers(env, [row.id], auth);
  return toCode(row, usersByCode.get(row.id) || []);
}

async function getCodeBySlug(env, slug) {
  const row = await getD1(env)
    .prepare("SELECT * FROM qr_codes WHERE slug = ?")
    .bind(slug)
    .first();
  return row ? toCode(row, []) : null;
}

async function syncAssignedUsers(env, qrCodeId, users) {
  const db = getD1(env);
  const normalizedUsers = users.map(normalizeUser).filter(Boolean);
  const emails = normalizedUsers.map((user) => user.email);
  const existingRows = (
    await db.prepare("SELECT * FROM qr_code_users WHERE qr_code_id = ?").bind(qrCodeId).all()
  ).results || [];
  const existingByEmail = new Map(existingRows.map((row) => [row.email, row]));

  if (emails.length) {
    await db
      .prepare(
        `DELETE FROM qr_code_users
         WHERE qr_code_id = ? AND email NOT IN (${emails.map(() => "?").join(",")})`
      )
      .bind(qrCodeId, ...emails)
      .run();
  } else {
    await db.prepare("DELETE FROM qr_code_users WHERE qr_code_id = ?").bind(qrCodeId).run();
  }

  for (const user of normalizedUsers) {
    const existing = existingByEmail.get(user.email);
    await db
      .prepare(
        `INSERT INTO qr_code_users (qr_code_id, email, name, role, access_key)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(qr_code_id, email) DO UPDATE SET
           name = excluded.name,
           role = excluded.role,
           updated_at = CURRENT_TIMESTAMP`
      )
      .bind(qrCodeId, user.email, user.name, user.role, existing?.access_key || randomToken(24))
      .run();
  }
}

async function createCode(env, payload, auth) {
  if (auth.type !== "admin") {
    throw new Error("Only admins can create QR codes");
  }

  const db = getD1(env);
  const name = String(payload.name || "Untitled QR").trim().slice(0, 120) || "Untitled QR";
  const destinationUrl = normalizeUrl(payload.destinationUrl);
  const slug = normalizeSlug(payload.slug, name);
  const fgColor = normalizeColor(payload.fgColor, "#17352f");
  const bgColor = normalizeColor(payload.bgColor, "#fbfaf6");
  validateQrColors(fgColor, bgColor);
  const insert = await db
    .prepare(
      `INSERT INTO qr_codes (name, slug, destination_url, fg_color, bg_color)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(name, slug, destinationUrl, fgColor, bgColor)
    .run();

  const id = insert.meta?.last_row_id;
  if (Array.isArray(payload.users)) {
    await syncAssignedUsers(env, id, payload.users);
  }

  return getCode(env, id, auth);
}

async function updateCode(env, id, payload, auth) {
  const db = getD1(env);
  const existing = await getCode(env, id, auth);
  if (!existing) {
    return null;
  }

  const name = String(payload.name || existing.name).trim().slice(0, 120) || existing.name;
  const destinationUrl =
    payload.destinationUrl !== undefined ? normalizeUrl(payload.destinationUrl) : existing.destinationUrl;
  const fgColor = normalizeColor(payload.fgColor, existing.fgColor);
  const bgColor = normalizeColor(payload.bgColor, existing.bgColor);
  validateQrColors(fgColor, bgColor);
  const isActive =
    typeof payload.isActive === "boolean" ? (payload.isActive ? 1 : 0) : existing.isActive ? 1 : 0;
  const slug =
    auth.type === "admin" && payload.slug !== undefined
      ? normalizeSlug(payload.slug, existing.slug)
      : existing.slug;

  if (auth.type !== "admin") {
    const assignment = existing.users.find((user) => user.accessKey === auth.user.accessKey);
    if (assignment?.role !== "editor") {
      throw new Error("Viewer access cannot edit this QR code");
    }
  }

  await db
    .prepare(
      `UPDATE qr_codes
       SET name = ?, slug = ?, destination_url = ?, fg_color = ?, bg_color = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(name, slug, destinationUrl, fgColor, bgColor, isActive, id)
    .run();

  if (auth.type === "admin" && Array.isArray(payload.users)) {
    await syncAssignedUsers(env, id, payload.users);
  }

  return getCode(env, id, auth);
}

function canEdit(auth, code) {
  if (auth.type === "admin") {
    return true;
  }
  return code.users.some((user) => user.accessKey === auth.user.accessKey && user.role === "editor");
}

async function uploadLogo(env, id, request, auth) {
  const code = await getCode(env, id, auth);
  if (!code) {
    return null;
  }
  if (!canEdit(auth, code)) {
    throw new Error("Viewer access cannot change this QR code image.");
  }

  const form = await request.formData();
  const file = form.get("logo");
  if (!(file instanceof File)) {
    throw new Error("Logo image is required.");
  }
  if (!LOGO_TYPES.has(file.type)) {
    throw new Error("Use a PNG, JPG, WebP, or SVG logo image.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo image must be smaller than 240 KB.");
  }

  const db = getD1(env);
  const existing = await db.prepare("SELECT logo_key FROM qr_codes WHERE id = ?").bind(id).first();
  const key = `qr-logos/${id}/${Date.now()}-${randomToken(6)}`;
  await getAssets(env).put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  if (existing?.logo_key) {
    await getAssets(env).delete(existing.logo_key).catch(() => {});
  }
  await db
    .prepare("UPDATE qr_codes SET logo_key = ?, logo_mime = ?, logo_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(key, file.type, id)
    .run();
  return getCode(env, id, auth);
}

async function deleteLogo(env, id, auth) {
  const code = await getCode(env, id, auth);
  if (!code) {
    return null;
  }
  if (!canEdit(auth, code)) {
    throw new Error("Viewer access cannot change this QR code image.");
  }

  const db = getD1(env);
  const existing = await db.prepare("SELECT logo_key FROM qr_codes WHERE id = ?").bind(id).first();
  if (existing?.logo_key) {
    await getAssets(env).delete(existing.logo_key).catch(() => {});
  }
  await db
    .prepare("UPDATE qr_codes SET logo_key = NULL, logo_mime = NULL, logo_enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();
  return getCode(env, id, auth);
}

async function getLogo(env, id, auth) {
  const code = await getCode(env, id, auth);
  if (!code || !code.hasLogo) {
    return null;
  }
  const row = await getD1(env).prepare("SELECT logo_key, logo_mime FROM qr_codes WHERE id = ?").bind(id).first();
  if (!row?.logo_key) {
    return null;
  }
  const object = await getAssets(env).get(row.logo_key);
  if (!object) {
    return null;
  }
  return new Response(object.body, {
    headers: {
      "Content-Type": row.logo_mime || object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}

async function deleteCode(env, id, auth) {
  if (auth.type !== "admin") {
    throw new Error("Only admins can delete QR codes");
  }

  const db = getD1(env);
  await db.batch([
    db.prepare("DELETE FROM qr_scans WHERE qr_code_id = ?").bind(id),
    db.prepare("DELETE FROM qr_code_users WHERE qr_code_id = ?").bind(id),
    db.prepare("DELETE FROM qr_codes WHERE id = ?").bind(id),
  ]);
}

async function dashboard(env, auth) {
  const db = getD1(env);
  const codes = await listCodes(env, auth);
  const scope = codeScopeClause(auth, "s");
  const codeIds = codes.map((code) => code.id);

  if (auth.type !== "admin" && !codeIds.length) {
    return emptyDashboard();
  }

  const countRows = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM qr_scans s ${scope.sql}`).bind(...scope.args).first(),
    db
      .prepare(`SELECT COUNT(*) AS count FROM qr_scans s ${scope.sql ? `${scope.sql} AND` : "WHERE"} date(scanned_at) = date('now')`)
      .bind(...scope.args)
      .first(),
    db
      .prepare(
        `SELECT date(scanned_at) AS day, COUNT(*) AS scans
         FROM qr_scans s
         ${scope.sql}
         ${scope.sql ? "AND" : "WHERE"} scanned_at >= datetime('now', '-13 days')
         GROUP BY date(scanned_at)
         ORDER BY day ASC`
      )
      .bind(...scope.args)
      .all(),
    db
      .prepare(
        `SELECT device_type AS label, COUNT(*) AS scans
         FROM qr_scans s
         ${scope.sql}
         GROUP BY device_type
         ORDER BY scans DESC
         LIMIT 6`
      )
      .bind(...scope.args)
      .all(),
    db
      .prepare(
        `SELECT browser AS label, COUNT(*) AS scans
         FROM qr_scans s
         ${scope.sql}
         GROUP BY browser
         ORDER BY scans DESC
         LIMIT 6`
      )
      .bind(...scope.args)
      .all(),
    db
      .prepare(
        `SELECT COALESCE(country, 'Unknown') AS label, COUNT(*) AS scans
         FROM qr_scans s
         ${scope.sql}
         GROUP BY COALESCE(country, 'Unknown')
         ORDER BY scans DESC
         LIMIT 6`
      )
      .bind(...scope.args)
      .all(),
    db
      .prepare(
        `SELECT s.*, c.name
         FROM qr_scans s
         JOIN qr_codes c ON c.id = s.qr_code_id
         ${scope.sql}
         ORDER BY s.scanned_at DESC, s.id DESC
         LIMIT 30`
      )
      .bind(...scope.args)
      .all(),
  ]);

  const totalScans = Number(countRows[0]?.count || 0);
  const scansToday = Number(countRows[1]?.count || 0);
  return {
    codes,
    metrics: {
      totalCodes: codes.length,
      activeCodes: codes.filter((code) => code.isActive).length,
      totalScans,
      scansToday,
      topCode: codes.reduce((winner, code) => (!winner || code.totalScans > winner.totalScans ? code : winner), null),
    },
    dailyScans: fillLastTwoWeeks(countRows[2]?.results || []),
    deviceBreakdown: normalizeBreakdown(countRows[3]?.results || []),
    browserBreakdown: normalizeBreakdown(countRows[4]?.results || []),
    countryBreakdown: normalizeBreakdown(countRows[5]?.results || []),
    recentScans: (countRows[6]?.results || []).map((row) => ({
      id: row.id,
      qrCodeId: row.qr_code_id,
      name: row.name,
      slug: row.slug,
      destinationUrl: row.destination_url,
      scannedAt: row.scanned_at,
      country: row.country,
      region: row.region,
      city: row.city,
      deviceType: row.device_type,
      browser: row.browser,
      os: row.os,
      referer: row.referer,
    })),
  };
}

function emptyDashboard() {
  return {
    codes: [],
    metrics: {
      totalCodes: 0,
      activeCodes: 0,
      totalScans: 0,
      scansToday: 0,
      topCode: null,
    },
    dailyScans: fillLastTwoWeeks([]),
    deviceBreakdown: [],
    browserBreakdown: [],
    countryBreakdown: [],
    recentScans: [],
  };
}

function fillLastTwoWeeks(rows) {
  const byDay = new Map(rows.map((row) => [row.day, Number(row.scans)]));
  const days = [];
  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index);
    const day = date.toISOString().slice(0, 10);
    days.push({ day, scans: byDay.get(day) || 0 });
  }
  return days;
}

function normalizeBreakdown(rows) {
  return rows.map((row) => ({ label: row.label || "Unknown", scans: Number(row.scans || 0) }));
}

async function recordScan(env, code, request) {
  const db = getD1(env);
  const cf = request.cf || {};
  const userAgent = clamp(request.headers.get("user-agent"), 500);
  const parsed = parseUserAgent(userAgent);
  await db
    .prepare(
      `INSERT INTO qr_scans (
        qr_code_id, slug, destination_url, country, region, city,
        device_type, browser, os, referer, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      code.id,
      code.slug,
      code.destinationUrl,
      clamp(cf.country || request.headers.get("cf-ipcountry"), 80),
      clamp(cf.region || request.headers.get("cf-region"), 120),
      clamp(cf.city || request.headers.get("cf-city"), 120),
      parsed.deviceType,
      parsed.browser,
      parsed.os,
      clamp(request.headers.get("referer"), 500),
      userAgent
    )
    .run();
}

async function handleSession(request, env) {
  if (request.method === "GET") {
    const auth = await authenticate(request, env);
    const configured = await isAdminConfigured(env);
    return json({
      authenticated: Boolean(auth),
      role: auth?.type || null,
      passwordConfigured: configured,
      setupRequired: !configured,
      accessKeyValid: auth?.type === "collaborator",
    });
  }

  if (request.method === "POST") {
    const payload = await request.json().catch(() => ({}));
    const envPassword = getAdminPassword(env);
    const storedHash = await getStoredAdminHash(env);
    const configured = Boolean(envPassword || storedHash);

    if (!configured) {
      return json(
        {
          error: "Admin setup is required before sign in.",
          authenticated: false,
          setupRequired: true,
        },
        { status: 409 }
      );
    }

    const valid = envPassword
      ? payload.password === envPassword
      : await verifyPassword(payload.password || "", storedHash);

    if (!valid) {
      return json(
        {
          error: "Incorrect password",
          authenticated: false,
          passwordConfigured: configured,
        },
        { status: 401 }
      );
    }

    const headers = new Headers();
    const cookie = await createAdminSessionCookie(request, env);
    if (cookie) {
      headers.set("Set-Cookie", cookie);
    }
    return json({ authenticated: true, role: "admin", passwordConfigured: configured }, { headers });
  }

  if (request.method === "DELETE") {
    return json(
      { authenticated: false, passwordConfigured: await isAdminConfigured(env) },
      { headers: { "Set-Cookie": clearAdminSessionCookie() } }
    );
  }

  return deny(405, "Method not allowed");
}

async function handleApi(request, env, path) {
  try {
    await ensureSchema(env);

    if (path === `${QR_BASE}/api/session`) {
      return handleSession(request, env);
    }

    if (path === `${QR_BASE}/api/setup` && request.method === "POST") {
      if (await isAdminConfigured(env)) {
        return deny(409, "Admin setup is already complete");
      }
      const payload = await request.json().catch(() => ({}));
      await setAdminPassword(env, payload.password);
      await seedLongsTestCode(env);
      const headers = new Headers();
      const cookie = await createAdminSessionCookie(request, env);
      if (cookie) {
        headers.set("Set-Cookie", cookie);
      }
      return json(
        {
          authenticated: true,
          role: "admin",
          passwordConfigured: true,
          setupRequired: false,
        },
        { headers }
      );
    }

    const auth = await authenticate(request, env);
    if (!auth) {
      return deny(401, "Admin password or assigned-user access link required");
    }

    if (path === `${QR_BASE}/api/dashboard` && request.method === "GET") {
      return json(await dashboard(env, auth));
    }

    if (path === `${QR_BASE}/api/codes` && request.method === "POST") {
      if (auth.type !== "admin") {
        return deny(403, "Only admins can create QR codes");
      }
      const payload = await request.json();
      return json({ code: await createCode(env, payload, auth) }, { status: 201 });
    }

    const codeMatch = path.match(/^\/qr-generator\/api\/codes\/(\d+)$/);
    if (codeMatch) {
      const id = Number(codeMatch[1]);
      if (request.method === "PATCH") {
        const payload = await request.json();
        const code = await updateCode(env, id, payload, auth);
        return code ? json({ code }) : deny(404, "QR code not found");
      }
      if (request.method === "DELETE") {
        await deleteCode(env, id, auth);
        return json({ ok: true });
      }
    }

    const logoMatch = path.match(/^\/qr-generator\/api\/codes\/(\d+)\/logo$/);
    if (logoMatch) {
      const id = Number(logoMatch[1]);
      if (request.method === "GET") {
        const response = await getLogo(env, id, auth);
        return response || deny(404, "Logo image not found");
      }
      if (request.method === "POST") {
        const code = await uploadLogo(env, id, request, auth);
        return code ? json({ code }) : deny(404, "QR code not found");
      }
      if (request.method === "DELETE") {
        const code = await deleteLogo(env, id, auth);
        return code ? json({ code }) : deny(404, "QR code not found");
      }
    }

    return deny(404, "API route not found");
  } catch (error) {
    return json({ error: routeError(error) }, { status: 400 });
  }
}

async function handleQrRedirect(request, env, slug) {
  try {
    await ensureSchema(env);
    const code = await getCodeBySlug(env, normalizeSlug(slug));
    if (!code) {
      return htmlPage("QR link not found", "This short link does not exist.", 404);
    }
    if (!code.isActive) {
      return htmlPage("QR link paused", "This QR code is currently inactive.", 410);
    }
    await recordScan(env, code, request);
    return Response.redirect(code.destinationUrl, 302);
  } catch (error) {
    return json({ error: routeError(error) }, { status: 500 });
  }
}

async function fetchAsset(request, env) {
  const assets = env && env.ASSETS;
  if (!assets || typeof assets.fetch !== "function") {
    return new Response("Missing ASSETS binding", { status: 500 });
  }

  const direct = await assets.fetch(request);
  if (direct.status !== 404) {
    return direct;
  }

  const url = new URL(request.url);
  if (!url.pathname.includes(".")) {
    const indexUrl = new URL(
      url.pathname.endsWith("/") ? `${url.pathname}index.html` : `${url.pathname}/index.html`,
      request.url
    );
    const index = await assets.fetch(new Request(indexUrl, request));
    if (index.status !== 404) {
      return index;
    }
  }

  return direct;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith(`${QR_BASE}/api/`)) {
      return handleApi(request, env, path);
    }

    const qrMatch = path.match(/^\/qr-generator\/q\/([a-z0-9-]+)$/i);
    if (qrMatch) {
      return handleQrRedirect(request, env, qrMatch[1]);
    }

    return fetchAsset(request, env);
  },
};
