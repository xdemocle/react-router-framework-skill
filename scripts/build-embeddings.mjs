#!/usr/bin/env node
// Build embeddings index for the react-router skill docs.
//   node scripts/build-embeddings.mjs            # incremental rebuild
//   node scripts/build-embeddings.mjs --rebuild  # force re-embed everything
//
// Requires: OPENAI_API_KEY in the environment.
// Model: text-embedding-3-small (1536 dims, $0.02/1M tokens).
// Output: embeddings/index.json — array of {id, path, heading, text, hash, vector}.

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_DIR = resolve(fileURLToPath(import.meta.url), "../..");
const INDEX_PATH = join(SKILL_DIR, "embeddings", "index.json");
const MODEL = "text-embedding-3-small";
const MAX_CHUNK_CHARS = 2400;
const MIN_CHUNK_CHARS = 80;
const FORCE_REBUILD = process.argv.includes("--rebuild");

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("ERROR: OPENAI_API_KEY is not set.");
  process.exit(1);
}

async function walkMarkdown(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "scripts" || entry.name === "embeddings") continue;
      await walkMarkdown(full, acc);
    } else if (entry.name.endsWith(".md")) {
      acc.push(full);
    }
  }
  return acc;
}

function sha1(s) {
  return createHash("sha1").update(s).digest("hex").slice(0, 16);
}

// Split a markdown file into chunks bounded by H2/H3 headings, then by char budget.
function chunkMarkdown(text, relPath) {
  const lines = text.split("\n");
  const sections = [];
  let currentHeading = "";
  let buffer = [];

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body.length >= MIN_CHUNK_CHARS) {
      sections.push({ heading: currentHeading || "(intro)", text: body });
    }
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[2].trim();
      continue;
    }
    buffer.push(line);
  }
  flush();

  // Further split oversized sections at blank lines.
  const chunks = [];
  for (const sec of sections) {
    if (sec.text.length <= MAX_CHUNK_CHARS) {
      chunks.push(sec);
      continue;
    }
    const paragraphs = sec.text.split(/\n\s*\n/);
    let buf = [];
    let bufLen = 0;
    const flushBuf = () => {
      if (!buf.length) return;
      const body = buf.join("\n\n").trim();
      if (body.length >= MIN_CHUNK_CHARS) {
        chunks.push({ heading: sec.heading, text: body });
      }
      buf = [];
      bufLen = 0;
    };
    for (const p of paragraphs) {
      if (bufLen + p.length > MAX_CHUNK_CHARS && buf.length) flushBuf();
      buf.push(p);
      bufLen += p.length + 2;
    }
    flushBuf();
  }

  return chunks.map((c, i) => {
    const fingerprint = `${relPath}#${c.heading}#${i}`;
    return {
      id: sha1(fingerprint),
      path: relPath,
      heading: c.heading,
      text: c.text,
      hash: sha1(c.text),
    };
  });
}

async function embedBatch(texts) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`embeddings API ${res.status}: ${detail}`);
  }
  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

async function loadExisting() {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return new Map(parsed.chunks.map((c) => [c.id, c]));
  } catch {
    return new Map();
  }
}

async function main() {
  const t0 = Date.now();
  const files = (await walkMarkdown(SKILL_DIR)).sort();
  console.log(`Scanning ${files.length} markdown files in ${SKILL_DIR}`);

  const existing = FORCE_REBUILD ? new Map() : await loadExisting();
  const allChunks = [];
  for (const file of files) {
    const rel = relative(SKILL_DIR, file);
    const text = await readFile(file, "utf8");
    const chunks = chunkMarkdown(text, rel);
    allChunks.push(...chunks);
  }
  console.log(`Chunked into ${allChunks.length} pieces`);

  const finalChunks = [];
  const toEmbed = [];
  for (const chunk of allChunks) {
    const prior = existing.get(chunk.id);
    if (prior && prior.hash === chunk.hash && prior.vector?.length) {
      finalChunks.push({ ...chunk, vector: prior.vector });
    } else {
      toEmbed.push(chunk);
    }
  }
  console.log(`Reusing ${finalChunks.length} cached vectors, embedding ${toEmbed.length} new/changed`);

  const BATCH = 32;
  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const batch = toEmbed.slice(i, i + BATCH);
    const vectors = await embedBatch(batch.map((b) => `${b.path}\n${b.heading}\n\n${b.text}`));
    batch.forEach((chunk, j) => finalChunks.push({ ...chunk, vector: vectors[j] }));
    console.log(`  embedded ${Math.min(i + BATCH, toEmbed.length)}/${toEmbed.length}`);
  }

  finalChunks.sort((a, b) => a.id.localeCompare(b.id));
  await mkdir(dirname(INDEX_PATH), { recursive: true });
  const payload = {
    model: MODEL,
    dim: finalChunks[0]?.vector?.length ?? 0,
    builtAt: new Date().toISOString(),
    chunkCount: finalChunks.length,
    chunks: finalChunks,
  };
  await writeFile(INDEX_PATH, JSON.stringify(payload));
  const stats = await stat(INDEX_PATH);
  console.log(
    `Wrote ${INDEX_PATH} — ${(stats.size / 1024).toFixed(1)} KB, ${finalChunks.length} chunks, ${
      ((Date.now() - t0) / 1000).toFixed(1)
    }s`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
