import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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

writeFileSync(
  join(distDir, "server", "index.js"),
  `export default {
  async fetch(request, env) {
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
        url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname + "/index.html",
        request.url
      );
      const indexRequest = new Request(indexUrl, request);
      const index = await assets.fetch(indexRequest);
      if (index.status !== 404) {
        return index;
      }
    }

    return direct;
  }
};
`
);
