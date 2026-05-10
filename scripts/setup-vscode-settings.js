#!/usr/bin/env node
// Merges .vscode/settings.dist.json into .vscode/settings.json.
// Keys already present in settings.json are never overwritten — developer customizations win.
// New keys from settings.dist.json are added automatically.
// Run automatically via devcontainer postCreateCommand.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distPath = path.join(root, '.vscode', 'settings.dist.json');
const settingsPath = path.join(root, '.vscode', 'settings.json');

const dist = JSON.parse(fs.readFileSync(distPath, 'utf8'));
let current = {};
if (fs.existsSync(settingsPath)) {
  try {
    current = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    console.warn('[setup-vscode] settings.json could not be parsed (may contain JSONC comments) — treating as empty, dist keys will be added.');
  }
}

const added = [];
const merged = { ...dist, ...current };

for (const key of Object.keys(dist)) {
  if (!(key in current)) {
    added.push(key);
  }
}

fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + '\n');

if (added.length > 0) {
  console.log(`[setup-vscode] Added ${added.length} new key(s) from settings.dist.json: ${added.join(', ')}`);
} else {
  console.log('[setup-vscode] settings.json already up to date — no changes needed.');
}
