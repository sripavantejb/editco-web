/**
 * Windows Application Control can block Tailwind's native .node binary.
 * npm also skips @tailwindcss/oxide-wasm32-wasi on win32 (cpu: wasm32).
 * This postinstall packs and extracts that package so oxide can fall back to WASI.
 */
import { existsSync, mkdirSync, rmSync, cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "node_modules", "@tailwindcss", "oxide-wasm32-wasi");
const require = createRequire(import.meta.url);

function oxideLoads() {
  try {
    require("@tailwindcss/oxide");
    return true;
  } catch {
    return false;
  }
}

function readOxideVersion() {
  try {
    return require("@tailwindcss/oxide/package.json").version;
  } catch {
    return null;
  }
}

if (oxideLoads()) {
  process.exit(0);
}

const version = readOxideVersion();
if (!version) {
  console.warn("[ensure-oxide-wasm] @tailwindcss/oxide not installed; skipping");
  process.exit(0);
}

const pkg = `@tailwindcss/oxide-wasm32-wasi@${version}`;
console.log(`[ensure-oxide-wasm] Installing ${pkg} (native oxide blocked or missing)`);

const tmp = mkdtempSync(join(tmpdir(), "oxide-wasm-"));
try {
  execFileSync("npm", ["pack", pkg, "--pack-destination", tmp], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

  const tarball = join(tmp, `tailwindcss-oxide-wasm32-wasi-${version}.tgz`);
  if (!existsSync(tarball)) {
    throw new Error(`Expected tarball missing: ${tarball}`);
  }

  execFileSync("tar", ["-xf", tarball, "-C", tmp], { stdio: "inherit", shell: true });

  const extracted = join(tmp, "package");
  mkdirSync(join(root, "node_modules", "@tailwindcss"), { recursive: true });
  rmSync(dest, { recursive: true, force: true });
  cpSync(extracted, dest, { recursive: true });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

process.env.NAPI_RS_FORCE_WASI = "true";
if (!oxideLoads()) {
  console.error("[ensure-oxide-wasm] WASM fallback installed but @tailwindcss/oxide still failed to load");
  process.exit(1);
}

console.log("[ensure-oxide-wasm] WASM fallback ready");
