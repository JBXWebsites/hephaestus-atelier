import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  intentions,
  materials,
  marks,
  recipeTitle,
  type RelicRecipe,
} from "../lib/relics";
import {
  createRelic,
  decodeRelic,
  InvalidRecipeError,
  MAX_BODY_BYTES,
  renderPrint,
  TOKEN_LENGTH,
} from "../lib/server-relics";
import { POST } from "../app/api/relics/route";
import { GET as getRelic } from "../app/api/relics/[token]/route";
import { GET as getPrint } from "../app/api/relics/[token]/print/route";

const choice = {
  intention: "protect",
  material: "bronze",
  mark: "sun",
} as const;
const origin = "https://atelier.example";
function request(body: string, headers: Record<string, string> = {}): Request {
  return new Request(`${origin}/api/relics`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}
function rewriteToken(
  token: string,
  mutate: (payload: Buffer) => void,
): string {
  const payload = Buffer.from(token, "base64url").subarray(0, 20);
  mutate(payload);
  const checksum = createHash("sha256")
    .update("hephaestus-relic-v1:")
    .update(payload)
    .digest()
    .subarray(0, 8);
  return Buffer.concat([payload, checksum]).toString("base64url");
}

test("all 27 recipes create, reopen through GET and download a matching archival print", async () => {
  const tokens = new Set<string>();
  const ids = new Set<string>();
  for (const intention of intentions)
    for (const material of materials)
      for (const mark of marks) {
        const selected = {
          intention: intention.id,
          material: material.id,
          mark: mark.id,
        };
        const created = await POST(
          request(JSON.stringify(selected), { Origin: origin }),
        );
        assert.equal(created.status, 201);
        const result = await created.json();
        assert.equal(result.token.length, TOKEN_LENGTH);
        assert.equal(result.url, `/relic/${result.token}`);
        assert.equal(created.headers.get("location"), result.url);
        assert.equal(result.recipe.version, 1);
        assert.deepEqual(
          {
            intention: result.recipe.intention,
            material: result.recipe.material,
            mark: result.recipe.mark,
          },
          selected,
        );
        assert.deepEqual(decodeRelic(result.token), result);
        tokens.add(result.token);
        ids.add(result.id);
        const context = { params: Promise.resolve({ token: result.token }) };
        const reopened = await getRelic(
          new Request(`${origin}/api/relics/${result.token}`),
          context,
        );
        assert.equal(reopened.status, 200);
        assert.deepEqual(await reopened.json(), result);
        const downloaded = await getPrint(
          new Request(`${origin}/api/relics/${result.token}/print`),
          context,
        );
        assert.equal(downloaded.status, 200);
        assert.match(
          downloaded.headers.get("content-type")!,
          /^image\/svg\+xml/,
        );
        assert.match(
          downloaded.headers.get("content-disposition")!,
          /^attachment; filename="hephaestus-hph-[a-f0-9]{16}\.svg"$/,
        );
        assert.equal(
          downloaded.headers.get("x-content-type-options"),
          "nosniff",
        );
        assert.match(
          downloaded.headers.get("content-security-policy")!,
          /sandbox/,
        );
        const svg = await downloaded.text();
        assert.match(svg, /width="1200" height="1600"/);
        assert.ok(svg.includes(intention.name));
        assert.ok(svg.includes(material.name.toUpperCase()));
        assert.ok(svg.includes(material.color));
        assert.ok(svg.includes(mark.name.toUpperCase()));
        assert.ok(svg.includes(mark.path));
        assert.ok(svg.includes(intention.inscription));
        assert.ok(svg.includes(result.id));
        assert.doesNotMatch(svg, /<script|<foreignObject|onload=|href=/i);
        assert.equal(
          recipeTitle(selected),
          `${intention.name} · ${material.name} · ${mark.name}`,
        );
      }
  assert.equal(tokens.size, 27);
  assert.equal(ids.size, 27);
});

test("each form produces different geometry; material and mark changes survive round trips", () => {
  const drawings = intentions.map(({ id }) => {
    const result = createRelic({ ...choice, intention: id });
    return renderPrint(result.recipe, result.id);
  });
  assert.match(drawings[0], /<circle cx="600" cy="670" r="198"/);
  assert.match(drawings[1], /M600 420L780 680L600 920L420 680Z/);
  assert.match(drawings[2], /rx="217" ry="320"/);
  const a = createRelic(choice);
  const b = createRelic(choice);
  assert.notEqual(a.token, b.token);
  assert.notEqual(a.id, b.id);
});

test("invalid JSON choices, extra properties and injection strings are rejected", async () => {
  const invalid = [
    null,
    [],
    "protect",
    1,
    true,
    {},
    { ...choice, mark: "SUN" },
    { ...choice, material: "<script>alert(1)</script>" },
    { ...choice, intention: "__proto__" },
    { ...choice, mark: { value: "sun" } },
    { ...choice, nonce: "123" },
    { intention: "protect", material: "bronze" },
    JSON.parse(
      '{"intention":"protect","material":"bronze","mark":"sun","__proto__":{}}',
    ),
  ];
  for (const input of invalid) {
    assert.throws(() => createRelic(input), InvalidRecipeError);
    const response = await POST(request(JSON.stringify(input)));
    assert.equal(response.status, 400, JSON.stringify(input));
    assert.equal(typeof (await response.json()).error, "string");
  }
  for (const body of ["", "{", "NaN", "\u0000", '{"mark": undefined}'])
    assert.equal((await POST(request(body))).status, 400);
});

test("same-origin and JSON media checks preserve ordinary and charset-bearing requests", async () => {
  for (const foreignOrigin of [
    "https://evil.example",
    "null",
    `${origin}.evil.example`,
    `${origin}/`,
  ]) {
    assert.equal(
      (await POST(request(JSON.stringify(choice), { Origin: foreignOrigin })))
        .status,
      400,
    );
  }
  for (const contentType of [
    "text/plain",
    "application/jsonp",
    "application/x-www-form-urlencoded",
  ]) {
    assert.equal(
      (
        await POST(
          request(JSON.stringify(choice), { "Content-Type": contentType }),
        )
      ).status,
      415,
    );
  }
  assert.equal(
    (
      await POST(
        new Request(`${origin}/api/relics`, {
          method: "POST",
          body: JSON.stringify(choice),
        }),
      )
    ).status,
    415,
  );
  assert.equal(
    (
      await POST(
        request(JSON.stringify(choice), {
          "Content-Type": "Application/JSON; charset=utf-8",
        }),
      )
    ).status,
    201,
  );
  assert.equal((await POST(request(JSON.stringify(choice)))).status, 201);
});

test("origin comparison uses normalized public Host rather than the internal listening address", async () => {
  const body = JSON.stringify(choice);
  const local = (headers: Record<string, string>) =>
    new Request("http://0.0.0.0:3000/api/relics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "LOCALHOST:3000",
        ...headers,
      },
      body,
    });
  assert.equal(
    (await POST(local({ Origin: "http://localhost:3000" }))).status,
    201,
  );
  for (const supplied of [
    "https://localhost:3000",
    "http://localhost:3001",
    "http://localhost",
    "http://localhost:3000.evil.example",
    "http://user@localhost:3000",
    "http://localhost:3000/path",
    "http://localhost:3000#fragment",
    "http://localhost:3000\\",
    "http://local\thost:3000",
  ]) {
    assert.equal(
      (await POST(local({ Origin: supplied }))).status,
      400,
      supplied,
    );
  }
  for (const host of [
    "localhost:3000,evil.example",
    "user@localhost:3000",
    "localhost:3000/path",
    "localhost:",
    "localhost:99999",
  ]) {
    assert.equal(
      (await POST(local({ Origin: "http://localhost:3000", Host: host })))
        .status,
      400,
      host,
    );
  }
  assert.equal(
    (
      await POST(
        local({
          Origin: "http://evil.example",
          "X-Forwarded-Host": "evil.example",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await POST(
        request(body, {
          Origin: "https://ATELIER.EXAMPLE:443",
          Host: "atelier.example",
        }),
      )
    ).status,
    201,
  );
});

test("forwarded protocol is trusted only on Vercel and never widens host or port matching", async () => {
  const previous = process.env.VERCEL;
  const proxied = (headers: Record<string, string>) =>
    new Request("http://internal:3000/api/relics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "atelier.example",
        Origin: "https://atelier.example",
        "X-Forwarded-Proto": "https",
        ...headers,
      },
      body: JSON.stringify(choice),
    });
  try {
    delete process.env.VERCEL;
    assert.equal((await POST(proxied({}))).status, 400);
    process.env.VERCEL = "1";
    assert.equal((await POST(proxied({}))).status, 201);
    for (const supplied of [
      "http://atelier.example",
      "https://atelier.example:8443",
      "https://evil.example",
    ]) {
      assert.equal((await POST(proxied({ Origin: supplied }))).status, 400);
    }
    assert.equal(
      (await POST(proxied({ "X-Forwarded-Proto": "https,http" }))).status,
      400,
    );
    assert.equal(
      (
        await POST(
          proxied({
            Origin: "https://evil.example",
            "X-Forwarded-Host": "evil.example",
          }),
        )
      ).status,
      400,
    );
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});

test("body cap is enforced at the byte boundary and despite false or absent content length", async () => {
  const body = JSON.stringify(choice);
  const exact = body + " ".repeat(MAX_BODY_BYTES - Buffer.byteLength(body));
  assert.equal((await POST(request(exact))).status, 201);
  assert.equal((await POST(request(exact + " "))).status, 413);
  assert.equal(
    (await POST(request(exact + " ", { "Content-Length": "1" }))).status,
    413,
  );
  assert.equal(
    (await POST(request(body, { "Content-Length": "1025" }))).status,
    413,
  );
  assert.equal((await POST(request("é".repeat(513)))).status, 413);
  let cancelled = false;
  let reads = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      reads += 1;
      controller.enqueue(new Uint8Array(600));
    },
    cancel() {
      cancelled = true;
    },
  });
  const streaming = new Request(`${origin}/api/relics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stream,
    duplex: "half",
  } as RequestInit);
  assert.equal((await POST(streaming)).status, 413);
  assert.equal(cancelled, true);
  assert.ok(reads <= 3, "must stop consuming an unbounded stream at the cap");
});

test("invalid UTF-8 and interrupted request streams return recoverable errors", async () => {
  const invalidUtf8 = new Request(`${origin}/api/relics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: new Uint8Array([0xff, 0xfe]),
  });
  assert.equal((await POST(invalidUtf8)).status, 400);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.error(new Error("disconnected"));
    },
  });
  const broken = new Request(`${origin}/api/relics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stream,
    duplex: "half",
  } as RequestInit);
  assert.equal((await POST(broken)).status, 400);
});

test("token decoder rejects malformed, noncanonical, corrupt and oversized input", async () => {
  const { token } = createRelic(choice);
  const tampered = Buffer.from(token, "base64url");
  tampered[12] ^= 1;
  // The final base64 sextet has four unused bits; nonzero padding bits must be rejected.
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const noncanonical =
    token.slice(0, -1) + alphabet[alphabet.indexOf(token.at(-1)!) + 1];
  assert.deepEqual(
    Buffer.from(noncanonical, "base64url"),
    Buffer.from(token, "base64url"),
  );
  const malformed: unknown[] = [
    null,
    undefined,
    42,
    {},
    "",
    token.slice(1),
    token + "=",
    "x".repeat(100000),
    "../" + token,
    "<svg onload=alert(1)>",
    token.slice(0, -1) + "!",
    noncanonical,
    tampered.toString("base64url"),
  ];
  for (const value of malformed) assert.equal(decodeRelic(value), null);
  const context = { params: Promise.resolve({ token: "invalid" }) };
  assert.equal((await getRelic(new Request(origin), context)).status, 404);
  assert.equal((await getPrint(new Request(origin), context)).status, 404);
});

test("checksummed tokens still enforce schema, enums and timestamp limits", () => {
  const { token } = createRelic(choice);
  const mutations = [
    (payload: Buffer) => {
      payload[0] = 2;
    },
    (payload: Buffer) => {
      payload[1] = 3;
    },
    (payload: Buffer) => {
      payload[2] = 255;
    },
    (payload: Buffer) => {
      payload[3] = 3;
    },
    (payload: Buffer) => {
      payload.writeBigUInt64BE(BigInt(0), 4);
    },
    (payload: Buffer) => {
      payload.writeBigUInt64BE(BigInt(Date.now() + 3600000), 4);
    },
    (payload: Buffer) => {
      payload.writeBigUInt64BE(BigInt("18446744073709551615"), 4);
    },
  ];
  for (const mutate of mutations)
    assert.equal(decodeRelic(rewriteToken(token, mutate)), null);
  const old = rewriteToken(token, (payload) => {
    payload.writeBigUInt64BE(BigInt(Date.UTC(2020, 0, 1)), 4);
  });
  assert.equal(decodeRelic(old)?.recipe.createdAt, "2020-01-01T00:00:00.000Z");
});

test("print renderer independently rejects arbitrary text and forged record identifiers", () => {
  const relic = createRelic(choice);
  const hostile = [
    { ...relic.recipe, mark: "<script/>" },
    { ...relic.recipe, createdAt: '<svg onload="alert(1)"/>' },
    { ...relic.recipe, createdAt: "2026-01-01" },
    { ...relic.recipe, nonce: "<script/>" },
    { ...relic.recipe, version: 2 },
    { ...relic.recipe, extra: "<script/>" },
  ];
  for (const recipe of hostile)
    assert.throws(
      () => renderPrint(recipe as RelicRecipe, relic.id),
      InvalidRecipeError,
    );
  assert.throws(
    () => renderPrint(relic.recipe, '" onload="alert(1)'),
    InvalidRecipeError,
  );
});
