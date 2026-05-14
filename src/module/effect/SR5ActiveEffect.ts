import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { ModifiableValue } from "../mods/ModifiableValue";
import { Migrator } from "../migrator/Migrator";
import { LinksHelpers } from '@/module/utils/links';
import { ModifiableValueType } from "../types/template/Base";
import DataModel = foundry.abstract.DataModel;

/**
 * Shadowrun Active Effects implement additional ways of altering document data.
 *
 * The main difference to the base implementation is the ability to modify Value structures without the need to define
 * sub-keys. Instead of active effects adding on top of a numerical they'll be included in the mod array of the Value.
 *
 * Overriding a value is also altered for Values to allow for a more dynamic approach. The original values are still available
 * but during calculation the override value will be used instead.
 *
 * Effects can also define the type of target data to be applied to. Default effects only apply to actor data, system effects
 * can apply to actors, tests and also only to actors targeted by tests.
 * 
 * NOTE: FoundryVTT DataModel is used to apply changes as well. Check custom Field implementations for effect change mode
 * application.
 */
export class SR5ActiveEffect extends ActiveEffect {
    private static readonly legacyModeByChangeType: Record<string, number> = {
        custom: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        multiply: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
        add: CONST.ACTIVE_EFFECT_MODES.ADD,
        downgrade: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE,
        upgrade: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        override: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
    };

    /**
     * Can be used to determine if the origin of the effect is a document owned by another document.
     *
     * A use case would be to check if the effect is applied by an actor owned item.
     *
     * The current approach is a bit simple, due to the limited effect use. Should there be a time of effects applied to
     * items, this would need change.
     */
    public get isOriginOwned(): boolean {
        if (!this.origin) return false;
        const path = this.origin.split('.');

        if (path[0] === 'Scene' && path.length === 6) return true;
        if (path[0] === 'Actor' && path.length === 4) return true;

        return false;
    }

    async openSource() {
        const source = this.origin;
        if (source) {
            await LinksHelpers.openSource(source);
        }
    }

    get hasSource(): boolean {
        return !!this.origin;
    }

    public get source() {
        return this.origin ? fromUuidSync(this.origin) : null;
    }

    get isActorOwned(): boolean {
        return this.parent instanceof SR5Actor;
    }

    get isItemOwned(): boolean {
        return this.parent instanceof SR5Item;
    }

    /**
     * Always returns the parent actor of the effect, even if the effect is applied to an item.
     */
    get actor(): SR5Actor | null {
        if (this.parent instanceof SR5Actor) return this.parent;
        if (this.parent instanceof SR5Item) return this.parent?.parent;
        return null;
    }

    /**
     * Use to display this effect on sheet, including a possible parent item structure.
     */
    public get sheetName(): string | null {
        if (this.parent instanceof SR5Actor) return this.name;
        return `${this.parent?.name} » ${this.name}`;
    }

    /**
     * Render the sheet of the active effect source
     */
    public async renderSourceSheet() {
        if (this.source instanceof SR5Actor || this.source instanceof SR5Item)
            return this.source?.sheet?.render(true);
        return undefined;
    }

    async toggleDisabled() {
        return this.update({ disabled: !this.disabled });
    }

    /**
     * Try redirecting given change key to a key matching a ModifiableValue instead of it's leafs.
     * Otherwise, redirect key as is. ChangeData will be altered in place.
     */
    static redirectToNearModifiableValue(model: DataModel.Any, change: ActiveEffect.ChangeData) {
        // Move key up one hierarchy and check indirect match
        const nodes = change.key.split('.');
        const property = nodes.pop() ?? '';
        const indirectKey = nodes.join('.');

        const value = SR5ActiveEffect.getModifiableValue(model, indirectKey);
        if (value) {
            // Allow users to change keys that don't affect value calculation
            // This could be skill.canDefault or similar.
            const keyIsPartOfValueCalculation = this.modifiableValueProperties.includes(property);
            if (keyIsPartOfValueCalculation) {
                change.key = indirectKey;
                return true;
            }
        }

        return false;
    }

    /**
     * Effect change given by user is altered to what is best for the system.
     * 
     * We do this to avoid effects breaking the sheet and easing the use of custom changes
     * for users not aware of system internal around ModifiableValue.
     */
    static alterChange(model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (!SR5ActiveEffect.getModifiableValue(model, change.key))
            SR5ActiveEffect.redirectToNearModifiableValue(model, change);
    }

    /**
     * Return a ModifiableValue at the given key if it matches the ModifiableValue shape.
     */
    static getModifiableValue(model: DataModel.Any, key: string): ModifiableValueType | null {
        const possibleValue = foundry.utils.getProperty(model, key);
        const possibleValueType = foundry.utils.getType(possibleValue);

        if (possibleValue != null && possibleValueType === 'Object' && Helpers.objectHasKeys(possibleValue, this.modifiableValueProperties))
            return possibleValue as ModifiableValueType;

        return null;
    }

    /**
     * Return keys expected in the ModifiableField shape
     */
    static get modifiableValueProperties(): string[] {
        return ['base', 'changes', 'value'] satisfies (keyof ModifiableValueType)[];
    }

    /**
     * Convert a v14 string-based change type into the legacy numeric mode value.
     */
    static getLegacyChangeMode(change: { mode?: number; type?: string | null }): number {
        if (typeof change.mode === 'number') return change.mode;

        const changeType = typeof change.type === 'string' ? change.type : '';
        const mappedMode = this.legacyModeByChangeType[changeType];
        if (mappedMode !== undefined) return mappedMode;

        console.error(`Shadowrun5e | Unrecognized change type "${change.type}", defaulting to "add" mode.`);
        return CONST.ACTIVE_EFFECT_MODES.ADD;
    }

    override get isSuppressed(): boolean {
        if (!(this.parent instanceof SR5Item)) return false;

        if (this.system.onlyForEquipped && !this.parent.isEquipped()) return true;
        if (this.system.onlyForWireless && !this.parent.isWireless()) return true;
        if (this.parent.isType('critter_power') && !this.parent.system.enabled) return true;
        if (this.parent.isType('sprite_power') && !this.parent.system.enabled) return true;

        return false;
    }

    /**
     * Determine if this effect is meant to be applied to the actor it's existing on.
     *
     * Some effects are meant to be applied to other actors, and those shouldn't apply or show
     * on the actor that will cause them.
     *
     * Especially targeted_actor effects are meant to be applied to another actor acted upon but not the one acting.
     *
     * @return true, when the effect is meant to be applied to the actor it's existing on.
     */
    get appliesToLocalActor(): boolean {
        const actor = this.actor;
        if (!actor) return false;

        if (this.system.applyTo === 'targeted_actor') {
            return this.system.appliedByTest;
        }

        return true;
    }

    /**
     * < v14 used #apply instead of applyChange.
     */
    override apply(model: DataModel.Any, change: ActiveEffect.ChangeData) {
        // @ts-expect-error TODO: v14 remove once v14 implementation is stable
        return super.apply(model, change);
        // return Object.fromEntries(
        //     // @ts-expect-error TODO: tamif - v14 - what is this for?
        //     Object.entries(super.apply(model, change)).filter(([, v]) => v != null)
        // );
    }

    /**
     * Inject features into default FoundryVTT ActiveEffect implementation.
     *
     * - dynamic source properties as change values
     * - apply to non-Actor objects
     * 
     * With DataModel this method has two different paths it can go:
     * - Foundry documents using a DataModel schema
     * - Non-Document objects
     * 
     * The DataModel handles effect application within they applyChange methods.
     * The objects are handled by SR5ActiveEffect legacy _applyToObject and _apply methods.
     * 
     * This can cause diffeing beahvior between these two for effect application.
     *
     * @param targetDoc The targeted document or object...
     * @param change The effect change being applied
     * @param options Additional FoundryVTT options.
     */
    // @ts-expect-error v14 - missing types
    override static applyChange(targetDoc: DataModel.Any, change: ActiveEffect.ChangeData, {replacementData = {}, modifyTarget = true} = {}) {
        // Skip applying this change if the target key does not exist on the model.
        // TypedObjectField will otherwise create the missing property as a string,
        // which breaks data integrity and can result in errors like "undefined[object Object]".
        // For example, a change targeting "firstaid" instead of "first_aid" would trigger this case.
        if (!foundry.utils.hasProperty(targetDoc, change.key))
            return {};
        
        // Resolve dynamic value references in change.
        const source = change.effect.parent;
        SR5ActiveEffect.alterChange(targetDoc, change);
        SR5ActiveEffect.resolveDynamicChangeValue(source, change);
        
        // Other cases should be directly applied to the data, without actor / schema handling.
        // This is used when applying effects to non-Actor objects, like tests.
        // TODO: v14 - double check TokenDocument.
        if (!(targetDoc instanceof SR5Actor) && !(targetDoc instanceof SR5Item) && !(targetDoc instanceof TokenDocument)) {
            return SR5ActiveEffect._applyToObject(targetDoc, change);
        }

        // @ts-expect-error TODO: fvtt - v14 - missing types
        return super.applyChange(targetDoc, change, {replacementData, modifyTarget});
    }

    /**
     * Handle application for none-Document objects. This is typically used for SuccessTest instances.
     */
    private static _applyToObject(object: any, change: ActiveEffect.ChangeData) {
        const target = foundry.utils.getProperty(object, change.key);
        const targetType = foundry.utils.getType(target);

        // Cast the effect change value to the correct type
        let delta: any;
        try {
            if (Array.isArray(target)) {
                const innerType = target.length ? foundry.utils.getType(target[0]) : "string";
                delta = SR5ActiveEffect.__castArray(change.value, innerType);
            }
            else delta = SR5ActiveEffect.__castDelta(change.value, targetType);
        } catch (err) {
            console.warn(`Test [${object.constructor.name}] | Unable to parse active effect change for ${change.key}: "${change.value}"`);
            return {};
        }

        if (ModifiableValue.isModifiableValue(target)) {
            const mode = SR5ActiveEffect.getLegacyChangeMode(change);
            target.changes.push({
                enabled: change.effect.active,
                invalidated: false,
                name: change.effect.name,
                value: delta,
                mode,
                priority: change.priority ?? 10 * mode,
                effectUuid: change.effect.uuid,
            });
            return {};
        }

        // In case of non-existent change.key targets, catch errors and log it, but still allow the overall process to continue.
        // An example could be applying test effect changes, and a single misconfigured effect change shouldn't stop the test dialog 
        // from showing up.
        // TODO: v14 - check if the commented out code is still needed
        try {
            const changes = {};
            // @ts-expect-error TODO: fvtt - v14 - missing types
            return SR5ActiveEffect._applyChangeUnguided(object, change, changes);
        } catch (err) {
            console.error(`Test [${object.constructor.name}] | Failed to apply active effect change for ${change.key}: "${change.value}"`, err);
            return {};
        }
        // try {
        //     return super.apply(object, change);
        // } catch (err) {
        //     console.error(`Test [${object.constructor.name}] | Failed to apply active effect change for ${change.key}: "${change.value}"`, err);
        //     return undefined;
        // }
    }

    /**
     * Resolve a dynamic change value to the actual numerical value. A dynamic change value contains key references
     * to model properties, which must be resolved before application as literal values.
     *
     * A dynamic change value follows the same rules as a Foundry roll formula (including dice pools).
     *
     * A change could contain the key of 'system.attributes.body' with the mode Modify and a dynamic value of
     * '@system.technology.rating * 3'. The dynamic property path would be taken from either the source or parent
     * document of the effect before the resolved value would be applied onto the target document / object.
     *
     * @param source Any object style value, either a Foundry document or a plain object
     * @param change A singular ActiveEffect.ChangeData object
     */
    static resolveDynamicChangeValue(source: any, change: ActiveEffect.ChangeData) {
        // Dynamic value present?
        if (foundry.utils.getType(change.value) !== 'string') return;
        if (change.value.length === 0) return;

        // Use Foundry Roll Term parser to both resolve dynamic values and resolve calculations.
        const expression = Roll.replaceFormulaData(change.value, source);
        const value = Roll.validate(expression) ? Roll.safeEval(expression) : change.value;

        // Overwrite change value with graceful default, to avoid NaN errors during change application.
        // Adhere to FoundryVTT expectation of receiving string values.
        if (value === undefined) change.value = '0';
        else change.value = value.toString();
    }

    static override migrateData(data: Parameters<typeof ActiveEffect['migrateData']>[0]) {
        Migrator.migrate("ActiveEffect", data);

        return super.migrateData(data);
    }

    override async update(
        data: ActiveEffect.UpdateInput,
        operation?: ActiveEffect.Database.UpdateOperation,
    ) {
        if (this.parent instanceof SR5Item && this.parent._isNestedItem) {
            if (!data || !this.id) return this;

            await this.parent.updateNestedEffects({ ...data, _id: this.id } as ActiveEffect.UpdateInput);
            await this.render();
            return this;
        }

        await Migrator.updateMigratedDocument(this);

        return super.update(data, operation);
    }

    /**
     * This is 1to1 copy from the FoundryVTTv13 method with the private-# prefix...
     * Cast a raw ActiveEffect.ChangeData change string to an Array of an inner type.
     * @param {string} raw      The raw string value
     * @param {string} type     The target data type of inner array elements
     * @returns {Array<*>}      The parsed delta cast as a typed array
     */
    private static __castArray(raw: string, type: foundry.utils.DataType) {
        let delta: any[];
        try {
            delta = this.__parseOrString(raw);
            delta = delta instanceof Array ? delta : [delta];
        } catch (e) {
            delta = [raw];
        }
        return delta.map(d => this.__castDelta(d, type));
    }

    /**
     * This is 1to1 copy from the FoundryVTTv13 method with the private-# prefix...
     * Cast a raw ActiveEffect.ChangeData change string to the desired data type.
     * @param {string} raw      The raw string value
     * @param {string} type     The target data type that the raw value should be cast to match
     * @returns {*}             The parsed delta cast to the target data type
     */
    private static __castDelta(raw: string, type: foundry.utils.DataType) {
        let delta;
        switch (type) {
            case "boolean":
                delta = Boolean(SR5ActiveEffect.__parseOrString(raw));
                break;
            case "number":
                delta = Number.fromString(raw);
                if (Number.isNaN(delta)) delta = 0;
                break;
            case "string":
                delta = String(raw);
                break;
            default:
                delta = SR5ActiveEffect.__parseOrString(raw);
        }
        return delta;
    }

    /**
     * This is 1to1 copy from the FoundryVTTv13 method with the private-# prefix...
     * Parse serialized JSON, or retain the raw string.
     * @param {string} raw      A raw serialized string
     * @returns {*}             The parsed value, or the original value if parsing failed
     */
    private static __parseOrString(raw: string) {
        try {
            return JSON.parse(raw);
        } catch (err) {
            return raw;
        }
    }

    override prepareBaseData() {
        super.prepareBaseData();
        
        // Overwrite foundry priority handling, as they provide a defaultPriority in CHANGE_TYPES but use
        // priority in their ActiveEffect#prepareBaseData implementation.
        for ( const change of this.system.changes ) {
        // @ts-expect-error TODO: fvtt - v14 - missing CHANGE_TYPES typing
          change.priority = change.priority === 0 ? ActiveEffect.CHANGE_TYPES[change.type]?.defaultPriority : change.priority;
        }
    }
}
