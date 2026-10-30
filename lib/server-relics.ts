import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  getIntention,
  getMark,
  getMaterial,
  intentions,
  marks,
  materials,
  type RecipeChoice,
  type RelicRecipe,
  type RelicRecord,
} from "./relics";

export const TOKEN_LENGTH = 38;
export const MAX_BODY_BYTES = 1024;
const PAYLOAD_BYTES = 20;
const MIN_TIMESTAMP = Date.UTC(2020, 0, 1);
const FUTURE_TOLERANCE = 5 * 60 * 1000;

export class InvalidRecipeError extends Error {
  constructor() {
    super("Choose a valid intention, material and maker’s mark.");
    this.name = "InvalidRecipeError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateChoice(value: unknown): RecipeChoice {
  if (
    !isObject(value) ||
    Object.keys(value).length !== 3 ||
    !Object.hasOwn(value, "intention") ||
    !Object.hasOwn(value, "material") ||
    !Object.hasOwn(value, "mark") ||
    !intentions.some((item) => item.id === value.intention) ||
    !materials.some((item) => item.id === value.material) ||
    !marks.some((item) => item.id === value.mark)
  )
    throw new InvalidRecipeError();
  return {
    intention: value.intention as RecipeChoice["intention"],
    material: value.material as RecipeChoice["material"],
    mark: value.mark as RecipeChoice["mark"],
  };
}

function validTimestamp(timestamp: number): boolean {
  return (
    Number.isSafeInteger(timestamp) &&
    timestamp >= MIN_TIMESTAMP &&
    timestamp <= Date.now() + FUTURE_TOLERANCE
  );
}

function checksum(payload: Uint8Array): Buffer {
  // An integrity check for accidental corruption, deliberately not an authentication signature.
  return createHash("sha256")
    .update("hephaestus-relic-v1:")
    .update(payload)
    .digest()
    .subarray(0, 8);
}

function record(token: string, recipe: RelicRecipe): RelicRecord {
  return {
    token,
    id: `HPH-${recipe.nonce.toUpperCase()}`,
    url: `/relic/${token}`,
    recipe,
  };
}

export function createRelic(input: unknown): RelicRecord {
  const choice = validateChoice(input);
  const timestamp = Date.now();
  const nonce = randomBytes(8);
  const payload = Buffer.alloc(PAYLOAD_BYTES);
  payload[0] = 1;
  payload[1] = intentions.findIndex((item) => item.id === choice.intention);
  payload[2] = materials.findIndex((item) => item.id === choice.material);
  payload[3] = marks.findIndex((item) => item.id === choice.mark);
  payload.writeBigUInt64BE(BigInt(timestamp), 4);
  nonce.copy(payload, 12);
  const token = Buffer.concat([payload, checksum(payload)]).toString(
    "base64url",
  );
  return record(token, {
    ...choice,
    version: 1,
    createdAt: new Date(timestamp).toISOString(),
    nonce: nonce.toString("hex"),
  });
}

export function decodeRelic(token: unknown): RelicRecord | null {
  if (
    typeof token !== "string" ||
    token.length !== TOKEN_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(token)
  )
    return null;
  const data = Buffer.from(token, "base64url");
  if (data.length !== 28 || data.toString("base64url") !== token) return null;
  const payload = data.subarray(0, PAYLOAD_BYTES);
  if (
    !timingSafeEqual(checksum(payload), data.subarray(PAYLOAD_BYTES)) ||
    payload[0] !== 1
  )
    return null;
  const intention = intentions[payload[1]];
  const material = materials[payload[2]];
  const mark = marks[payload[3]];
  const timestamp = Number(payload.readBigUInt64BE(4));
  if (!intention || !material || !mark || !validTimestamp(timestamp))
    return null;
  return record(token, {
    version: 1,
    intention: intention.id,
    material: material.id,
    mark: mark.id,
    createdAt: new Date(timestamp).toISOString(),
    nonce: payload.subarray(12, 20).toString("hex"),
  });
}

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}

export function renderPrint(recipe: RelicRecipe, id: string): string {
  if (
    !isObject(recipe) ||
    Object.keys(recipe).length !== 6 ||
    recipe.version !== 1 ||
    typeof recipe.createdAt !== "string" ||
    typeof recipe.nonce !== "string" ||
    !/^[a-f0-9]{16}$/.test(recipe.nonce) ||
    !validTimestamp(Date.parse(recipe.createdAt)) ||
    new Date(recipe.createdAt).toISOString() !== recipe.createdAt ||
    id !== `HPH-${recipe.nonce.toUpperCase()}`
  )
    throw new InvalidRecipeError();
  const choice = validateChoice({
    intention: recipe.intention,
    material: recipe.material,
    mark: recipe.mark,
  });
  const intention = getIntention(choice.intention);
  const material = getMaterial(choice.material);
  const mark = getMark(choice.mark);
  const forms = {
    protect:
      '<ellipse cx="600" cy="670" rx="310" ry="225" transform="rotate(-28 600 670)" fill="none" stroke="url(#metal)" stroke-width="17"/><circle cx="600" cy="670" r="198" fill="url(#metal)" stroke="#35372f" stroke-width="3"/><circle cx="600" cy="670" r="172" fill="none" stroke="#eee9df" stroke-opacity=".46" stroke-width="2"/>',
    begin:
      '<path d="M600 352L910 850H290Z" fill="none" stroke="url(#metal)" stroke-width="17" stroke-linejoin="round"/><path d="M600 420L780 680L600 920L420 680Z" fill="url(#metal)" stroke="#35372f" stroke-width="3"/><path d="M600 450L755 680L600 891L445 680Z" fill="none" stroke="#eee9df" stroke-opacity=".46" stroke-width="2"/>',
    return:
      '<ellipse cx="600" cy="670" rx="217" ry="320" transform="rotate(24 600 670)" fill="none" stroke="url(#metal)" stroke-width="23"/><path d="M600 475L650 600L780 670L650 735L600 865L550 735L420 670L550 600Z" fill="url(#metal)" stroke="#35372f" stroke-width="3"/><path d="M600 515L635 615L740 670L635 720L600 825L565 720L460 670L565 615Z" fill="none" stroke="#eee9df" stroke-opacity=".46" stroke-width="2"/>',
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" role="img" aria-labelledby="title description">
<title id="title">${escapeXml(intention.name)} — archival relic print</title>
<desc id="description">An original illustrated digital relic in ${escapeXml(material.name)}, bearing the ${escapeXml(mark.name)} mark. ${escapeXml(intention.inscription)}</desc>
<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4e9d5"/><stop offset=".3" stop-color="${escapeXml(material.color)}"/><stop offset=".72" stop-color="${escapeXml(material.color)}"/><stop offset="1" stop-color="#30332e"/></linearGradient></defs>
<rect width="1200" height="1600" fill="#e6e5da"/><rect x="48" y="48" width="1104" height="1504" fill="none" stroke="#74796a"/>
<g fill="#20251f" font-family="Georgia, 'Times New Roman', serif"><text x="600" y="151" text-anchor="middle" font-size="35" letter-spacing="7">HEPHAESTUS</text></g>
<g fill="#444b40" font-family="Arial, Helvetica, sans-serif" text-anchor="middle"><text x="600" y="194" font-size="14" letter-spacing="5">THE DIVINE ATELIER</text><text x="600" y="285" font-size="13" letter-spacing="3">OBJECTS OF INTENTION / ARCHIVAL STUDY</text></g>
${forms[choice.intention]}
<g transform="translate(550 620)" fill="none" stroke="${choice.material === "obsidian" ? "#eee9df" : "#30362d"}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="${escapeXml(mark.path)}"/></g>
<g fill="#20251f" text-anchor="middle"><text x="600" y="1095" font-family="Georgia, 'Times New Roman', serif" font-size="76">${escapeXml(intention.name)}</text><text x="600" y="1150" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="3">${escapeXml(intention.label.toUpperCase())} / ${escapeXml(material.name.toUpperCase())} / ${escapeXml(mark.name.toUpperCase())}</text><text x="600" y="1230" font-family="Georgia, 'Times New Roman', serif" font-size="27">${escapeXml(intention.inscription)}</text></g>
<path d="M150 1320H1050" stroke="#9ca08f"/>
<g fill="#444b40" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"><text x="600" y="1366" font-size="16" letter-spacing="2">${escapeXml(id)}</text><text x="600" y="1400" font-size="14">Forged ${escapeXml(recipe.createdAt.replace("T", " ").replace("Z", " UTC"))}</text><text x="600" y="1464" font-size="13">An original fictional digital object. Illustrated print, not an archaeological artifact.</text><text x="600" y="1494" font-size="13">An independent experiment by JBX Web Studio</text></g>
</svg>`;
}
