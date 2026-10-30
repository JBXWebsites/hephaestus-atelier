import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
const generated = `${process.argv[2] || "artifacts/raw"}/`;
const assets = {
  hero: "exec-49749e1d-c6fe-456a-98e3-000cec31792b.png",
  workshop: "exec-08f1901a-e8c0-43c0-982c-fc4308e33603.png",
  aegis: "exec-f71435e2-0c39-4466-b34a-581d6e4cb348.png",
  pyr: "exec-f5478af0-8fec-4100-9ad5-92539c19739a.png",
  nostos: "exec-7d5ca0ae-c4bd-4210-9b7c-191ad9cb251f.png",
};
await mkdir("public/images", { recursive: true });
for (const [name, file] of Object.entries(assets)) {
  await sharp(generated + file)
    .resize({ width: name === "hero" ? 1536 : 1000, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(`public/images/${name}.webp`);
  if (name === "hero")
    await sharp(generated + file)
      .resize({ width: 1536 })
      .extract({ left: 640, top: 0, width: 560, height: 1024 })
      .webp({ quality: 65 })
      .toFile("public/images/hero-mobile.webp");
}
await mkdir("public/fonts", { recursive: true });
await copyFile(
  "node_modules/@fontsource/marcellus/files/marcellus-latin-400-normal.woff2",
  "public/fonts/marcellus.woff2",
);
for (const weight of [400, 500, 600])
  await copyFile(
    `node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff2`,
    `public/fonts/manrope-${weight}.woff2`,
  );
await copyFile(
  "node_modules/@fontsource/marcellus/LICENSE",
  "public/fonts/MARCELLUS-LICENSE.txt",
);
await copyFile(
  "node_modules/@fontsource/manrope/LICENSE",
  "public/fonts/MANROPE-LICENSE.txt",
);
console.log("Five original images optimized; fonts and licenses copied.");
