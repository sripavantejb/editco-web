/**
 * Tailwind's oxide-wasm32-wasi Scanner cannot read the filesystem on Windows
 * (Node WASI gap), so scan() returns [] and no utility CSS is generated.
 * Native oxide is also blocked here by Application Control.
 *
 * When scan() is empty, re-scan by reading files with Node fs and scanFiles().
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const oxide = require("@tailwindcss/oxide");
const proto = oxide.Scanner.prototype;

if (proto.__editcoWindowsScanPatched) {
  module.exports = oxide;
  return;
}

const originalScan = proto.scan;

function listSourceFiles(sources) {
  const files = new Set();

  for (const source of sources) {
    const base = source.base;
    const pattern = source.pattern;
    if (!base || !pattern || source.negated) continue;

    try {
      if (typeof fs.globSync === "function") {
        for (const file of fs.globSync(pattern, {
          cwd: base,
          absolute: true,
          nodir: true,
        })) {
          files.add(path.normalize(file));
        }
        continue;
      }
    } catch {
      // fall through to walk
    }

    const extMatch = pattern.match(/\*\.([{\w,}.-]+)$/);
    let exts = null;
    if (extMatch) {
      const raw = extMatch[1];
      if (raw.startsWith("{") && raw.endsWith("}")) {
        exts = new Set(raw.slice(1, -1).split(","));
      } else {
        exts = new Set([raw]);
      }
    }

    const walk = (dir) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const ent of entries) {
        if (ent.name === "node_modules" || ent.name.startsWith(".")) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(full);
          continue;
        }
        if (!exts) {
          files.add(full);
          continue;
        }
        const ext = path.extname(ent.name).slice(1);
        if (exts.has(ext)) files.add(full);
      }
    };

    walk(base);
  }

  return [...files];
}

proto.scan = function patchedScan() {
  const native = originalScan.call(this);
  if (native.length > 0) return native;

  const sources = this.normalizedSources || [];
  if (!sources.length) return native;

  const files = listSourceFiles(sources);
  if (!files.length) return native;

  const input = [];
  for (const file of files) {
    const extension = path.extname(file).slice(1);
    if (!extension) continue;
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    input.push({ file, content, extension });
  }

  if (!input.length) return native;
  return this.scanFiles(input);
};

proto.__editcoWindowsScanPatched = true;

module.exports = oxide;
