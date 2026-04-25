import { SR5Actor } from '@/module/actor/SR5Actor';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { CompanionSprite } from './Examples/CompanionSprite';
import { SpriteImporter } from '../../module/apps/actorImport/spriteImporter/SpriteImporter';
import { importOptionsType } from '@/module/apps/actorImport/characterImporter/CharacterImporter';

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
    } satisfies importOptionsType;

    describe('Chummer Sprite Importer', () => {
        it('Should import a chummer character', async () => {
            sprite = await SpriteImporter.import(character, importOptions);
            assert.notEqual(sprite, null, 'sprite not created');
            factory.actors.push(sprite!);
            assert.strictEqual(sprite!.system.spriteType, 'companion');
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
