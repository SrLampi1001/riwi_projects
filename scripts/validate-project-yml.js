#!/usr/bin/env node
/*
 * Walks the repository, parses every project.yml, and validates it against
 * the contract documented in docs/project-yml-contract.md.
 *
 * Run locally: `npm run lint:yml`
 * Used by:     .github/workflows/yaml-lint.yml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ALLOWED_TYPES = [
  'collection',
  'script',
  'cli',
  'static-site',
  'web-app',
  'api',
  'automation',
  'ai-application',
  'documentation',
  'library',
  'framework',
];

const ALLOWED_STATUSES = [
  'completed',
  'in progress',
  'incomplete',
  'released',
  'hiatus',
  'unsatisfactory',
];

const REQUIRED_TOP_FIELDS = [
  'id',
  'name',
  'description',
  'type',
  'categories',
  'tags',
  'tech_stack',
  'repository',
];

const REQUIRED_REPO_FIELDS = ['provider', 'owner', 'name', 'branch'];

const SKIP_DIRS = new Set(['.git', 'node_modules']);

function findProjectYmlFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      // Unreadable directory (permissions, etc.) — skip.
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.git/')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(full);
      } else if (entry.isFile() && entry.name === 'project.yml') {
        out.push(full);
      }
    }
  }
  out.sort();
  return out;
}

function validate(file, data) {
  const errors = [];
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('top-level must be a mapping');
    return errors;
  }
  if (!Object.prototype.hasOwnProperty.call(data, 'project')) {
    errors.push('top-level "project" key is required');
    return errors;
  }
  const project = data.project;
  if (project === null || typeof project !== 'object' || Array.isArray(project)) {
    errors.push('"project" must be a mapping');
    return errors;
  }
  for (const field of REQUIRED_TOP_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(project, field)) {
      errors.push(`project.${field} is required`);
    }
  }
  if (project.type !== undefined && !ALLOWED_TYPES.includes(project.type)) {
    errors.push(
      `project.type "${project.type}" is not in the allowed list: ${ALLOWED_TYPES.join(', ')}`
    );
  }
  if (project.status !== undefined && !ALLOWED_STATUSES.includes(project.status)) {
    errors.push(
      `project.status "${project.status}" is not in the allowed list: ${ALLOWED_STATUSES.join(', ')}`
    );
  }
  if (project.repository !== undefined) {
    if (
      project.repository === null ||
      typeof project.repository !== 'object' ||
      Array.isArray(project.repository)
    ) {
      errors.push('project.repository must be a mapping');
    } else {
      for (const field of REQUIRED_REPO_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(project.repository, field)) {
          errors.push(`project.repository.${field} is required`);
        }
      }
    }
  }
  return errors;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const files = findProjectYmlFiles(root);
  let failed = 0;
  for (const file of files) {
    let data;
    try {
      data = yaml.load(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      console.error(`FAIL  ${path.relative(root, file)}`);
      console.error(`      YAML parse error: ${err.message}`);
      failed += 1;
      continue;
    }
    const errors = validate(file, data);
    if (errors.length > 0) {
      console.error(`FAIL  ${path.relative(root, file)}`);
      for (const err of errors) console.error(`      - ${err}`);
      failed += 1;
    } else {
      console.log(`ok    ${path.relative(root, file)}`);
    }
  }
  console.error('');
  console.error(`${files.length} project.yml file(s) checked, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
