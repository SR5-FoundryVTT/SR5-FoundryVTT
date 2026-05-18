import { SR5Actor } from '@/module/actor/SR5Actor';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { CompanionSprite } from './Examples/CompanionSprite';
import { SpriteImporter } from '../../module/apps/actorImport/spriteImporter/SpriteImporter';
import { ImportOptionsType } from '@/module/apps/actorImport/characterImporter/CharacterImporter';

export const spriteImporterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    let sprite: SR5Actor<'sprite'> | null;
    const character = CompanionSprite.characters.character;

    after(async () => { await factory.destroy(); });

    const importOptions = {
        armor: true,
        contacts: true,
        cyberware: true,
        equipment: true,
        lifestyles: true,
        metamagics: true,
        powers: true,
        qualities: true,
        rituals: true,
        spells: true,
        vehicles: true,
        weapons: true,
    } satisfies ImportOptionsType;

    describe('Chummer Sprite Importer', () => {
        it('Should import a chummer character', async () => {
            const template = await factory.createActor({
                type: 'sprite',
                system: {
                    spriteType: 'companion_template',
                    level_applies: {
                        resonance: true,
                        attack: true,
                        sleaze: true,
                        data_processing: true,
                        firewall: true,
                    },
                    attributes: {
                        resonance: { base: 1 },
                    },
                    matrix: {
                        attack: { base: -1 },
                        sleaze: { base: 2 },
                        data_processing: { base: 1 },
                        firewall: { base: 0 },
                    }
                }
            });

            sprite = await SpriteImporter.import(character, template, importOptions);
            assert.notEqual(sprite, null, 'sprite not created');
            factory.actors.push(sprite as Actor.Stored<'sprite'>);
            assert.strictEqual(sprite!.system.spriteType, 'companion_template');
            assert.strictEqual(sprite!.system.attributes.level.base, 2);
            assert.strictEqual(sprite!.system.attributes.level.value, 2);
            assert.strictEqual(sprite!.system.attributes.edge.base, 1);
            assert.strictEqual(sprite!.system.level_applies.sleaze, true);
            assert.strictEqual(sprite!.system.matrix.sleaze.base, 2);
        });

        it('imports a sprite using preset profile fallback without template', async () => {
            const fallbackSprite = await SpriteImporter.importFromPresetProfile(character, importOptions);
            assert.notEqual(fallbackSprite, null, 'Sprite fallback import failed');
            factory.actors.push(fallbackSprite as Actor.Stored<'sprite'>);

            assert.strictEqual(fallbackSprite!.system.spriteType, 'Companion');
            assert.strictEqual(fallbackSprite!.system.level_applies.resonance, true);
            assert.strictEqual(fallbackSprite!.system.level_applies.attack, true);
            assert.strictEqual(fallbackSprite!.system.level_applies.sleaze, true);
            assert.strictEqual(fallbackSprite!.system.level_applies.data_processing, true);
            assert.strictEqual(fallbackSprite!.system.level_applies.firewall, true);
            assert.strictEqual(fallbackSprite!.system.attributes.resonance.base, 0);
            assert.strictEqual(fallbackSprite!.system.matrix.attack.base, -1);
            assert.strictEqual(fallbackSprite!.system.matrix.sleaze.base, 1);
            assert.strictEqual(fallbackSprite!.system.matrix.data_processing.base, 0);
            assert.strictEqual(fallbackSprite!.system.matrix.firewall.base, 4);
            assert.strictEqual(fallbackSprite!.system.modifiers.matrix_initiative, 0);
            assert.strictEqual(fallbackSprite!.system.attributes.level.base, 3);
            assert.strictEqual(fallbackSprite!.system.attributes.level.value, 3);
            assert.strictEqual(fallbackSprite!.system.attributes.edge.base, 1);
        });

        it('Should have the correct item number', async () => {
            if (!sprite) throw new Error('No sprite created');
            const skillSet = await fromUuid(sprite.system.skillset) as SR5Item<'skill'> | null;
            if (!skillSet) throw new Error('No skillset assigned');

            const skillItems = await PackItemFlow.prepareSkillsForSkillSet(skillSet);
            const skillGroups = await PackItemFlow.prepareSkillGroupsForSkillSet(skillSet);
            const nonSkillItems = sprite.items.filter(item => !item.isType('skill')).length;

            assert.lengthOf(sprite.items, nonSkillItems + skillItems.length + skillGroups.length, 'Item count');
        });
    });
};


