#!/usr/bin/env node
// Semantic search over the react-router skill docs.
//   node scripts/search.mjs "how do I stream data from a loader"
//   node scripts/search.mjs --top 8 --format text "tailwind v4 with rr7"
//   node scripts/search.mjs --json "..."
//
// Reads embeddings/index.json. Embeds the query via OpenAI text-embedding-3-small,
// returns top-K chunks by cosine similarity. Caches query embeddings in
// embeddings/query-cache.json so repeated questions cost nothing.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_DIR = resolve(fileURLToPath(import.meta.url), "../..");
const INDEX_PATH = join(SKILL_DIR, "embeddings", "index.json");
const CACHE_PATH = join(SKILL_DIR, "embeddings", "query-cache.json");
const MODEL = "text-embedding-3-small";

function parseArgs(argv) {
  const args = { top: 5, format: "json", query: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--top") args.top = parseInt(argv[++i], 10);
    else if (a === "--format") args.format = argv[++i];
    else if (a === "--json") args.format = "json";
    else if (a === "--text") args.format = "text";
    else if (!args.query) args.query = a;
    else args.query += " " + a;
  }
  return args;
}

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

async function embedQuery(query) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, input: query }),
  });
  if (!res.ok) throw new Error(`embeddings API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding;
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await mkdir(dirname(CACHE_PATH), { recursive: true });
  const keys = Object.keys(cache);
  if (keys.length > 500) {
    const trimmed = {};
    for (const k of keys.slice(-500)) trimmed[k] = cache[k];
    cache = trimmed;
  }
  await writeFile(CACHE_PATH, JSON.stringify(cache));
}

async function main() {
  const { query, top, format } = parseArgs(process.argv.slice(2));
  if (!query) {
    console.error("usage: search.mjs [--top N] [--format json|text] <query>");
    process.exit(2);
  }

  let index;
  try {
    index = JSON.parse(await readFile(INDEX_PATH, "utf8"));
  } catch (err) {
    console.error(`Cannot read ${INDEX_PATH}. Run: node scripts/build-embeddings.mjs`);
    process.exit(1);
  }

  const queryHash = createHash("sha1").update(`${MODEL}\n${query}`).digest("hex");
  const cache = await loadCache();
  let queryVec = cache[queryHash];
  if (!queryVec) {
    queryVec = await embedQuery(query);
    cache[queryHash] = queryVec;
    await saveCache(cache);
  }

  const scored = index.chunks
    .map((c) => ({ ...c, score: cosine(queryVec, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
    .map(({ vector, hash, ...rest }) => rest);

  if (format === "text") {
    for (const r of scored) {
      console.log(`\n── ${r.path} › ${r.heading}  (score ${r.score.toFixed(3)})`);
      console.log(r.text);
    }
  } else {
    console.log(JSON.stringify({ query, model: MODEL, results: scored }, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
