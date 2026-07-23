import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const browsers = ["chrome", "edge", "firefox"];
const canonical = await readFile(join(root, "dist", "viettts.min.js"));
const canonicalHash = createHash("sha256").update(canonical).digest("hex");

new Function(canonical.toString("utf8"));

for (const browser of browsers) {
  const output = join(root, "build", browser);
  const manifest = JSON.parse(await readFile(join(output, "manifest.json"), "utf8"));
  if (manifest.version !== "1.2.0") throw new Error(`${browser}: manifest version is not 1.2.0`);

  const bundled = await readFile(join(output, "lib", "viettts.js"));
  const bundledHash = createHash("sha256").update(bundled).digest("hex");
  if (bundledHash !== canonicalHash) throw new Error(`${browser}: VietTTS core is not identical to dist`);

  for (const file of ["background.js", "content.js", "popup.html", "popup.js"]) {
    const source = await readFile(join(output, file), "utf8");
    if (/https?:\/\/cdn\.jsdelivr\.net/i.test(source)) {
      throw new Error(`${browser}: remotely hosted executable code found in ${file}`);
    }
  }
}

const background = await readFile(join(root, "extensions", "common", "background.js"), "utf8");
if (background.includes("method.length < args.length + 1")) {
  throw new Error("Premature callback resolution regression detected.");
}

console.log(`Checks passed. Shared core SHA-256: ${canonicalHash}`);
