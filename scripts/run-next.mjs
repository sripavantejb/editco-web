/**
 * Force Tailwind oxide onto WASI when Windows Application Control blocks
 * the native win32 .node binding. See scripts/ensure-oxide-wasm.mjs.
 *
 * Also regenerates Tailwind @source inline candidates — oxide WASM cannot
 * scan the Windows filesystem, so utilities would otherwise be empty.
 */
import { spawn, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

process.env.NAPI_RS_FORCE_WASI = "true";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

try {
  require("@tailwindcss/oxide");
} catch (err) {
  console.error(
    "[run-next] @tailwindcss/oxide failed to load. Try: node scripts/ensure-oxide-wasm.mjs",
  );
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const gen = spawnSync(
  process.execPath,
  [join(root, "scripts", "generate-tw-sources.mjs")],
  { stdio: "inherit", env: process.env, cwd: root },
);
if (gen.status !== 0) {
  console.error("[run-next] Failed to generate Tailwind sources");
  process.exit(gen.status ?? 1);
}

const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const args = process.argv.slice(2);
const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: "inherit",
  env: process.env,
  cwd: root,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
