import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunSR5Item = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

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

        it('embedd a ammo into a weapon and not the global item collection', async () => {
            const weapon = await factory.createItem({type: 'weapon', system: {category: 'range'}});
            const ammo = await factory.createItem({type: 'ammo'});

            await weapon.createNestedItem(ammo.toObject());

            const embeddedItemDatas = weapon.getNestedItems();
            assert.isNotEmpty(embeddedItemDatas);
            assert.lengthOf(embeddedItemDatas, 1);

            const embeddedAmmoData = embeddedItemDatas[0];
            assert.strictEqual(embeddedAmmoData.type, ammo.type);

            // An embedded item should NOT appear in the items collection.
            const embeddedAmmoInCollection = game.items?.get(embeddedAmmoData._id!);
            assert.strictEqual(embeddedAmmoInCollection, undefined);
        });

        describe('Testing related data injection', () => {
            // TODO: taMiF => these seem to have trouble with not injecting into changedata in _preUpdate but with applying diffs to system
            it('Correctly add defense tests to spells', async () => {
                const item = await factory.createItem({type: 'spell'});

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
