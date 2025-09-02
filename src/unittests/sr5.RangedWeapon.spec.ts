import { SR5TestFactory } from './utils';
import { SR5Item } from '../module/item/SR5Item';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

/**
 * Unit tests around rules for ranged weapons.
 * 
 * Recoil, firemode and so forth.
 * @param context 
 */
export const shadowrunSR5RangedWeaponRules = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });


    const getWeaponWithEquippedAmmo = async (weaponAmmo: number, weaponAmmoMax: number, ammoQuantity: number) => {
        const actor = await factory.createActor({ type: 'character', system: { attributes: { agility: { base: 3 } } } });
        const items = await actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'weapon', system: {category: 'range', ammo: {current: {value: weaponAmmo, max: weaponAmmoMax}}}}]);
        const item = items[0] as SR5Item<'weapon'>;

        const ammoItem = await factory.createItem({type: 'ammo', system: {technology: {quantity: ammoQuantity, equipped: true}}});
        await item.addLinkedItem(ammoItem);

        return item;
    };

    describe('Handle recoil, recoil compensation and recoil modifier', () => {
        it('Item recoil compensation', async () => {
            const weapon = await factory.createItem({type: 'weapon', system: {category: 'range' }});
            const modification = await factory.createItem({type: 'modification', system: {type: 'weapon', rc: 2, technology: {equipped: true}}});
            await weapon.addLinkedItem(modification);

            const weaponRc = weapon.system.range.rc.value;

            assert.strictEqual(weaponRc, 2);
        });

        it('Reload weapon causes reduction in available clips', async () => {
            const actor = await factory.createActor({type: 'character'});
            const items = await actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'weapon', system: {category: 'range', ammo: {current: {value: 0, max: 30}, spare_clips: {value: 1, max: 1}}}}]);
            const item = items[0] as SR5Item<'weapon'>;
            assert.strictEqual(item.system.ammo.spare_clips.value, 1);
            await item.reloadAmmo(false);
            assert.strictEqual(item.system.ammo.spare_clips.value, 0);
        });

        it('Reloads weapon fully when no ammo is used', async () => {
            const actor = await factory.createActor({type: 'character'});
            const items = await actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'weapon', system: {category: 'range', ammo: {current: {value: 0, max: 30}}}}]);
            const item = items[0] as SR5Item<'weapon'>;

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

        it('Does full reload when equipped ammo has some bullets left', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 10);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 10);
            await item.reloadAmmo(false);
            assert.strictEqual(item.system.ammo.current.value, 25);
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

        it('Does partially reload on break action clip type', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 10);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 10);
            item.system.ammo.clip_type = 'break_action';
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, 17);
            assert.strictEqual(ammo.system.technology?.quantity, 8);
        });

        it('Does partially reload on cylinder clip type', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 10);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 10);
            item.system.ammo.clip_type = 'cylinder';
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, 18);
            assert.strictEqual(ammo.system.technology?.quantity, 7);
        });

        it('Does partially reload on bow clip type', async () => {
            // Set current bullets to partial value.
            const item = await getWeaponWithEquippedAmmo(15, 30, 10);

            const ammo = item.getEquippedAmmo()!;
            assert.strictEqual(item.system.ammo.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 10);
            item.system.ammo.clip_type = 'bow';
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo.current.value, 16);
            assert.strictEqual(ammo.system.technology?.quantity, 9);
        });
    });
}
