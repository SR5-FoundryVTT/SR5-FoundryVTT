import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "../module/item/SR5Item";

export const shadowrunSR5Item = (context: QuenchBatchContext) => {
    /**
     * Setup handling for all items within this test.
     */
    const {describe, it, before, after} = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})
    after(async () => {})

    describe('SR5Items', () => {
        it('create a naked item of any type', async () => {
            const item = await SR5Item.create({type: 'action', name: 'QUENCH'}) as SR5Item<'action'>;

            // Check basic foundry data integrity
            assert.notStrictEqual(item.id, '');
            assert.notStrictEqual(item.id, undefined);
            assert.notStrictEqual(item.id, null);

            // Check foundry item collection integrity
            const itemFromCollection = game.items.get(item.id!);
            assert.notStrictEqual(itemFromCollection, null);
            assert.strictEqual(item.id, itemFromCollection?.id);

            await item.delete();
        });

        it('embedd a ammo into a weapon and not the global item collection', async () => {
            const weapon = await SR5Item.create({type: 'weapon', name: 'QUENCH', system: {category: 'range'}}) as SR5Item<'weapon'>;
            const ammo = new SR5Item<'ammo'>({type: 'ammo', name: 'QUENCH'});

            await weapon.createNestedItem(ammo.toObject());

            const embeddedItemDatas = weapon.getNestedItems();
            assert.isNotEmpty(embeddedItemDatas);
            assert.lengthOf(embeddedItemDatas, 1);

            const embeddedAmmoData = embeddedItemDatas[0];
            assert.strictEqual(embeddedAmmoData.type, ammo.type);

            // An embedded item should NOT appear in the items collection.
            const embeddedAmmoInCollection = game.items?.get(embeddedAmmoData._id);
            assert.strictEqual(embeddedAmmoInCollection, undefined);

            await weapon.delete();
        });

        describe('Testing related data injection', () => {
            // TODO: taMiF => these seem to have trouble with not injecting into changedata in _preUpdate but with applying diffs to system
            it('Correctly add defense tests to spells', async () => {
                const item = await SR5Item.create({type: 'spell', name: 'QUENCH'}) as SR5Item<'spell'>;

                await item.update({ system: { category: 'combat' } });
                assert.equal(item.system.action.test, 'SpellCastingTest');
                assert.equal(item.system.action.followed.test, 'DrainTest');
                assert.equal(item.system.action.opposed.test, 'CombatSpellDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');

                await item.update({ system: { category: 'detection' } });
                assert.equal(item.system.action.test, 'SpellCastingTest');
                assert.equal(item.system.action.followed.test, 'DrainTest');
                assert.equal(item.system.action.opposed.test, 'OpposedTest');
                assert.equal(item.system.action.opposed.resist.test, '');

                await item.delete();
            });
            it('Correctly add default tests to melee weapons', async () => {
                const item = new SR5Item<'weapon'>({type: 'weapon', name: 'QUENCH'});

                await item.update({ system: { category: 'melee' } });
                assert.equal(item.system.action.test, 'MeleeAttackTest');
                assert.equal(item.system.action.followed.test, '');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');

                await item.delete();
            });
            it('Correctly add default tests to range weapons', async () => {
                const item = new SR5Item<'weapon'>({type: 'weapon'});

                await item.update({ system: { category: 'range' } });
                assert.equal(item.system.action.test, 'RangedAttackTest');
                assert.equal(item.system.action.followed.test, '');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');

                await item.delete();
            });
            it('Correctly add defense tests to complex forms', async () => {
                const item = new SR5Item<'complex_form'>({type: 'complex_form'});

                assert.equal(item.system.action.test, 'ComplexFormTest');
                assert.equal(item.system.action.followed.test, 'FadeTest');
                assert.equal(item.system.action.opposed.test, 'OpposedTest');
                assert.equal(item.system.action.opposed.resist.test, '');

                await item.delete();
            });
            it('Correctly alter default test for weapon category changes', async () => {
                const item = new SR5Item<'weapon'>({type: 'weapon'});

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

                await item.delete();
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
                const item = new SR5Item<'complex_form'>({type: 'complex_form'});
                // Should not inject.
                await item.update({'name': 'Test'}, {recursive: false});
                assert.equal(item.system.action.skill, ''); // Check if system data still exists
                await item.update({'name': 'Test2'}, {diff: false});
                assert.equal(item.system.action.skill, ''); // Check if system data still exists
                await item.update({'name': 'Test'}, {recursive: true});
                assert.equal(item.system.action.skill, ''); // Check if system data still exists

                await item.delete();
            });
        });
    });
};