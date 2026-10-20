import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import {
    mirrorD6Preset,
    mirrorD6Presets,
    DiceSoNiceLoadedPreset,
    DiceSoNiceSystem,
} from '@/module/rolls/DiceSoNice';

/**
 * Stand-in for Dice So Nice's `DicePreset`: a class instance, so
 * `foundry.utils.deepClone` would hand it back by reference.
 */
class FakeDicePreset {
    constructor(data: DiceSoNiceLoadedPreset) {
        Object.assign(this, data);
    }
}

const loaded = (data: DiceSoNiceLoadedPreset) => new FakeDicePreset(data) as DiceSoNiceLoadedPreset;

export const shadowrunDiceSoNiceTesting = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('Dice So Nice integration', () => {
        it('mirrors d6 preset fields to ds while keeping the target system', () => {
            const d6Preset = loaded({
                type: 'd6',
                labels: ['d6-1.webp', 'd6-2.webp', 'd6-3.webp', 'd6-4.webp', 'd6-5.webp', 'd6-6.webp'],
                system: 'dot',
                atlas: 'modules/dice-so-nice/textures/dot.json',
                bumps: ['d6-1-b.webp', 'd6-2-b.webp', 'd6-3-b.webp', 'd6-4-b.webp', 'd6-5-b.webp', 'd6-6-b.webp'],
                emissiveMaps: ['d6-1-e.webp', 'd6-2-e.webp'],
                emissive: 0xffffff,
                emissiveIntensity: 0.8,
                font: 'FoundryVTT',
                fontScale: 0.9,
                colorset: 'spectrum_default',
                backgrounds: { labels: ['background.webp'], bumpMaps: ['background-bump.webp'] },
                labelScale: 0.75,
            });

            const preset = mirrorD6Preset(d6Preset, 'dot');

            assert.deepEqual(preset, {
                type: 'ds',
                labels: ['d6-1.webp', 'd6-2.webp', 'd6-3.webp', 'd6-4.webp', 'd6-5.webp', 'd6-6.webp'],
                system: 'dot',
                atlas: 'modules/dice-so-nice/textures/dot.json',
                bumpMaps: ['d6-1-b.webp', 'd6-2-b.webp', 'd6-3-b.webp', 'd6-4-b.webp', 'd6-5-b.webp', 'd6-6-b.webp'],
                emissiveMaps: ['d6-1-e.webp', 'd6-2-e.webp'],
                emissive: 0xffffff,
                emissiveIntensity: 0.8,
                font: 'FoundryVTT',
                fontScale: 0.9,
                colorset: 'spectrum_default',
                backgrounds: { labels: ['background.webp'], bumpMaps: ['background-bump.webp'] },
                labelScale: 0.75,
            });
        });

        it('leaves the loaded d6 preset untouched', () => {
            const d6Preset = loaded({
                type: 'd6',
                labels: ['1', '2', '3', '4', '5', '6'],
                system: 'standard',
                bumps: ['d6-1-b.webp'],
                colorset: null,
                fontScale: null,
                modelFile: null,
                valueMap: null,
            });

            const preset = mirrorD6Preset(d6Preset, 'standard');
            preset.labels.push('7');
            preset.bumpMaps!.push('d6-2-b.webp');

            assert.notStrictEqual<object>(preset, d6Preset);
            assert.equal(d6Preset.type, 'd6');
            assert.equal(d6Preset.system, 'standard');
            assert.deepEqual(d6Preset.labels, ['1', '2', '3', '4', '5', '6']);
            assert.deepEqual(d6Preset.bumps, ['d6-1-b.webp']);
            assert.deepEqual(preset, {
                type: 'ds',
                labels: ['1', '2', '3', '4', '5', '6', '7'],
                system: 'standard',
                bumpMaps: ['d6-1-b.webp', 'd6-2-b.webp'],
            });
        });

        it('mirrors every system with a d6 preset', () => {
            const dotLabels = ['d6-1.webp', 'd6-2.webp', 'd6-3.webp', 'd6-4.webp', 'd6-5.webp', 'd6-6.webp'];
            const dotBlackLabels = ['d6-1-black.webp', 'd6-2-black.webp', 'd6-3-black.webp', 'd6-4-black.webp', 'd6-5-black.webp', 'd6-6-black.webp'];
            const atlas = 'modules/dice-so-nice/textures/dot.json';

            const systems = new Map<string, DiceSoNiceSystem>([
                ['standard', { dice: new Map([['d6', loaded({ type: 'd6', labels: ['1', '2', '3', '4', '5', '6'], system: 'standard' })]]) }],
                ['dot', { dice: new Map([['d6', loaded({ type: 'd6', labels: dotLabels, bumps: ['d6-1-b.webp', 'd6-2-b.webp'], atlas, system: 'dot' })]]) }],
                ['dot_b', { dice: new Map([['d6', loaded({ type: 'd6', labels: dotBlackLabels, bumps: ['d6-1-b.webp', 'd6-2-b.webp'], atlas, system: 'dot_b' })]]) }],
                ['foundry_vtt', { dice: new Map([['d6', loaded({ type: 'd6', labels: ['1', '2', '3', '4', '5', 'E'], font: 'FoundryVTT', system: 'foundry_vtt' })]]) }],
                ['spectrum', { dice: new Map([['d6', loaded({ type: 'd6', labels: dotLabels, emissiveMaps: dotLabels, emissive: 0xffffff, colorset: 'spectrum_default', system: 'spectrum' })]]) }],
                ['without_d6', { dice: new Map([['d8', loaded({ type: 'd8', labels: ['1'], system: 'without_d6' })]]) }],
            ]);

            const presets = mirrorD6Presets(systems);

            assert.sameMembers(presets.map(preset => preset.system), ['standard', 'dot', 'dot_b', 'foundry_vtt', 'spectrum']);
            assert.isTrue(presets.every(preset => preset.type === 'ds'));
            assert.deepInclude(presets, { type: 'ds', labels: ['1', '2', '3', '4', '5', '6'], system: 'standard' });
            assert.deepInclude(presets, { type: 'ds', labels: dotLabels, bumpMaps: ['d6-1-b.webp', 'd6-2-b.webp'], atlas, system: 'dot' });
            assert.deepInclude(presets, { type: 'ds', labels: dotBlackLabels, bumpMaps: ['d6-1-b.webp', 'd6-2-b.webp'], atlas, system: 'dot_b' });
            assert.deepInclude(presets, { type: 'ds', labels: ['1', '2', '3', '4', '5', 'E'], font: 'FoundryVTT', system: 'foundry_vtt' });
            assert.deepInclude(presets, { type: 'ds', labels: dotLabels, emissiveMaps: dotLabels, emissive: 0xffffff, colorset: 'spectrum_default', system: 'spectrum' });
            for (const [, system] of systems) {
                for (const [type, preset] of system.dice) assert.equal(preset.type, type);
            }
        });
    });
};
