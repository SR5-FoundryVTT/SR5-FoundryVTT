import {SKILL_DEFAULT_NAME} from "../constants";
import DamageData = Shadowrun.DamageData;
import FireModeData = Shadowrun.FireModeData;
import ActionRollData = Shadowrun.ActionRollData;
import LimitField = Shadowrun.LimitField;
import SourceEntityField = Shadowrun.SourceEntityField;
import ValueField = Shadowrun.ValueField;
import GenericValueField = Shadowrun.GenericValueField;
import MinimalActionData = Shadowrun.MinimalActionData;
import RangeData = Shadowrun.RangeData;

interface MinimalItemData {
    // Whatever name you want to give but not ''.
    name?: string
    // Whatever item type you want to have.
    type: string
}

/**
 * Data Defaults are used for partial template data that can't easily be gotten by instead
 * using game.model.Item.<type>.<whatver> or game.mode.Actor.<type>.<whatever>
 * 
 * This is mostly the case when the system doesn't define data in the system template
 * for fields like track, skill that aren't known during document creation by Foundry.
 * 
 */
export class DataDefaults {
    /**
     * Return a base item data structure with minimal necessary FoundryVTT ItemDataModel fields.
     * 
     * @param name Whatever name you want to give but not ''.
     * @param type Whatever item type you want to have
     * @param systemData Whatever partial item system data you want to inject into general model system data.
     * @returns A minimum viable item data structure to use with Item#create
     */
    static baseItemData<ItemData, ItemSystemData>(itemData: MinimalItemData, systemData: Partial<ItemSystemData>={}) {
        const name = itemData.name ?? 'Unnamed';
        const type = itemData.type;

        // foundry.utils.duplicate source to avoid keeping reference to model data.
        const modelSystemData = foundry.utils.duplicate(game.model.Item[type]);
        if (!modelSystemData) throw new Error(`FoundryVTT doesn't have item type: ${type} registered`);
        return {
            name, type,
            system: foundry.utils.mergeObject(modelSystemData, systemData)
        } as ItemData;
    }
    /**
     * Damage data to hold everything around damaging actors.
     * 
     * @param partialDamageData give partial DamageData fields to overwrite default values
     */
    static damageData(partialDamageData: RecursivePartial<DamageData> = {}): DamageData {
        const data: DamageData = {
            type: {
                base: 'physical',
                value: 'physical',
            },
            element: {
                base: '',
                value: '',
            },
            base: 0,
            value: 0,
            ap: {
                base: 0,
                value: 0,
                mod: [],
                attribute: '',
                base_formula_operator: 'add',
            },
            attribute: '',
            mod: [],
            base_formula_operator: 'add',
            source: {
                actorId: '',
                itemId: '',
                itemType: '',
                itemName: ''
            }
        }
        return foundry.utils.mergeObject(data, partialDamageData) as DamageData;
    }

    /**
     * Armor data used within actor documents.
     * 
     * @param partialActorArmorData Inject partial armor data
     */
    static actorArmor(partialActorArmorData: Partial<Shadowrun.ActorArmor> = {}): Shadowrun.ActorArmor {
        return foundry.utils.mergeObject({
            value: 0,
            mod: [],
            base: 0,
            label: '',
            fire: 0,
            electric: 0,
            cold: 0,
            acid: 0,
            hardened: false
        }, partialActorArmorData) as Shadowrun.ActorArmor;
    }

    /**
     * Build a minimal viable action roll data structure.
     * 
     * @param partialActionData Inject any minimal action property
     */
    static minimalActionData(partialActionData: Partial<MinimalActionData> = {}) {
        return foundry.utils.mergeObject({
            attribute: '',
            attribute2: '',
            skill: '',
            mod: 0,
            armor: false,
            limit: {
                value: 0,
                attribute: '',
                mod: [],
                base: 0,
            }
        }, partialActionData) as MinimalActionData;
    }

    /**
     * Build a action data capable of rolling a test.
     * 
     * This is used instead of game.model.Item.action.action as fields like armor don't mesh well with TestCreator._mergeMinimalActionDataInOrder
     * 
     * @param partialActionRollData 
     * @returns 
     */
    static actionRollData(partialActionRollData: DeepPartial<ActionRollData> = {}): ActionRollData {
        return foundry.utils.mergeObject({
            type: '',
            categories: [],
            attribute: '',
            attribute2: '',
            skill: '',
            spec: false,
            mod: 0,
            mod_description: '',
            damage: this.damageData(),
            modifiers: [],
            test: '',
            limit: {
                value: 0,
                base: 0,
                attribute: '',
                mod: []
            },
            threshold: {
                value: 0,
                base: 0
            },
            extended: false,
            opposed: {
                test: '',
                type: '',
                attribute: '',
                attribute2: '',
                skill: '',
                mod: 0,
                description: ''
            },
            followed: {
                test: '',
                attribute: '',
                attribute2: '',
                skill: '',
                mod: 0,
            },
            alt_mod: 0,
            dice_pool_mod: []
        }, partialActionRollData) as ActionRollData;
    }

    /**
     * Build a full limit value field for use in document data
     * 
     * @param partialLimitField Inject any limit property
     */
    static limitField(partialLimitField: Partial<LimitField> = {}): LimitField {
        return foundry.utils.mergeObject({
            value: 0,
            base: 0,
            attribute: '',
            label: '',
            hidden: false,
            mod: []
        }, partialLimitField) as Shadowrun.LimitField;
    }

    /**
     * Build a skill field for use in document data
     * 
     * @param partialSkillData Inject any skill property
     */
    static skillData(partialSkillData: Partial<Shadowrun.SkillField> = {}): Shadowrun.SkillField {
        return foundry.utils.mergeObject({
            name: SKILL_DEFAULT_NAME,
            base: 0,
            value: 0,
            hidden: false,
            canDefault: false,
            label: '',
            bonus: [],
            specs: [],
            mod: [],
            attribute: ''
        }, partialSkillData) as Shadowrun.SkillField;
    }

    /**
     * Build a damage track field for use in document data.
     * @param partialTrackData Inject any track property
     * @returns 
     */
    static trackData(partialTrackData: Partial<Shadowrun.TrackType> = {}): Shadowrun.TrackType {
        return foundry.utils.mergeObject({
            value: 0,
            max: 0,
            label: '',
            mod: [],
            disabled: false,
            wounds: 0
        }, partialTrackData) as Shadowrun.TrackType;
    }

    /**
     * Data structure used to reference other document types.
     * 
     * Example usage:
     * Host references other IC actors it's able to start in combat.
     * 
     * TODO: This uses the v8 old style Document.id pattern instead of v9 style uuid pattern.
     * 
     * @param partialSourceEntityData 
     * @returns 
     */
    static sourceItemData(partialSourceEntityData: Partial<Shadowrun.SourceEntityField> = {}): Shadowrun.SourceEntityField {
        return foundry.utils.mergeObject({
            id: '',
            name: '',
            pack: null,
            type: 'Actor',
            // @ts-expect-error
            system: partialSourceEntityData.system || undefined
        }, partialSourceEntityData) as Shadowrun.SourceEntityField;
    }

    /**
     * Build a numerical value field for use anywhere necessary
     * 
     * @param partialValueData Inject any value property
     */
    static valueData(partialValueData: Partial<Shadowrun.ValueField> = {}) {
        return foundry.utils.mergeObject({
            base: 0,
            value: 0,
            temp: 0,
            mod: [],
            label: ''
        }, partialValueData) as Shadowrun.ValueField;
    }

    /**
     * Build a value field holding any value for use anywhere necessary
     * Differs from valueData as it's not only allowing number type values.
     * @param partialGenericValueData Inject any value property
     */
    static genericValueData(partialGenericValueData: Partial<Shadowrun.GenericValueField> = {}) {
        return foundry.utils.mergeObject({
            base: 0,
            value: 0,
            temp: 0,
            mod: [],
            label: ''
        }, partialGenericValueData) as Shadowrun.GenericValueField;
    }

    /**
     * Build a fire mode field for use in range weapon data or testing
     * 
     * @param partialFireModeData Inject any fire mode property
     */
    static fireModeData(partialFireModeData: Partial<FireModeData> = {}): FireModeData {
        return foundry.utils.mergeObject({
            value: 0,
            label: '',
            defense: 0,
            recoil: false,
            suppression: false,
            mode: 'single_shot',
            action: 'simple'
        }, partialFireModeData);
    }

    static weaponRangeData(partialRangeData: Partial<RangeData> = {}): RangeData {
        return foundry.utils.mergeObject({
            short: 0,
            medium: 0,
            long: 0,
            extreme: 0,
            category: 'manual',
        }, partialRangeData);
    }

    /**
     * Build a description data segment
     * 
     * @param partialDescriptionData 
     * @returns 
     */
    static descriptionData(partialDescriptionData: Partial<Shadowrun.DescriptionData> = {}) {
        return foundry.utils.mergeObject({
            value: '',
            chat: '',
            source: ''
        }, partialDescriptionData);
    }

    /**
     * Build a technology data segment
     * 
     * @param partialTechnologyData 
     * @returns 
     */
    static technologyData(partialTechnologyData: Partial<Shadowrun.TechnologyData> = {}) {
        return foundry.utils.mergeObject({
            rating: '',
            availability: '',
            quantity: 1,
            cost: 0,
            equipped: false,
            conceal: {
                base: 0,
                value: 0,
                mod: [],
            },
            condition_monitor: {
                label: '',
                value: 0,
                max: 0,
            },
            wireless: true,
            master: undefined
        }, partialTechnologyData);
    }

    /**
     * Build a attribute data segment.
     * 
     * @param partialAttributeData
     * @returns Merged of partial and basic attribute data
     */
    static attributeData(partialAttributeData: Partial<Shadowrun.AttributeField> = {}) {
        return foundry.utils.mergeObject({
            value: 0,
            mod: [],
            base: 0,
            label: '',
            hidden: false,
            device_att: '',
            temp: 0,
            limit: ''
        }, partialAttributeData) as Shadowrun.AttributeField;
    }

    static matrixData(partialMatrixTargetData: Partial<Shadowrun.MatrixMarkTarget> = {}) {
        return foundry.utils.mergeObject({
            uuid: null,
            name: '',
            marks: 0
        }, partialMatrixTargetData);
    }
}