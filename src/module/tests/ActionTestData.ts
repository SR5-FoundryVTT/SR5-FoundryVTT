import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { SuccessTestData } from "./SuccessTest";
import { DataDefaults } from "../data/DataDefaults";
import { ModifiableValue } from "../mods/ModifiableValue";
import { SkillRules } from "../rules/SkillRules";
import { SR5 } from "../config";
import { ActionFlow } from "../item/flows/ActionFlow";
import { ActionRollType, DamageType, MinimalActionType } from "../types/item/Action";
import { ValueFieldType } from "../types/template/Base";
import { DeepPartial } from "fvtt-types/utils";
import { FlowNodeRules } from "../types/flows/FlowNodeField";
import { FlowContext } from "../flows/FlowContext";

/**
 * Map action and action node settings to test data: pools from skills and attributes, limits,
 * thresholds, damage, modifiers and formulas.
 *
 * Every test of a flow, root or node, has its data prepared here. TestCreator keeps delegating
 * members of the same names for existing callers.
 */
export const ActionTestData = {
    /**
     * Prepare test data with source values based on action data.
     *
     * @param action Action data to prepare test data with.
     * @param actor Actor to use for retrieving source values and execute test with.
     * @param data Any test implementations resulting basic test data.
     */
    _prepareTestDataWithAction: function(action: ActionRollType, document: SR5Actor|SR5Item, data: SuccessTestData, againstData?: SuccessTestData): SuccessTestData {
        // allow rule specific parts of the system to change the data that we pass in
        // - this can be used to change the test skills or attributes before building a dice pool
        // - one example is Gunnery, which should use Logic instead of Agility when remotely fired SR5 pg #183
        // this is done before preparing the test data to ensure Active Effects get applied through Test Resolution correctly
        Hooks.call('sr5_beforePrepareTestDataWithAction', action, document, againstData);

        data.codeTermTraces = [];

        // Store ActionRollData on TestData to allow for re-creation of the test during it's lifetime.
        data.action = action;

        if (document instanceof SR5Actor) ActionTestData._prepareTestDataWithActionForActor(action, document, data, againstData);
        if (document instanceof SR5Item) ActionTestData._prepareTestDataWithActionForItem(action, document, data, againstData);
        ActionTestData._applyActionFormulas(action, document, data, againstData);

        // Allow rule specific parts of the system to further extend some tests under non-general circumstances.
        Hooks.call('sr5_afterPrepareTestDataWithAction', data, action, document, againstData);

        return data;
    },

    /**
     * Prepare test data with SR5Actor source document for rollData
     * 
     * @param action The source action to base test data on
     * @param actor The source document to use values defined within the action from
     * @param data The resulting test data object to write those values into
     * @param againstData Optional testData to use for additional context. This is data from a previous test.
     * 
     * @returns resulting TestData
     */
    _prepareTestDataWithActionForActor: function(action: ActionRollType, actor: SR5Actor, data: SuccessTestData, againstData?: SuccessTestData) {
        // @ts-expect-error Both Success and Opposed Test data is used, though not typed here.
        const rollData = actor.getRollData({againstData: againstData ?? data.following?.against, copySystem: true});

        const pool = new ModifiableValue(data.pool);

        // Prepare pool values.
        if (action.skill) {
            // Grab the skill by its id (default skills), or its label (custom skills).
            const skill = actor.getSkill(action.skill, { rollData }) ?? actor.getSkill(action.skill, {byLabel: true, rollData });

            // Notify user about their sins.
            if (skill && !SkillRules.allowRoll(skill)) ui.notifications?.warn('SR5.Warnings.SkillCantBeDefault', {localize: true});
            if (skill && !SkillRules.hasRequirements(actor, skill)) ui.notifications?.warn('SR5.Warnings.ActorMissingRequirements', {localize: true});

            // Add skill values to pool.
            if (skill) {
                pool.addBase(skill.label, SkillRules.level(skill));
                ActionTestData.addCodeTermTrace(data, skill);
            }
            if (action.spec) pool.addUnique('SR5.Specialization', SkillRules.SpecializationModifier);
        }

        // The first attribute is either used for skill or attribute only tests.
        if (action.attribute) {
            const attribute = actor.getAttribute(action.attribute, { rollData });
            // Don't use addUniquePart as one attribute might be used twice.
            if (attribute) {
                pool.addBase(attribute.label, attribute.value);
                ActionTestData.addCodeTermTrace(data, attribute);
            }
        }

        // The second attribute is only used for attribute only tests.
        if (!action.skill && action.attribute2) {
            const attribute = actor.getAttribute(action.attribute2, { rollData });
            // Don't use addUniquePart as one attribute might be used twice.
            if (attribute) {
                pool.addBase(attribute.label, attribute.value);
                ActionTestData.addCodeTermTrace(data, attribute);
            }
        }

        // Include pool modifiers for opposed and resist tests.
        if (action.mod) {
            ModifiableValue.addUnique(data.pool, 'SR5.DicePoolModifier', action.mod);
        }

        // Include pool modifiers that have been collected on the action item.
        // These can come from nested items and more.
        if(action.dice_pool_mod) {
            action.dice_pool_mod.forEach(mod => ModifiableValue.addUnique(data.pool, mod.name, mod.value));
        }

        // Add the armor value as a pool modifier, since 'armor' is part of the test description.
        if (action.armor) {
            const armor = actor.getArmor();
            ModifiableValue.addUniqueBase(data.pool, 'SR5.Armor.label', armor.rating.value);
            ActionTestData.addCodeTermTrace(data, { ...armor.rating, label: 'SR5.Armor.label' });
            if (armor.hardened.value) {
                ModifiableValue.addUniqueBase(data.pool, 'SR5.HardenedArmor', armor.hardened.value);
                ActionTestData.addCodeTermTrace(data, { ...armor.hardened, label: 'SR5.HardenedArmor' });
            }
        }

        // Prepare limit values...
        if (action.limit.base) {
            data.limit.base = Number(action.limit.base);
        }

        //...add limit modifiers
        if (action.limit.changes) {
            action.limit.changes.forEach(change =>
                ModifiableValue.addUnique(data.limit, change.name, change.value, { type: change.type, priority: change.priority })
            );
        }

        //...add limit attribute value based on actor.
        if (action.limit.attribute) {
            // Get the limit connected to the defined attribute.
            // NOTE: This might differ from the USED attribute...
            const limit = actor.getLimit(action.limit.attribute);
            if (limit) {
                ModifiableValue.addUniqueBase(data.limit, limit.label, limit.value);
                ActionTestData.addCodeTermTrace(data, limit);
            }
        }

        // Prepare threshold values...
        if (action.threshold.base) {
            data.threshold.base = Number(action.threshold.base);
        }

        // Prepare general damage values...
        // ...a test without damage, shouldn't contain any damage information.
        if (ActionFlow.hasDamage(action.damage)) {
            data.damage = foundry.utils.duplicate(action.damage) as DamageType;
        }

        // Prepare opposed and resist tests...
        if (action.opposed.test) {
            data.opposed = action.opposed;
        }

        // Prepare test modifiers and possible applicable selections
        const modifiers: Partial<Record<Shadowrun.ModifierTypes, string[]>> = {};
        for (const modifier of data.action.modifiers) {
            // A modifier with an applicable selection is found.
            if (modifier.includes('.')) {
                // Assert correct action modifier segment structure.
                const segments = modifier.split('.');
                if (segments.length > 2) console.error('Shadowrun 5e | Action contained a partial modifier with more than two segments', modifier, data.action);

                // Record the modifier category with it's single applicable.
                const [category, applicable] = segments as [Shadowrun.ModifierTypes, string];
                modifiers[category] = modifiers[category] ?? [];
                modifiers[category].push(applicable);

            // No applicable found yet, just collect the modifier
            } else {
                modifiers[modifier] = modifiers[modifier] ?? [];
            }
        }

        // Apply applicable selections and collect modifiers.
        for (const [name, applicable] of Object.entries(modifiers)) {
            // Setup the resulting modifier value.
            const label = SR5.modifierTypes[name];
            const options = {applicable};
            const value = actor.modifiers.totalFor(name, options);
            ModifiableValue.setUnique(data.pool, label, value);
        }

        // Mark test as extended and pre-fill the action interval for the dialog.
        data.extended = action.extended.value > 0;
        if (data.extended && !data.extendedInterval?.value) {
            data.extendedInterval = { value: action.extended.value, unit: action.extended.unit };
        }

        return data;
    },

    /**
     * Prepare Test Data with SR5Item source document for rollData
     * 
     * @param action The base action to configure test data with.
     * @param item The source document to pull values from.
     * @param data The test data to write values into.
     * @param againstData Optional testData to use for additional context. This is data from a previous test.
     * @returns TestData that's ready to be used to construct a new test instance.
     */
    _prepareTestDataWithActionForItem: function(action: ActionRollType, item: SR5Item, data: SuccessTestData, againstData?: SuccessTestData): SuccessTestData {
        // @ts-expect-error Both Success and Opposed Test data is used, though not typed here.
        const rollData = item.getRollData({action, testData: data, againstData: againstData ?? data.following?.against});

        const pool = new ModifiableValue(data.pool);

        if (action.attribute) {
            const attribute = item.getAttribute(action.attribute, {rollData});
            if (attribute) {
                pool.addUniqueBase(attribute.label, attribute.value);
                ActionTestData.addCodeTermTrace(data, attribute);
            }
        }

        if (action.attribute2) {
            const attribute = item.getAttribute(action.attribute2, {rollData});
            if (attribute) {
                pool.addUniqueBase(attribute.label, attribute.value);
                ActionTestData.addCodeTermTrace(data, attribute);
            }
        }

        return data;
    },

    /**
     * Replace the pool, limit or threshold given by skill and attributes with the formula an action sets.
     *
     * Formulas read the value context of the chain the test is part of (see FlowContext), the item and
     * the rolling actor. Modifiers stay, only the base values are replaced.
     */
    _applyActionFormulas(action: ActionRollType, document: SR5Actor | SR5Item, data: SuccessTestData, againstData?: SuccessTestData) {
        const formulas = {
            pool: (action.pool as { formula?: string } | undefined)?.formula,
            limit: (action.limit as { formula?: string } | undefined)?.formula,
            threshold: (action.threshold as { formula?: string } | undefined)?.formula,
        };
        if (!formulas.pool && !formulas.limit && !formulas.threshold) return;

        const source = ActionTestData._formulaSource(document, data, againstData);
        for (const key of ['pool', 'limit', 'threshold'] as const) {
            const value = FlowContext.resolve(formulas[key], source);
            if (value === undefined) continue;

            const field = data[key];
            field.base = 0;
            field.changes = field.changes.filter(change => !ModifiableValue.isBaseChange(change));
            ModifiableValue.addUniqueBase(field, key === 'pool' ? 'SR5.Flow.Node.PoolFormula' : 'SR5.Flow.Node.Formula', value);
        }
    },

    /**
     * What action formulas can read: the chain context, the item and the rolling document.
     */
    _formulaSource(document: SR5Actor | SR5Item, data: SuccessTestData, againstData?: SuccessTestData): Record<string, unknown> {
        const previous = (data as { previousMessageId?: string }).previousMessageId;
        const ctx = FlowContext.fromMessage(previous) ?? {};

        const itemUuid = data.sourceItemUuid ?? againstData?.sourceItemUuid;
        const item = itemUuid ? fromUuidSync(itemUuid) as SR5Item | null : (document instanceof SR5Item ? document : null);

        return {
            ...ctx,
            item: ctx.item ?? FlowContext.item(item),
            actor: document.getRollData(),
            against: againstData ? { hits: againstData.values?.hits?.value ?? 0, netHits: againstData.values?.netHits?.value ?? 0 } : undefined,
        };
    },

    addCodeTermTrace(data: SuccessTestData, valueField: ValueFieldType) {
        const traces = (data.codeTermTraces ??= []);

        traces.push({ 
            valueField: DataDefaults.createData('value_field', valueField), 
            tooltipSource: `code-${traces.length}` 
        });
    },

    /**
     * The test settings of an action node as a partial action, to create a complete action from.
     */
    _nodeActionData(node: object): DeepPartial<ActionRollType> {
        return FlowNodeRules.actionData(node) as DeepPartial<ActionRollType>;
    },

    /**
     * Merge multiple MinimalActionData objects into one action object. This will only look at keys within a minimal action,
     * not all action keys.
     *
     * A value of a minimal action will only overwrite the main action value if that is not set.
     * 
     * For example:
     * A: action.skill == '' will be overwritten by minimalAction.skill == 'Spellcasting'
     * B: action.skill == 'ritual_spellcasting' won't be overwritten by minimalAction.skill == 'Spellcasting'
     * C: action.armor == true will be overwritten by minimalAction.armor == false
     *
     * @param sourceAction Main action, as defined by user input.
     * @param defaultActions List of partial actions, as defined by test implementations.
     * @returns A copy of the main action with all minimalActions properties applied in order of arguments.
     */
    _mergeMinimalActionDataInOrder: function(sourceAction: ActionRollType, ...defaultActions: DeepPartial<MinimalActionType>[]): ActionRollType {
        // This action might be taken from ItemData, causing changes to be reflected upstream.
        const resultAction = foundry.utils.duplicate(sourceAction) as ActionRollType;

        // Check if overwriting default 
        for (const defaultAction of defaultActions) {
            if (Object.keys(defaultAction).length === 0) continue;

            // Iterate over complete MinimalActionData to avoid tests providing other ActionRollData fields they're not
            // supposed to override.
            for (const key of Object.keys(defaultAction)) {
                if (ActionTestData._keepItemActionValue(sourceAction, defaultAction, key)) continue;

                // @ts-expect-error defaultActions are DeepPartial<MinimalActionType>, so keys might not be present.
                resultAction[key] = defaultAction[key];
            }
        }

        return resultAction;
    },

    /**
     * Should an action value be kept even if a default action defines another value?
     * 
     * This comparison checks either a simple value against defaults OR checks values grouped as a 
     * logical unit (skill+attribute/2)
     * 
     * @param action The original action data.
     * @param defaultAction A partial action that may provide values to apply to the main action.
     * @param key The action key to take the value from
     * @returns true for when the original action value should be kept, false if it's to be overwritten.
     */
    _keepItemActionValue(action: ActionRollType, defaultAction: DeepPartial<MinimalActionType>, key: string): boolean {
        if (!Object.hasOwn(defaultAction, key)) return true;

        // Avoid user confusion. A user might change one value of a logical value grouping (skill+attribute)
        // and get a default value for the other. 
        // Instead check some values as a section and only use default values when not one value of that
        // section has been changed by user input.
        const skillSection = ['skill', 'attribute', 'attribute2', 'armor'];
        if (skillSection.includes(key)) {
            const noneDefault = skillSection.some(sectionKey => ActionTestData._actionHasNoneDefaultValue(action, sectionKey));
            return noneDefault;
        }
    
        // Fallback to basic value checking.
        return ActionTestData._actionHasNoneDefaultValue(action, key);
    },

    /**
     * Determine if the field value behind the action property 'key' is of a none-default value.
     * 
     * This can be used to determine if a user / automated change has been made.
     * 
     * @param action Any action configuration.
     * @param key A key of action configuration within action parameter
     * @returns false, when the value behind key is a default value. true, when it's a custom value.
     */
    _actionHasNoneDefaultValue(action: ActionRollType, key: string): boolean {
        if (!Object.hasOwn(action, key)) return false;
        // NOTE: A more complete comparison would take a default ActionRollData object and compare the sub-key against it.
        const value = action[key];
        const type = foundry.utils.getType(value);

        // A value name should only be overwritten when no value has been user selected.
        // This would affect .skill and .attribute like fields.
        if (type === 'string') return value.length > 0;
        // A list of value names should only be overwritten when not one has been user selected.
        // This would affect .modifiers like fields.
        if (type === 'Array') return value.length > 0;
        // Booleans don't have a intrinsic default value on ActionRollData.
        if (type === 'boolean' && key === 'armor') return action[key]; // default is false
        // A limit or threshold set on an action node, as by its attribute, base value or formula.
        if (type === 'Object' && (key === 'limit' || key === 'threshold')) {
            const field = value as { attribute?: string, base?: number, formula?: string };
            return !!field.attribute || !!field.base || !!field.formula;
        }

        return false;
    },
};
