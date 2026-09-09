import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "@/module/item/SR5Item";
import { SR5ItemCompendium } from "@/module/item/SR5ItemCompendium";
import { HooksManager } from "@/module/hooks";

export const shadowrunSR5Item = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    /** Poll until a condition holds, for work dispatched from a document hook without being awaited. */
    const waitFor = async (predicate: () => boolean, timeout = 1000) => {
        const start = Date.now();
        while (!predicate() && (Date.now() - start < timeout)) {
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        return predicate();
    };

    describe('SR5Items', () => {
        it('create a naked item of any type', async () => {
            const item = await factory.createItem({type: 'action'});

            // Check basic foundry data integrity
            assert.notStrictEqual(item.id, '');
            assert.notStrictEqual(item.id, undefined);
            assert.notStrictEqual(item.id, null);

            // Check foundry item collection integrity
            const itemFromCollection = game.items.get(item.id!);
            assert.notStrictEqual(itemFromCollection, null);
            assert.strictEqual(item.id, itemFromCollection?.id);
        });

        it('link ammo to a weapon as a sibling item in the global item collection', async () => {
            const weapon = await factory.createItem({type: 'weapon', system: {category: 'range'}});
            const ammo = await factory.createItem({type: 'ammo'});

            await weapon.createChildItems(ammo.toObject());

            const linkedItemDatas = weapon.childItems.map(item => item.toObject(false));
            assert.isNotEmpty(linkedItemDatas);
            assert.lengthOf(linkedItemDatas, 1);

            const linkedAmmoData = linkedItemDatas[0];
            assert.strictEqual(linkedAmmoData.type, ammo.type);
            assert.strictEqual(linkedAmmoData.system.parentId, weapon.id);

            // A linked item is a sibling and should appear in the items collection.
            const linkedAmmoInCollection = game.items?.get(linkedAmmoData._id!);
            assert.notStrictEqual(linkedAmmoInCollection, undefined);
        });

        it('deletes linked children when their parent is deleted', async () => {
            const weapon = await factory.createItem({type: 'weapon', system: {category: 'range'}});
            const ammo = await factory.createItem({type: 'ammo'});
            await ammo.update({ system: { parentId: weapon.id } } as any);

            await weapon.delete();

            assert.isUndefined(game.items.get(ammo.id!));
        });

        it('deletes linked children at any depth', async () => {
            const container = await factory.createItem({type: 'container'});
            const nested = await factory.createItem({type: 'container'});
            const content = await factory.createItem({type: 'ammo'});
            await nested.update({ system: { parentId: container.id } } as any);
            await content.update({ system: { parentId: nested.id } } as any);

            await container.delete();

            assert.isUndefined(game.items.get(nested.id!));
            assert.isUndefined(game.items.get(content.id!));
        });

        it('keeps items which have been unlinked from their former parent', async () => {
            const container = await factory.createItem({type: 'container'});
            const content = await factory.createItem({type: 'ammo'});
            await content.update({ system: { parentId: container.id } } as any);
            await content.update({ system: { parentId: null } } as any);

            await container.delete();

            assert.isDefined(game.items.get(content.id!));
        });

        it('deletes an actor-owned parent together with its attachments', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [
                { name: 'Ares Alpha', type: 'weapon', system: { category: 'range' } },
            ]) as SR5Item<'weapon'>[];
            const [ammo, mod] = await actor.createEmbeddedDocuments('Item', [
                { name: 'APDS', type: 'ammo', system: { parentId: weapon.id } },
                { name: 'Gas Vent', type: 'modification', system: { parentId: weapon.id, type: 'weapon' } },
            ]) as SR5Item[];

            await weapon.delete();

            assert.isUndefined(actor.items.get(ammo.id!), 'ammo');
            assert.isUndefined(actor.items.get(mod.id!), 'modification');
        });

        it('keeps an actor-owned parent when only a child is deleted', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [
                { name: 'Ares Alpha', type: 'weapon', system: { category: 'range' } },
            ]) as SR5Item<'weapon'>[];
            const [ammo] = await actor.createEmbeddedDocuments('Item', [
                { name: 'APDS', type: 'ammo', system: { parentId: weapon.id } },
            ]) as SR5Item[];

            await ammo.delete();

            assert.isDefined(actor.items.get(weapon.id!));
        });

        it('terminates deletion on a parentId cycle', async () => {
            const first = await factory.createItem({type: 'container'});
            const second = await factory.createItem({type: 'container'});
            await first.update({ system: { parentId: second.id } } as any);
            await second.update({ system: { parentId: first.id } } as any);

            await first.delete();

            assert.isUndefined(game.items.get(first.id!));
            assert.isUndefined(game.items.get(second.id!));
        });

        it('carries linked children along when an item is copied onto an actor', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const weapon = await factory.createItem({type: 'weapon', system: {category: 'range'}});
            const ammo = await factory.createItem({type: 'ammo', name: 'Linked APDS'});
            await ammo.update({ system: { parentId: weapon.id } } as any);

            const itemData = await SR5Item.createWithLinkedItems([weapon]);
            const created = await actor.createEmbeddedDocuments('Item', itemData, { keepId: true }) as SR5Item[];

            const copiedWeapon = created.find(item => item.type === 'weapon');
            const copiedAmmo = actor.items.find(item => item.name === 'Linked APDS') as SR5Item | undefined;

            assert.exists(copiedAmmo);
            assert.strictEqual(copiedAmmo?.system.parentId, copiedWeapon?.id);
            // The copy must not point back at the world item it was made from.
            assert.notStrictEqual(copiedAmmo?.system.parentId, weapon.id);
        });

        it('moves contents along when their container changes folder', async () => {
            const container = await factory.createItem({type: 'container'});
            const content = await factory.createItem({type: 'ammo'});
            await content.update({ system: { parentId: container.id } } as any);

            const folder = await Folder.create({ name: '#QUENCH Contents', type: 'Item' });
            // Any key works here; the factory deletes every folder it has recorded on teardown.
            factory.createdFolder.set('ItemContentsMove', folder!.id);
            await container.update({ folder: folder!.id });

            // The sync is dispatched from _onUpdate without being awaited, as Foundry hooks are.
            const moved = await waitFor(() => game.items.get(content.id!)?.folder?.id === folder!.id);
            assert.isTrue(moved, 'contents followed their container');
        });

        it('prepares world items which own children once the collection is built', async () => {
            const weapon = await factory.createItem({type: 'weapon', system: {category: 'range'}});
            const mod = await factory.createItem({
                type: 'modification',
                system: { type: 'weapon', mod_weapon: { rc: 2 }, technology: { equipped: true } },
            });
            await mod.update({ system: { parentId: weapon.id } } as any);

            // Wipe the derived value the way an out-of-order construction during world load would.
            weapon.system.range.rc.value = 0;
            HooksManager.prepareLinkedWorldItems();

            assert.strictEqual(weapon.system.range.rc.value, 2);
        });

        it('maps each parent item type to the modification type it accepts', () => {
            assert.strictEqual(SR5Item.modificationTypeFor('weapon'), 'weapon');
            assert.strictEqual(SR5Item.modificationTypeFor('armor'), 'armor');
            // Ware shares one modification type rather than using its own item type.
            assert.strictEqual(SR5Item.modificationTypeFor('bioware'), 'ware');
            assert.strictEqual(SR5Item.modificationTypeFor('cyberware'), 'ware');
            assert.isNull(SR5Item.modificationTypeFor('equipment'));

            assert.isTrue(SR5Item.isAttachment('cyberware', 'modification'));
            assert.isTrue(SR5Item.isAttachment('weapon', 'ammo'));
            assert.isFalse(SR5Item.isAttachment('equipment', 'modification'));
            assert.isFalse(SR5Item.isAttachment('armor', 'ammo'));
        });

        it('refuses to contain itself, an ancestor, or a tree past the depth limit', async () => {
            const outer = await factory.createItem({type: 'container'});
            const inner = await factory.createItem({type: 'container'});
            await inner.update({ system: { parentId: outer.id } } as any);

            assert.isFalse(await outer.canContainItem(outer), 'itself');
            assert.isFalse(await inner.canContainItem(outer), 'its own ancestor');
            assert.isTrue(await outer.canContainItem(await factory.createItem({type: 'ammo'})));

            // Build a chain long enough that nesting it under outer would exceed MAX_CONTAINER_DEPTH.
            let deepest = await factory.createItem({type: 'container'});
            const root = deepest;
            for (let i = 0; i < SR5Item.MAX_CONTAINER_DEPTH; i++) {
                const next = await factory.createItem({type: 'container'});
                await next.update({ system: { parentId: deepest.id } } as any);
                deepest = next;
            }

            assert.isFalse(await outer.canContainItem(root), 'a subtree deeper than the limit');
        });

        it('stops building linked item data at the maximum nesting depth', async () => {
            let deepest = await factory.createItem({type: 'container'});
            const root = deepest;
            for (let i = 0; i < SR5Item.MAX_CONTAINER_DEPTH + 2; i++) {
                const next = await factory.createItem({type: 'container'});
                await next.update({ system: { parentId: deepest.id } } as any);
                deepest = next;
            }

            const itemData = await SR5Item.createWithLinkedItems([root]);

            assert.isAtMost(itemData.length, SR5Item.MAX_CONTAINER_DEPTH + 1);
        });

        it('detects linked child items for item compendium display', () => {
            const parent = { _id: 'parent', name: 'Parent' };
            const child = { _id: 'child', name: 'Child', system: { parentId: 'parent' } };
            const orphan = { _id: 'orphan', name: 'Orphan', system: { parentId: 'missing' } };
            const index = new foundry.utils.Collection<any>([
                [parent._id, parent],
                [child._id, child],
                [orphan._id, orphan],
            ]);

            const hiddenIds = SR5ItemCompendium.linkedChildIds(index);

            assert.deepEqual(hiddenIds, ['child']);
        });

        describe('Testing related data injection', () => {
            it('Correctly adds defense tests without resist tests to direct combat spells', async () => {
                const item = await factory.createItem({type: 'spell'});

                await item.update({ system: { category: 'combat', combat: { type: 'direct' } } });
                assert.equal(item.system.action.test, 'SpellCastingTest');
                assert.equal(item.system.action.followed.test, 'DrainTest');
                assert.equal(item.system.action.opposed.test, 'CombatSpellDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, '');
            });
            it('Correctly adds default opposed tests to detection spells', async () => {
                const item = await factory.createItem({type: 'spell'});

                await item.update({ system: { category: 'detection' } });
                assert.equal(item.system.action.test, 'SpellCastingTest');
                assert.equal(item.system.action.followed.test, 'DrainTest');
                assert.equal(item.system.action.opposed.test, 'OpposedTest');
                assert.equal(item.system.action.opposed.resist.test, '');
            });
            it('Correctly keeps resist tests for indirect combat spells', async () => {
                const item = await factory.createItem({type: 'spell'});

                await item.update({ system: { category: 'combat', combat: { type: 'indirect' } } });
                assert.equal(item.system.action.test, 'SpellCastingTest');
                assert.equal(item.system.action.followed.test, 'DrainTest');
                assert.equal(item.system.action.opposed.test, 'CombatSpellDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');
            });
            it('Correctly add default tests to melee weapons', async () => {
                const item = await factory.createItem({type: 'weapon'});

                await item.update({ system: { category: 'melee' } });
                assert.equal(item.system.action.test, 'MeleeAttackTest');
                assert.equal(item.system.action.followed.test, '');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');
            });
            it('Correctly add default tests to range weapons', async () => {
                const item = await factory.createItem({ type: 'weapon' });

                await item.update({ system: { category: 'range' } });
                assert.equal(item.system.action.test, 'RangedAttackTest');
                assert.equal(item.system.action.followed.test, '');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');
            });
            it('Correctly add defense tests to complex forms', async () => {
                const item = await factory.createItem({ type: 'complex_form' });

                assert.equal(item.system.action.test, 'ComplexFormTest');
                assert.equal(item.system.action.followed.test, 'FadeTest');
                assert.equal(item.system.action.opposed.test, 'OpposedTest');
                assert.equal(item.system.action.opposed.resist.test, '');
            });
            it('Correctly alter default test for weapon category changes', async () => {
                const item = await factory.createItem({  type: 'weapon' });

                await item.update({ system: { category: 'range' } });
                assert.equal(item.system.action.test, 'RangedAttackTest');
                assert.equal(item.system.action.followed.test, '');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');

                await item.update({ system: { category: '' } });
                assert.equal(item.system.action.test, '');
                assert.equal(item.system.action.followed.test, '');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');
            });
            it('Correctly stop injection when mergeOptions recursive or diff are set to false', async () => {
                /**
                 * Foundry sometimes updates document data by replacing foundry data segements fully:
                 * recusrive: true and sometimes diff: true
                 * 
                 * In that case, injecting ANYthing into systemdata will replace ALL of system data
                 * with what is meant to be injected.
                 * 
                 * This is testing UpdateActionFlow.injectActionTestsIntoChangeData which is connected to some 
                 * document lifecycle methods.
                 */
                const item = await factory.createItem({ type: 'complex_form'});
                // Should not inject.
                await item.update({'name': 'Test'}, {recursive: false});
                assert.equal(item.system.action.skill, ''); // Check if system data still exists
                await item.update({'name': 'Test2'}, {diff: false});
                assert.equal(item.system.action.skill, ''); // Check if system data still exists
                await item.update({'name': 'Test'}, {recursive: true});
                assert.equal(item.system.action.skill, ''); // Check if system data still exists
            });
        });
    });
};
