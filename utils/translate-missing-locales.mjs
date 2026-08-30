#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import localization from './localization.cjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = new Map([
    ['de', 'de'],
    ['fr', 'fr'],
    ['pt-BR', 'pt'],
]);

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readLegacyLocale(locale) {
    const content = execFileSync('git', ['show', `origin/master:public/locale/${locale}/config.json`], {
        cwd: projectRoot,
        encoding: 'utf8',
    });
    return JSON.parse(content);
}

function batchesOf(entries, maxEncodedLength = 6000) {
    const batches = [];
    let batch = [];
    let length = 0;
    for (const entry of entries) {
        const marked = `__SR5_${String(entry.index).padStart(6, '0')}__\n${entry.value}`;
        const markedLength = encodeURIComponent(marked).length;
        if (batch.length && length + markedLength > maxEncodedLength) {
            batches.push(batch);
            batch = [];
            length = 0;
        }
        batch.push({ ...entry, marked });
        length += markedLength;
    }
    if (batch.length) batches.push(batch);
    return batches;
}

function parseBatch(text, batch) {
    const marker = /__SR5_(\d{6})__\s*/g;
    const positions = [...text.matchAll(marker)];
    if (positions.length !== batch.length) {
        throw new Error(`Expected ${batch.length} translation markers, received ${positions.length}`);
    }
    const translated = new Map();
    for (let index = 0; index < positions.length; index++) {
        const match = positions[index];
        const start = match.index + match[0].length;
        const end = positions[index + 1]?.index ?? text.length;
        translated.set(Number(match[1]), text.slice(start, end).trim());
    }
    return translated;
}

async function translateBatch(batch, language, attempt = 1) {
    const query = batch.map((entry) => entry.marked).join('\n');
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', 'en');
    url.searchParams.set('tl', language);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', query);
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const text = payload[0].map((segment) => segment[0]).join('');
        return parseBatch(text, batch);
    } catch (error) {
        if (attempt >= 4) throw error;
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        return translateBatch(batch, language, attempt + 1);
    }
}

async function runLimited(tasks, limit) {
    const results = new Array(tasks.length);
    let next = 0;
    async function worker() {
        while (next < tasks.length) {
            const index = next++;
            results[index] = await tasks[index]();
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
    return results;
}

function replaceMissingValues(value, translations, prefix = '') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return translations.get(prefix) ?? value;
    }
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
        const keyPath = prefix ? `${prefix}.${key}` : key;
        return [key, replaceMissingValues(child, translations, keyPath)];
    }));
}

const base = readLegacyLocale('en');
const baseFlat = localization.flattenObject(base);

for (const [locale, language] of targets) {
    const legacy = readLegacyLocale(locale);
    const legacyFlat = localization.flattenObject(legacy);
    const currentFlat = localization.flattenObject(localization.loadLocale(locale).data);
    const missing = Object.entries(baseFlat)
        .filter(([key, value]) => {
            const originallyMissing = !(key in legacyFlat)
                || (typeof legacyFlat[key] === 'string' && !legacyFlat[key].trim());
            return originallyMissing && currentFlat[key] === value;
        })
        .map(([key, value], index) => ({ index, key, value }));
    const batches = batchesOf(missing);
    console.log(`${locale}: translating ${missing.length} strings in ${batches.length} batches`);
    const results = await runLimited(
        batches.map((batch) => () => translateBatch(batch, language)),
        4,
    );
    const byIndex = new Map(results.flatMap((result) => [...result]));
    const translations = new Map(missing.map((entry) => [entry.key, byIndex.get(entry.index)]));
    for (const moduleName of localization.MODULES) {
        const filePath = path.join(localization.SOURCE_LOCALE_DIR, locale, `${moduleName}.json`);
        const fragment = readJson(filePath);
        const translated = replaceMissingValues(fragment, translations);
        fs.writeFileSync(filePath, `${JSON.stringify(translated, null, 4)}\n`, 'utf8');
    }
}
