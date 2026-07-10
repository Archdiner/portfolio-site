/* eslint-env node */
// Refreshes live GitHub metadata (stars, last-pushed, description, language)
// for the CURATED set of repos listed in src/data/projects.json.
//
// Design goals:
//  - Curated allowlist only: it never discovers or adds new projects. The site's
//    project list is whatever you put in projects.json; this only refreshes facts.
//  - Never breaks the build: any network/API failure falls back to the existing
//    repo-meta.json and the script still exits 0.
//
// Runs automatically before `vite build` (see package.json "prebuild") and on a
// nightly GitHub Action.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../src/data');
const PROJECTS = resolve(DATA_DIR, 'projects.json');
const META = resolve(DATA_DIR, 'repo-meta.json');

const OWNER = 'Archdiner';
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function fetchRepo(repo) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-site-refresh',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${repo}: HTTP ${res.status}`);
  const j = await res.json();
  return {
    stars: j.stargazers_count ?? 0,
    pushedAt: j.pushed_at ?? null,
    description: j.description ?? null,
    language: j.language ?? null,
  };
}

async function main() {
  const projects = await readJson(PROJECTS, []);
  const existing = await readJson(META, {});
  const repos = [...new Set(projects.map((p) => p.repo).filter(Boolean))];

  const next = { ...existing };
  let changed = false;

  for (const repo of repos) {
    try {
      const meta = await fetchRepo(repo);
      if (JSON.stringify(next[repo]) !== JSON.stringify(meta)) {
        next[repo] = meta;
        changed = true;
      }
      console.log(`  ✓ ${repo} — ${meta.stars}★, pushed ${meta.pushedAt}`);
    } catch (err) {
      // Keep whatever we already had for this repo; don't fail the build.
      console.warn(`  ! ${repo} — keeping cached metadata (${err.message})`);
    }
  }

  // Drop metadata for repos no longer in the allowlist.
  for (const key of Object.keys(next)) {
    if (!repos.includes(key)) {
      delete next[key];
      changed = true;
    }
  }

  if (changed) {
    await writeFile(META, JSON.stringify(next, null, 2) + '\n');
    console.log('repo-meta.json updated.');
  } else {
    console.log('repo-meta.json already current.');
  }
}

main().catch((err) => {
  // Absolute last resort: log, but never break the build.
  console.warn('refresh-repo-meta failed, using cached metadata:', err.message);
  process.exit(0);
});
