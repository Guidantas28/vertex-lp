import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = ".vercel/output/functions";
const RUNTIME = "nodejs22.x";

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name === ".vc-config.json") patch(path);
  }
}

function patch(file) {
  const cfg = JSON.parse(readFileSync(file, "utf8"));
  if (cfg.runtime?.startsWith("nodejs") && cfg.runtime !== RUNTIME) {
    cfg.runtime = RUNTIME;
    writeFileSync(file, JSON.stringify(cfg, null, "\t") + "\n");
    console.log(`patched ${file} → ${RUNTIME}`);
  }
}

try {
  walk(OUT);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}
