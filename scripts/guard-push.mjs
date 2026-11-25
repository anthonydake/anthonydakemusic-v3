#!/usr/bin/env node
// PreToolUse(Bash) guard: before a `git push`, require a visual check for this commit.
// Reads the hook JSON from stdin. Allows docs-only pushes; blocks site-affecting
// pushes unless .visual-check/passed exists and matches `git rev-parse HEAD`.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

function block(msg) {
  process.stderr.write(msg + '\n');
  process.exit(2);
}
function allow() {
  process.exit(0);
}

let payload = {};
try {
  const raw = readFileSync(0, 'utf8');
  payload = raw ? JSON.parse(raw) : {};
} catch {
  allow();
}

const cmd = payload?.tool_input?.command;
if (typeof cmd !== 'string' || !/\bgit\b[^;&|<>\n]*\bpush\b/.test(cmd)) allow();

if (/\bgit\s+commit\b/.test(cmd)) {
  block('Blocked: commit and push in separate commands; run the visual check in between.');
}

const repo = payload?.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const sh = (c) => execSync(c, { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

const SITE_RE = /^(app|public|data|lib|content|components|styles)\/|^(next\.config\.|package\.json$|package-lock\.json$|postcss\.config\.|tailwind\.config\.|middleware\.|tsconfig\.json$)/;

let files = [];
let baseResolved = true;
try {
  sh('git rev-parse --verify origin/main');
} catch {
  baseResolved = false;
}

try {
  if (baseResolved) {
    files = sh('git diff --name-only origin/main...HEAD').split('\n').filter(Boolean);
  } else {
    const tracked = sh('git diff --name-only HEAD').split('\n').filter(Boolean);
    const untracked = sh('git ls-files --others --exclude-standard').split('\n').filter(Boolean);
    files = [...new Set([...tracked, ...untracked])];
  }
} catch {
  files = [];
}

const affects = files.some((f) => SITE_RE.test(f));
if (!affects) allow();

const markerPath = path.join(repo, '.visual-check', 'passed');
if (!existsSync(markerPath)) {
  block('Blocked: run the visual check in CLAUDE.md (Before every push) for this commit first.');
}
let head = '';
try { head = sh('git rev-parse HEAD'); } catch {}
const marker = readFileSync(markerPath, 'utf8').trim();
if (!head || marker !== head) {
  block('Blocked: run the visual check in CLAUDE.md (Before every push) for this commit first.');
}
allow();
