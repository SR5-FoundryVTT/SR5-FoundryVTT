import { DeepPartial } from "fvtt-types/utils";
import { SR5Item } from "../SR5Item";
import { SR5 } from '../../config';
import { PackItemFlow } from "./PackItemFlow";

/**
 * Handling of SR5Item.update changes around ActionRollData.
 */
export const UpdateActionFlow = {
    /**
     * Alter action data changes on update.
     * 
     * @param changeData The _update changes given by the event
     * @param item The item as context of what's being changed.
     */
    async onUpdateAlterActionData(changeData: Item.UpdateData, item: SR5Item) {
        await UpdateActionFlow.onSkillUpdateAlterAttribute(changeData, item);
        UpdateActionFlow.onSkillUpdateAlterAttribute2(changeData, item);
    },

    /**
     * If a skill is selected, try to autofill the connect attribute of it.
     * 
     * This differs for items on actors, as here we can access actual skill data.
     * For item outside of actors we can only use default values.
     * @param changeData  The _update changes given by the event
     * @param item The item as context of what's being changed.
     */
    async onSkillUpdateAlterAttribute(changeData: Item.UpdateData, item: SR5Item) {
        // Only change to connected attribute when no attribute has already been chosen.
        if (!('action' in item.system) || item.system.action?.attribute !== '') return;
        const skillIdOrLabel = foundry.utils.getProperty(changeData, 'system.action.skill') as string;
        if (!skillIdOrLabel) return;        

        // CASE - Sidebar item not owned by actor. => use pack skill
        if (item.actor === null) {
            // Attempt to safely access the skill data structure, fallback to undefined if not present
            const skill = await PackItemFlow.getSkill(skillIdOrLabel);
            if (!skill) return;
            if (!skill.system.skill.attribute) return;

            changeData['system.action.attribute'] = skill.system.skill.attribute; 
        // CASE - Owned Item on actor. => use derived skill data, in case of effect changes
        } else {
            // Support both legacy and custom skills.
            const skill = item.actor.getSkill(skillIdOrLabel) ?? item.actor.getSkillByLabel(skillIdOrLabel);
            if (!skill) return;
    
            changeData['system.action.attribute'] = skill.attribute;
        }
    },

    /**
     * When a skill is changed, remove the second attribute, as it's not needed and might cause confusion 
     * at different places.
     * 
     * @param changeData The _update changes given by the event
     * @param item The item as context of what's being changed.
     */
    onSkillUpdateAlterAttribute2(changeData: Item.UpdateData, item: SR5Item) {
        if (!foundry.utils.getProperty(changeData, 'system.action.skill')) return;

        changeData['system.action.attribute2'] = '';
    },

    /**
     * Inject action test data into any item 
     * 
     * This method is designed to be called on _preCreate/_preUpdate/_preCreateEmbeddedDocuments
     * 
     * Make sure to not mix up changeData and itemData
     * 
     * Depending on the caller whatever was applied to the applyData parameter must be handled differently.
     * When called by _onCreate, it must be used as updateData using Document#update
     * When called by _preUpdate, it must be applied directly to changeData
     * When called before any DocumentData as been created, it can be applied directly to the source object before Document#create
     * 
     * @param type The item type where operating on
     * @param changeData The changeData (partial or complete) that's been transmitted.
     * @param applyData An object to carry the altering data changes
     * @param item Optional item reference. This can't be given during the Chummer Item Import flow.
     */
    injectActionTestsIntoChangeData(type: string, changeData: Item.UpdateData, applyData, item?: SR5Item) {
        if (!changeData) return;

        const typeHandler = {
            'weapon': UpdateActionFlow.injectWeaponTestIntoChangeData.bind(UpdateActionFlow),
            'spell': UpdateActionFlow.injectSpellTestIntoChangeData.bind(UpdateActionFlow),
            'preparation': UpdateActionFlow.injectPreparationTestIntoChangeData.bind(UpdateActionFlow),
            'complex_form': UpdateActionFlow.injectComplexFormTestIntoChangeData.bind(UpdateActionFlow),
            'call_in_action': UpdateActionFlow.injectCallInActionTestIntoChangeData.bind(UpdateActionFlow)
        };

        const handler = typeHandler[type];
        if (!handler) return;

        handler(type, changeData, applyData, item);
    },


    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectWeaponTestIntoChangeData(type: string, changeData: DeepPartial<{system: Item.SystemOfType<'weapon'>}>, applyData) {
        // Abort when category isn't part of this change.
        if (changeData?.system?.category === undefined) return;

        // Remove test when user selects empty category.
        if (changeData.system.category === '') {
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            return;
        }

        const test = SR5.weaponCategoryActiveTests[changeData.system.category];
        if (!test) {
            console.error(`Shadowrun 5 | There is no active test configured for the weapon category ${changeData.system.category}.`, changeData);
        }

        foundry.utils.setProperty(applyData, 'system.action.test', test);
        foundry.utils.setProperty(applyData, 'system.action.opposed.test', 'PhysicalDefenseTest');
        foundry.utils.setProperty(applyData, 'system.action.opposed.resist.test', 'PhysicalResistTest');
    },

    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectSpellTestIntoChangeData(type: string, changeData: DeepPartial<{system: Item.SystemOfType<'spell'>}>, applyData, spell?: SR5Item<'spell'>) {
        // Reconfigure on category, direct/indirect or alchemical changes, including partial item updates.
        const changed = changeData?.system;
        if (changed?.category === undefined && changed?.combat?.type === undefined && changed?.alchemical === undefined) return;

        const category = changed?.category ?? spell?.system.category;
        const combatType = changed?.combat?.type ?? spell?.system.combat.type;
        const alchemical = changed?.alchemical ?? spell?.system.alchemical ?? false;
        if (category === undefined) return;

        // Remove test when user selects empty category.
        if (category === '') {
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            return;
        }

        // Toggling the flag switches which skill is rolled. Only written when the flag itself
        // changes, so a user's own skill choice survives unrelated category edits.
        if (changed?.alchemical !== undefined) {
            foundry.utils.setProperty(applyData, 'system.action.skill', alchemical ? 'alchemy' : 'spellcasting');
            foundry.utils.setProperty(applyData, 'system.action.attribute', 'magic');
        }

        // An alchemical spell is a preparation formula, it's prepared rather than cast. SR5#304.
        if (alchemical) {
            const test = SR5.alchemicalSpellTests.test;
            UpdateActionFlow.setActionTests(applyData, {
                test,
                opposed: SR5.alchemicalSpellTests.opposed,
                resist: '',
                followed: SR5.followedTests[test] ?? '',
            });
            return;
        }

        // Based on category switch out active, opposed and resist test.
        const test = SR5.activeTests[type];
        UpdateActionFlow.setActionTests(applyData, {
            test,
            ...UpdateActionFlow.spellOpposedTests(category, combatType),
            followed: SR5.followedTests[test] ?? '',
        });
    },

    /**
     * See injectActionTestsIntoChangeData for documentation.
     *
     * A preparation defends like the spell it stores, but never causes drain when triggered, as
     * the alchemist already resisted it during creation. See SR5#306.
     */
    injectPreparationTestIntoChangeData(type: string, changeData: DeepPartial<{system: Item.SystemOfType<'preparation'>}>, applyData, preparation?: SR5Item<'preparation'>) {
        // Reconfigure on category or direct/indirect changes, including partial item updates.
        const changed = changeData?.system;
        if (changed?.category === undefined && changed?.combat?.type === undefined) return;

        const category = changed?.category ?? preparation?.system.category;
        const combatType = changed?.combat?.type ?? preparation?.system.combat.type;
        if (category === undefined) return;

        // Remove test when the stored spell has no category.
        if (category === '') {
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            return;
        }

        UpdateActionFlow.setActionTests(applyData, {
            test: SR5.activeTests[type],
            ...UpdateActionFlow.spellOpposedTests(category, combatType),
            followed: '',
        });

        // The defense test derives its attributes from the stored spell (direct) or its own
        // defaults (indirect). Clear copied casting-time selectors so they can't override either.
        if (category === 'combat') {
            foundry.utils.setProperty(applyData, 'system.action.opposed.skill', '');
            foundry.utils.setProperty(applyData, 'system.action.opposed.attribute', '');
            foundry.utils.setProperty(applyData, 'system.action.opposed.attribute2', '');
            foundry.utils.setProperty(applyData, 'system.action.opposed.armor', false);
        }
    },

    /**
     * Opposed and resist tests of a spell, combat spells split by direct/indirect.
     */
    spellOpposedTests(category: string, combatType = '') {
        const opposed =
            (category === 'combat'
                ? SR5.opposedTests.spell[category][combatType]
                : SR5.opposedTests.spell[category]
            ) || 'OpposedTest';

        const resist =
            (category === 'combat'
                ? SR5.opposedResistTests.spell[category][combatType]
                : SR5.opposedResistTests.spell[category]
            ) || '';

        return { opposed, resist };
    },

    /**
     * Write the active, opposed, resist and follow up test of an action in one go.
     */
    setActionTests(applyData, tests: { test: string, opposed: string, resist: string, followed: string }) {
        foundry.utils.setProperty(applyData, 'system.action.test', tests.test);
        foundry.utils.setProperty(applyData, 'system.action.opposed.test', tests.opposed);
        foundry.utils.setProperty(applyData, 'system.action.opposed.resist.test', tests.resist);
        foundry.utils.setProperty(applyData, 'system.action.followed.test', tests.followed);
    },

    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectComplexFormTestIntoChangeData(type: string, changeData: DeepPartial<{system: Item.SystemOfType<'complex_form'>}>, applyData) {
        const test = SR5.activeTests[type];

        foundry.utils.setProperty(applyData, 'system.action.test', test);
    },


    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectCallInActionTestIntoChangeData(type: string, changeData: DeepPartial<{system: Item.SystemOfType<'call_in_action'>}>, applyData) {
        if (changeData.system?.actor_type === undefined) return;

        if (changeData.system.actor_type === 'spirit') {
            // Reconfigure to summoning tests workflow.
            foundry.utils.setProperty(applyData, 'system.action.test', 'SummonSpiritTest');
            foundry.utils.setProperty(applyData, 'system.action.opposed.test', 'OpposedSummonSpiritTest');
            foundry.utils.setProperty(applyData, 'system.action.followed.test', 'DrainTest');
        }
        if (changeData.system.actor_type === 'sprite') {
            // Reconfigure to compilation tests workflow.
            foundry.utils.setProperty(applyData, 'system.action.test', 'CompileSpriteTest');
            foundry.utils.setProperty(applyData, 'system.action.opposed.test', 'OpposedCompileSpriteTest');
            foundry.utils.setProperty(applyData, 'system.action.followed.test', 'FadeTest');
        }
        if (changeData.system.actor_type.length === 0) {
            // Reset to prohibit testing.
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            foundry.utils.setProperty(applyData, 'system.action.opposed.test', '');
            foundry.utils.setProperty(applyData, 'system.action.followed.test', '');
        }
    }
}
