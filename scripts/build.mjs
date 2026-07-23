import { mkdir, rm, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const browsers = ["chrome", "edge", "firefox"];
const commonFiles = ["background.js", "content.js", "popup.html", "popup.css", "popup.js"];

await rm(join(root, "build"), { recursive: true, force: true });

for (const browser of browsers) {
  const output = join(root, "build", browser);
  await mkdir(join(output, "lib"), { recursive: true });
  await copyFile(
    join(root, "extensions", "manifests", `manifest.${browser}.json`),
    join(output, "manifest.json")
  );
  await copyFile(join(root, "dist", "viettts.min.js"), join(output, "lib", "viettts.js"));
  for (const file of commonFiles) {
    await copyFile(join(root, "extensions", "common", file), join(output, file));
  }
}

console.log("Built Chrome, Edge and Firefox packages from one VietTTS core.");
