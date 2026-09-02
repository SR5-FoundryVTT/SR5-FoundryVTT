import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import localization from './localization.cjs';
import { collectReferencedPaths, isKeyUsed } from './check-base-locale-usage.mjs';

function createFixture(t, files) {
    const sourceLocaleDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sr5-locales-'));
    t.after(() => fs.rmSync(sourceLocaleDir, { recursive: true, force: true }));
    for (const [relativePath, content] of Object.entries(files)) {
        const filePath = path.join(sourceLocaleDir, relativePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, typeof content === 'string' ? content : `${JSON.stringify(content, null, 4)}\n`);
    }
    return sourceLocaleDir;
}

const baseFragment = {
    SR5: {
        Markup: '<strong>Hello</strong>',
        Text: 'Hello {name}',
        Type: 'English',
    },
};

function validateFixture(sourceLocaleDir) {
    return localization.validateLocales({
        sourceLocaleDir,
        locales: ['en', 'de'],
        checkSourceReferences: false,
    });
}

test('reports missing and extra translations without copying English into generated bundles', (t) => {
    const sourceLocaleDir = createFixture(t, {
        'en/common.json': baseFragment,
        'de/common.json': { SR5: { Extra: 'Extra', Text: 'Hallo {name}' } },
    });

    const result = validateFixture(sourceLocaleDir);
    assert.deepEqual(result.warnings, [{ locale: 'de', missing: ['SR5.Markup', 'SR5.Type'], extra: ['SR5.Extra'] }]);

    const outputDir = path.join(sourceLocaleDir, 'output');
    localization.buildLocales(outputDir, {
        sourceLocaleDir,
        locales: ['en', 'de'],
        checkSourceReferences: false,
    });
    const english = JSON.parse(fs.readFileSync(path.join(outputDir, 'en', 'config.json'), 'utf8'));
    const german = JSON.parse(fs.readFileSync(path.join(outputDir, 'de', 'config.json'), 'utf8'));
    assert.equal(english.SR5.Markup, '<strong>Hello</strong>');
    assert.equal(german.SR5.Markup, undefined);
    assert.equal(german.SR5.Extra, 'Extra');
    assert.equal(german.SR5.Text, 'Hallo {name}');
});

test('rejects invalid translations', async (t) => {
    const cases = [
        ['empty value', { SR5: { Text: '' } }, /de key "SR5\.Text" is empty/],
        ['missing marker', { SR5: { Text: '[MISSING]' } }, /de key "SR5\.Text" contains \[MISSING\]/],
        ['placeholder change', { SR5: { Text: 'Hallo {user}' } }, /does not preserve interpolation placeholders/],
        ['markup change', { SR5: { Markup: '<em>Hallo</em>' } }, /does not preserve HTML tag structure/],
        ['type mismatch', { SR5: { Text: 1 } }, /localization values must be strings/],
    ];

    for (const [name, germanFragment, expectedError] of cases) {
        await t.test(name, (subtest) => {
            const sourceLocaleDir = createFixture(subtest, {
                'en/common.json': baseFragment,
                'de/common.json': germanFragment,
            });
            assert.throws(() => validateFixture(sourceLocaleDir), expectedError);
        });
    }
});

test('rejects malformed JSON, duplicate paths, and unsorted keys', async (t) => {
    await t.test('malformed JSON', (subtest) => {
        const sourceLocaleDir = createFixture(subtest, { 'en/common.json': '{' });
        assert.throws(
            () => localization.validateLocales({ sourceLocaleDir, locales: ['en'], checkSourceReferences: false }),
            /Unable to parse/,
        );
    });

    await t.test('duplicate paths', (subtest) => {
        const sourceLocaleDir = createFixture(subtest, {
            'en/a.json': { SR5: { Text: 'Hello' } },
            'en/b.json': { SR5: { Text: 'Hello again' } },
        });
        assert.throws(
            () => localization.validateLocales({ sourceLocaleDir, locales: ['en'], checkSourceReferences: false }),
            /Duplicate locale key "SR5\.Text"/,
        );
    });

    await t.test('unsorted keys', (subtest) => {
        const sourceLocaleDir = createFixture(subtest, {
            'en/common.json': baseFragment,
            'de/common.json': { SR5: { Zulu: 'Zulu', Alpha: 'Alpha' } },
        });
        assert.throws(() => validateFixture(sourceLocaleDir), /de\/common\.json has non-alphabetical keys at "SR5"/);
    });
});

test('merges modules in filename order', (t) => {
    const sourceLocaleDir = createFixture(t, {
        'en/a.json': { SR5: { Alpha: 'A' } },
        'en/z.json': { SR5: { Zulu: 'Z' } },
    });
    const locale = localization.loadLocale('en', { sourceLocaleDir });
    assert.deepEqual(locale.modules, ['a', 'z']);
    assert.deepEqual(locale.data, { SR5: { Alpha: 'A', Zulu: 'Z' } });
});

test('recognizes JSON references and interpolated localization key segments', () => {
    const references = collectReferencedPaths(new Map([
        ['src/module/tours/jsons/tour.json', '{"title":"SR5.Tours.Example.Title"}'],
        ['src/module/combat.ts', 'game.i18n.localize(`SR5.Combat.ReduceInitBy${suffix}`)'],
    ]));

    assert.equal(isKeyUsed('SR5.Tours.Example.Title', references), true);
    assert.equal(isKeyUsed('SR5.Combat.ReduceInitByOne', references), true);
    assert.equal(isKeyUsed('SR5.Combat.ReduceInitByFive', references), true);
    assert.equal(isKeyUsed('SR5.Combat.Other', references), false);
});
