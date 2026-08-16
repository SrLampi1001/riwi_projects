#!/usr/bin/env node
/*
 * Generates .github/workflows/sync-to-develop.yml for every entry in
 * scripts/subtree-map.sh. Each generated file is placed at
 *   <prefix>/.github/workflows/sync-to-develop.yml
 * inside the develop tree so that `git subtree split --prefix=<prefix>`
 * produces a branch where the workflow sits at .github/workflows/ at the
 * root and triggers on push to that branch.
 *
 * The single source of truth is scripts/subtree-map.sh; this script
 * parses the `BRANCHES_MAP["..."]="..."` assignments.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAP = path.join(ROOT, 'scripts', 'subtree-map.sh');
const TEMPLATE = path.join(__dirname, 'sync-to-develop.template.yml');

function parseMap(text) {
  const re = /BRANCHES_MAP\["([^"]+)"\]\s*=\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ prefix: m[1], branch: m[2] });
  }
  return out;
}

function render(template, { prefix, branch }) {
  return template
    .replace(/__PREFIX__/g, prefix)
    .replace(/__BRANCH__/g, branch);
}

function main() {
  const mapText = fs.readFileSync(MAP, 'utf8');
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const entries = parseMap(mapText);
  if (entries.length === 0) {
    console.error('No entries found in subtree-map.sh; aborting.');
    process.exit(1);
  }

  let written = 0;
  for (const { prefix, branch } of entries) {
    const targetDir = path.join(ROOT, prefix, '.github', 'workflows');
    const target = path.join(targetDir, 'sync-to-develop.yml');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(target, render(template, { prefix, branch }));
    written += 1;
    console.log(`wrote ${path.relative(ROOT, target)}`);
  }

  console.error(`\n${written} workflow file(s) generated.`);
}

main();
