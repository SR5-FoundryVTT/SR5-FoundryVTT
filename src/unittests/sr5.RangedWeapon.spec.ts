import { SR5Actor } from './../module/actor/SR5Actor';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5Item } from '../module/item/SR5Item';

/**
 * Unit tests around rules for ranged weapons.
 * 
 * Recoil, firemode and so forth.
 * @param context 
 */
export const shadowrunSR5RangedWeaponRules = (context: QuenchBatchContext) => {
    const {describe, it, before, after} = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})
    after(async () => {})

    const getWeaponWithEquippedAmmo = async (weaponAmmo: number, weaponAmmoMax: number, ammoQuantity: number) => {
        const actor = new SR5Actor<'character'>({type: 'character', name: 'Test Character'});
        //@ts-expect-error
        const items = actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'weapon', system: {category: 'range', ammo: {current: {value: weaponAmmo, max: weaponAmmoMax}}}}]);
        const item = items![0] as SR5Item<'weapon'>;
        // const item = await testItem.create({type: 'weapon', system: {category: 'range', ammo: {current: {value: weaponAmmo, max: weaponAmmoMax}}}}) as SR5Item;
        //@ts-expect-error
        const ammoItem = new SR5Item<'ammo'>({type: 'ammo', name: 'ammo', system: {technology: {quantity: ammoQuantity, equipped: true}}}, {parent: item});
        await item.createNestedItem(ammoItem.toObject());

        // NOTE: I don't know why ammo is not equipped when created as such... this can be removed, if that is fixed.
        await item.equipAmmo(item.items[0].id);
        
        return item;
    };

    describe('Handle recoil, recoil compensation and recoil modifier', () => {
        it('Combine actor and item recoil compensation', async () => {
            // const actor = await testActor.create({type: 'character'});
            // const item = await testItem.create({type: 'weapon', system: {category: 'range'}});
            // const modification = new SR5Item({name: 'Mod', type: 'modification', system: {type: 'weapon', rc: 2}}, {parent: item});
            // //@ts-expect-error TODO: foundry-vtt-types v10
            // await item.createNestedItem(modification._source);

            // const character = actor.asCharacter() as Shadowrun.CharacterActorData;
            // const actorRc = character.system.values.recoil_compensation.value;
            // const itemRc = item.system.range?.rc.value;

            // assert.strictEqual(actorRc, 2);
            // assert.strictEqual(itemRc, 2);
        });

        it('Reload weapon causes reduction in available clips', async () => {
            const actor = new SR5Actor<'character'>({type: 'character', name: 'Test Character'});
            // @ts-expect-error
            const items = await actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'weapon', system: {category: 'range', ammo: {current: {value: 0, max: 30}, spare_clips: {value: 1, max: 1}}}}]);
            const item = items![0] as SR5Item<'weapon'>;
            assert.strictEqual(item.system.ammo.spare_clips.value, 1);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.spare_clips.value, 0);
        });

        it('Reloads weapon fully when no ammo is used', async () => {
            const actor = new SR5Actor<'character'>({type: 'character', name: 'Test Character'});
            // @ts-expect-error
            const items = await actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'weapon', system: {category: 'range', ammo: {current: {value: 0, max: 30}}}}]);
            const item = items![0] as SR5Item<'weapon'>;
            // const item = await testItem.create({type: 'weapon', system: {category: 'range', ammo: {current: {value: 0, max: 30}}}}) as SR5Item;
            assert.strictEqual(item.system.ammo.current.value, 0);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, item.system.ammo.current.max);
        });

        it('Reloads weapon fully when ammo is equipped and reduced ammo', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 30);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 30);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, item.system.ammo.current.max);
            assert.strictEqual(ammo.system.technology?.quantity, 15);
        });

        it('Does not reload when equipped ammo has no bullets left', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 0);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 0);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 0);
        });

        it('Does partially reload when equipped ammo has some bullets left', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 10);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 10);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, 25);
            assert.strictEqual(ammo.system.technology?.quantity, 0);
        });
    });
}