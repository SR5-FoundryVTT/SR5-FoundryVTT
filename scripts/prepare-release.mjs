import fs from 'node:fs/promises';

const arguments_ = process.argv.slice(2);
const dryRun = arguments_.includes('--dry-run');
const [version, tag, repository] = arguments_.filter((argument) => argument !== '--dry-run');

if (!version || !tag || !repository) {
    throw new Error('Usage: node scripts/prepare-release.mjs <version> <tag> <owner/repository>');
}

const manifestPath = new URL('../system.json', import.meta.url);
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const repositoryUrl = `https://github.com/${repository}`;

manifest.url = repositoryUrl;
manifest.manifest = `${repositoryUrl}/releases/latest/download/system.json`;
manifest.download = `${repositoryUrl}/releases/download/${encodeURIComponent(tag)}/shadowrun5e.zip`;
manifest.version = version;

const output = `${JSON.stringify(manifest, null, 4)}\n`;
if (dryRun) process.stdout.write(output);
else await fs.writeFile(manifestPath, output);
