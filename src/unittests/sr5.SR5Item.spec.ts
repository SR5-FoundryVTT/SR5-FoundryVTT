import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import type { SR5ItemSheet } from "@/module/item/SR5ItemSheet";
import { FlowNodeEditorFlow } from "@/module/item/flows/FlowNodeEditorFlow";

export const shadowrunSR5Item = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    type ItemSheetFixture = Pick<SR5ItemSheet, 'render' | 'element' | 'submit' | 'close' | 'expandedFlowNodes'> & { _mode: 'play' | 'edit' };

    after(async () => { await factory.destroy(); });

    describe('SR5Items', () => {
        it('edits and saves Matrix action marks and owner from Details', async () => {
            const item = await factory.createItem({ type: 'action', system: { action: { categories: ['matrix'] } } });
            const sheet = item.sheet as unknown as ItemSheetFixture;
            sheet._mode = 'edit';
            await sheet.render({ force: true });

            const marks = sheet.element.querySelector('[name="system.action.category.matrix.marks"]') as HTMLInputElement | null;
            const owner = sheet.element.querySelector('[name="system.action.category.matrix.owner"]') as HTMLInputElement | null;
            assert.isNotNull(marks);
            assert.isNotNull(owner);
            marks.value = '2';
            owner.checked = true;
            await sheet.submit();
            await sheet.close();

            await sheet.render({ force: true });
            assert.strictEqual(item.system.action.category.matrix.marks, 2);
            assert.isTrue(item.system.action.category.matrix.owner);
            assert.strictEqual(sheet.element.querySelector<HTMLInputElement>('[name="system.action.category.matrix.marks"]')?.value, '2');
            await sheet.close();

            const ordinary = await factory.createItem({ type: 'action' });
            const ordinarySheet = ordinary.sheet as unknown as ItemSheetFixture;
            ordinarySheet._mode = 'edit';
            await ordinarySheet.render({ force: true });
            assert.isNull(ordinarySheet.element.querySelector('[name="system.action.category.matrix.marks"]'));
            await ordinarySheet.close();
        });

        it('edits the action node tree from Details', async () => {
            const item = await factory.createItem({ type: 'action', system: { action: { opposed: { test: 'OpposedTest' } } } });
            const sheet = item.sheet as unknown as ItemSheetFixture;
            sheet._mode = 'edit';
            await sheet.render({ force: true });

            // The always present nodes render, the optional ones offer to be added.
            assert.isNotNull(sheet.element.querySelector('.sr5-flow-node[data-path="system.action.opposed"]'));
            assert.isNotNull(sheet.element.querySelector('.sr5-flow-node[data-path="system.action.opposed.resist"]'));
            assert.isNotNull(sheet.element.querySelector('.sr5-flow-node[data-path="system.action.followed"]'));
            const add = sheet.element.querySelector<HTMLElement>('[data-action="addFlowNode"][data-path="system.action.opposed.followed"]');
            if (!add) return assert.fail('No control to add a follow-up test below the opposed test');

            add.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isObject(foundry.utils.getProperty(item._source, 'system.action.opposed.followed'));

            await sheet.render({ force: true });
            const skill = sheet.element.querySelector<HTMLSelectElement>('[name="system.action.opposed.followed.test"]');
            if (!skill) return assert.fail('The added node does not render its test');
            skill.value = 'SuccessTest';
            await sheet.submit();
            assert.strictEqual(foundry.utils.getProperty(item._source, 'system.action.opposed.followed.test'), 'SuccessTest');

            await sheet.render({ force: true });
            const remove = sheet.element.querySelector<HTMLElement>('[data-action="removeFlowNode"][data-path="system.action.opposed.followed"]');
            if (!remove) return assert.fail('No control to remove the added node');
            remove.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isNull(foundry.utils.getProperty(item._source, 'system.action.opposed.followed'));
            await sheet.close();
        });

        it('sums up action nodes on their header and opens them on click', async () => {
            const item = await factory.createItem({ type: 'action', system: { action: { opposed: { test: 'PhysicalDefenseTest' } } } });
            const sheet = item.sheet as unknown as ItemSheetFixture;
            sheet._mode = 'edit';
            await sheet.render({ force: true });

            const node = sheet.element.querySelector<HTMLElement>('.sr5-flow-node[data-path="system.action.opposed"]');
            const header = node?.querySelector<HTMLElement>(':scope > .sr5-flow-node__header');
            if (!node || !header) return assert.fail('No opposed node header');

            // The preset actor and mode show as dimmed chips, the test by its label.
            assert.include(header.querySelector('.sr5-flow-node__test')?.textContent ?? '', game.i18n.localize('SR5.Tests.PhysicalDefenseTest'));
            assert.isAtLeast(header.querySelectorAll('.sr5-flow-chip.preset').length, 2);

            assert.isFalse(node.classList.contains('expanded'));
            header.click();
            assert.isTrue(node.classList.contains('expanded'));
            assert.isTrue(sheet.expandedFlowNodes.has('system.action.opposed'));

            // Opened nodes stay open when the sheet renders again.
            await sheet.render({ force: true });
            assert.isTrue(sheet.element.querySelector('.sr5-flow-node[data-path="system.action.opposed"]')?.classList.contains('expanded'));
            await sheet.close();
        });

        it('names choice options and toggles armor on nested action nodes', async () => {
            const item = await factory.createItem({
                type: 'action',
                system: { action: { test: 'SpellCastingTest', before: { kind: 'choice' } } } as never,
            });
            const sheet = item.sheet as unknown as ItemSheetFixture;
            sheet._mode = 'edit';
            await sheet.render({ force: true });

            const accept = sheet.element.querySelector<HTMLElement>('[data-action="addFlowOption"][data-path="system.action.before.option"][data-option="accept"]');
            if (!accept) return assert.fail('No control to add the accept option');
            accept.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isObject(foundry.utils.getProperty(item._source, 'system.action.before.option.accept'));

            // A typed name becomes the option key.
            await sheet.render({ force: true });
            const name = sheet.element.querySelector<HTMLInputElement>('.sr5-flow-node__add-option input[data-option-name]');
            const named = name?.parentElement?.querySelector<HTMLElement>('[data-action="addFlowOption"]:not([data-option])');
            if (!name || !named) return assert.fail('No control to add a named option');
            name.value = 'Hold Breath';
            named.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isObject(foundry.utils.getProperty(item._source, 'system.action.before.option.holdBreath'));

            await item.update({ 'system.action.before.option.accept': { test: 'MeleeAttackTest' } } as Item.UpdateData);
            await sheet.render({ force: true });
            const armor = sheet.element.querySelector<HTMLElement>('[data-action="toggleFlowNodeArmor"][data-path="system.action.before.option.accept"]');
            if (!armor) return assert.fail('No armor toggle on the option node');
            armor.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isTrue(foundry.utils.getProperty(item._source, 'system.action.before.option.accept.armor'));
            await sheet.close();
        });

        it('gives action nodes damage of their own and removes it', async () => {
            const item = await factory.createItem({ type: 'action', system: { action: { opposed: { test: 'PhysicalDefenseTest' } } } });
            const sheet = item.sheet as unknown as ItemSheetFixture;
            sheet._mode = 'edit';
            await sheet.render({ force: true });

            const add = sheet.element.querySelector<HTMLElement>('[data-action="addFlowNodeDamage"][data-path="system.action.opposed"]');
            if (!add) return assert.fail('No control to add damage');
            add.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isObject(foundry.utils.getProperty(item._source, 'system.action.opposed.damage'));

            await sheet.render({ force: true });
            assert.isNotNull(sheet.element.querySelector('[name="system.action.opposed.damage.base"]'));
            sheet.element.querySelector<HTMLElement>('[data-action="removeFlowNodeDamage"][data-path="system.action.opposed"]')?.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            assert.isNull(foundry.utils.getProperty(item._source, 'system.action.opposed.damage'));
            await sheet.close();
        });

        it('warns about action nodes that never run as meant', async () => {
            const item = await factory.createItem({
                type: 'action',
                system: { action: { test: 'SuccessTest', resist: { test: 'PhysicalResistTest' }, followed: { test: 'SuccessTest', actor: 'allies' } } } as never,
            });
            const { nodes } = FlowNodeEditorFlow.tree(item);
            const warnings = (path: string) => nodes.find(node => node.path === path)?.warnings ?? [];

            // Without damage, a threshold or an opposed test, the resist has nothing to resist and runs on any hit.
            assert.includeMembers(warnings('system.action.resist'), ['SR5.Flow.Node.Warnings.NoIncomingDamage', 'SR5.Flow.Node.Warnings.RunsOnClick']);
            assert.include(warnings('system.action.followed'), 'SR5.Flow.Node.Warnings.NoAllies');

            await item.update({ 'system.action.before': { kind: 'choice' } } as Item.UpdateData);
            const before = FlowNodeEditorFlow.tree(item).nodes.find(node => node.path === 'system.action.before');
            assert.include(before?.warnings ?? [], 'SR5.Flow.Node.Warnings.NoRelease');
        });

        it('edits a chemical item and a loaded dose on ammo from Details', async () => {
            const chemical = await factory.createItem({ type: 'chemical' });
            const sheet = chemical.sheet as unknown as ItemSheetFixture;
            sheet._mode = 'edit';
            await sheet.render({ force: true });

            // Only the kind shows until it's set.
            const kind = sheet.element.querySelector<HTMLSelectElement>('[name="system.kind"]');
            if (!kind) return assert.fail('No kind on a chemical');
            assert.isNull(sheet.element.querySelector('[name="system.power"]'));
            // Using a chemical is set by its kind, it has no action of its own to edit.
            assert.isNull(sheet.element.querySelector('.sr5-flow-nodes'));
            kind.value = 'toxin';
            await sheet.submit();
            await sheet.render({ force: true });

            const power = sheet.element.querySelector<HTMLInputElement>('[name="system.power"]');
            if (!power) return assert.fail('No Power for a toxin');
            power.value = '8';
            await sheet.submit();
            assert.strictEqual(foundry.utils.getProperty(chemical._source, 'system.power'), 8);
            // A toxin has no duration or addiction, a drug has no Power.
            assert.isNull(sheet.element.querySelector('[name="system.duration.formula"]'));
            await sheet.close();

            // Equipment no longer carries chemicals.
            const equipment = await factory.createItem({ type: 'equipment' });
            assert.notProperty(equipment._source.system, 'chemical');

            const ammo = await factory.createItem({ type: 'ammo' });
            const ammoSheet = ammo.sheet as unknown as ItemSheetFixture;
            ammoSheet._mode = 'edit';
            await ammoSheet.render({ force: true });
            assert.isNotNull(ammoSheet.element.querySelector('[name="system.payload.kind"]'));
            await ammoSheet.close();
        });

        it('create a naked item of any type', async () => {
            const item = await factory.createItem({type: 'action'});

            // Check basic foundry data integrity
            assert.notStrictEqual(item.id, '');
            assert.notStrictEqual(item.id, undefined);
            assert.notStrictEqual(item.id, null);

            // Check foundry item collection integrity
            const itemFromCollection = game.items.get(item.id);
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
            it('Correctly injects tests on creation, not only on update', async () => {
                // Regression guard: the document is built from a clone of the creation data before
                // _preCreate runs, so the injection has to reach the document's own source.
                const item = await factory.createItem({
                    type: 'spell',
                    system: { category: 'combat', combat: { type: 'indirect' } }
                });

                assert.equal(item.system.action.test, 'SpellCastingTest');
                assert.equal(item.system.action.followed.test, 'DrainTest');
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
                assert.equal(item.system.action.opposed.resist.test, 'PhysicalResistTest');
            });
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
                assert.equal(item.system.action.opposed.test, 'PhysicalDefenseTest');
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
