import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import {
    mirrorD6Preset,
    mirrorD6Presets,
    DiceSoNicePreset,
    DiceSoNiceSystem,
} from '@/module/rolls/DiceSoNice';

export const shadowrunDiceSoNiceTesting = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('Dice So Nice integration', () => {
        it('mirrors d6 preset fields to ds while keeping the target system', () => {
            const d6Preset: DiceSoNicePreset = {
                type: 'd6',
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
            };

            const preset = mirrorD6Preset(d6Preset, 'dot');

            assert.deepEqual(preset, {
                ...d6Preset,
                type: 'ds',
                system: 'dot',
            });
        });

        it('mirrors every non-standard system with a d6 preset', () => {
            const dot: DiceSoNicePreset = {
                type: 'd6',
                labels: ['d6-1.webp', 'd6-2.webp', 'd6-3.webp', 'd6-4.webp', 'd6-5.webp', 'd6-6.webp'],
                bumpMaps: ['d6-1-b.webp', 'd6-2-b.webp'],
                atlas: 'modules/dice-so-nice/textures/dot.json',
                system: 'dot',
            };
            const dotBlack: DiceSoNicePreset = {
                type: 'd6',
                labels: ['d6-1-black.webp', 'd6-2-black.webp', 'd6-3-black.webp', 'd6-4-black.webp', 'd6-5-black.webp', 'd6-6-black.webp'],
                bumpMaps: ['d6-1-b.webp', 'd6-2-b.webp'],
                atlas: 'modules/dice-so-nice/textures/dot.json',
                system: 'dot_b',
            };
            const foundry: DiceSoNicePreset = {
                type: 'd6',
                labels: ['1', '2', '3', '4', '5', 'E'],
                font: 'FoundryVTT',
                system: 'foundry_vtt',
            };
            const spectrum: DiceSoNicePreset = {
                type: 'd6',
                labels: ['d6-1.webp', 'd6-2.webp', 'd6-3.webp', 'd6-4.webp', 'd6-5.webp', 'd6-6.webp'],
                emissiveMaps: ['d6-1.webp', 'd6-2.webp', 'd6-3.webp', 'd6-4.webp', 'd6-5.webp', 'd6-6.webp'],
                emissive: 0xffffff,
                colorset: 'spectrum_default',
                system: 'spectrum',
            };
            const standard: DiceSoNicePreset = {
                type: 'd6',
                labels: ['1', '2', '3', '4', '5', '6'],
                system: 'standard',
            };

            const systems = new Map<string, DiceSoNiceSystem>([
                ['standard', { dice: new Map([['d6', standard]]) }],
                ['dot', { dice: new Map([['d6', dot]]) }],
                ['dot_b', { dice: new Map([['d6', dotBlack]]) }],
                ['foundry_vtt', { dice: new Map([['d6', foundry]]) }],
                ['spectrum', { dice: new Map([['d6', spectrum]]) }],
                ['without_d6', { dice: new Map([['d8', { type: 'd8', labels: ['1'], system: 'without_d6' }]]) }],
            ]);

            const presets = mirrorD6Presets(systems);

            assert.sameMembers(presets.map(preset => preset.system), ['standard', 'dot', 'dot_b', 'foundry_vtt', 'spectrum']);
            assert.isTrue(presets.every(preset => preset.type === 'ds'));
            assert.deepInclude(presets, { ...standard, type: 'ds' });
            assert.deepInclude(presets, { ...dot, type: 'ds' });
            assert.deepInclude(presets, { ...dotBlack, type: 'ds' });
            assert.deepInclude(presets, { ...foundry, type: 'ds' });
            assert.deepInclude(presets, { ...spectrum, type: 'ds' });
        });
    });
};
