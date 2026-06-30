import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const tempDir = join(root, ".sites-build");
const staticDir = join(tempDir, "static");
const distDir = join(root, "dist");

rmSync(tempDir, { force: true, recursive: true });
mkdirSync(tempDir, { recursive: true });

const result = spawnSync("npx", ["astro", "build", "--outDir", staticDir], {
  cwd: root,
  shell: false,
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

rmSync(distDir, { force: true, recursive: true });
mkdirSync(join(distDir, "client"), { recursive: true });
mkdirSync(join(distDir, "server"), { recursive: true });
cpSync(staticDir, join(distDir, "client"), { recursive: true });
mkdirSync(join(distDir, ".openai"), { recursive: true });
cpSync(join(root, ".openai", "hosting.json"), join(distDir, ".openai", "hosting.json"));

if (existsSync(join(root, "drizzle"))) {
  cpSync(join(root, "drizzle"), join(distDir, ".openai", "drizzle"), { recursive: true });
}

cpSync(join(root, "worker", "index.js"), join(distDir, "server", "index.js"));
