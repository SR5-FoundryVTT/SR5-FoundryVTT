import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5Item } from '../module/item/SR5Item';

/**
 * Unit tests around rules for ranged weapons.
 * 
 * Recoil, firemode and so forth.
 * @param context 
 */
export const shadowrunSR5RangedWeaponRules = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    })

    describe('Handle recoil, recoil compensation and recoil modifier', () => {
        it('Combine actor and item recoil compensation', async () => {
            // const actor = await testActor.create({type: 'character'});
            // const item = await testItem.create({type: 'weapon', system: {category: 'ranged'}});
            // const modification = new SR5Item({name: 'Mod', type: 'modification', system: {type: 'weapon', rc: 2}}, {parent: item});
            // //@ts-expect-error TODO: foundry-vtt-types v10
            // await item.createNestedItem(modification._source);

            // const character = actor.asCharacter() as Shadowrun.CharacterActorData;
            // const actorRc = character.system.values.recoil_compensation.value;
            // const itemRc = item.system.range?.rc.value;

            // assert.strictEqual(actorRc, 2);
            // assert.strictEqual(itemRc, 2);
        });
    });
}