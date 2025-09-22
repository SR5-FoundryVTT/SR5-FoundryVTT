import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { ModifiableValueType } from "../types/template/Base";
import DataModel = foundry.abstract.DataModel;
import { Migrator } from "../migrator/Migrator";
import { LinksHelpers } from '@/module/utils/links';

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
    // These modes should trigger a change key redirect to a ModifiableValue before applied.
    static readonly redirectModes = [
        CONST.ACTIVE_EFFECT_MODES.CUSTOM, 
        CONST.ACTIVE_EFFECT_MODES.ADD,
        CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        CONST.ACTIVE_EFFECT_MODES.DOWNGRADE,
    ];

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
    public renderSourceSheet() {
        if (this.source instanceof SR5Actor || this.source instanceof SR5Item)
            return this.source?.sheet?.render(true);
        return undefined;
    }

    async toggleDisabled() {
        return this.update({ disabled: !this.disabled });
    }

    async disable(disabled) {
        return this.update({ disabled });
    }

    /**
     * Foundry provides a functionless custom mode, we make use of as our 'Modify' mode
     * till they provide a generic way of adding additional custom modes.
     */
    override _applyCustom(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        return this._applyModify(actor, change, current, delta, changes);
    }

    /**
     * Apply a modification to a ModifiableValue.
     * Both direct key matches to the whole value and indirect matches to a value property are supported.
     */
    protected _applyModify(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        if (SR5ActiveEffect.applyModifyToModifiableValue(this, actor, change, current, delta, changes)) return;

        // fallback to Foundry add mode for all other value types.
        super._applyAdd(actor, change, current, delta, changes);
    }

    /**
     * Apply for the custom (modify) mode but, if possible, apply to a ModifiableValue.
     * 
     * This method is designed to handle application and report back if further application is needed.
     * 
     * The modify mode is intended to inject each change value into the mod array, while the total value is
     * calculated later during document data prep.
     * 
     * @param effect
     * @param model
     * @param change
     * @param current
     * @param delta
     * @param changes
     * @returns
     */
    static applyModifyToModifiableValue(effect: SR5ActiveEffect, model: DataModel.Any, change: ActiveEffect.ChangeData, current, delta, changes?) {
        const value = SR5ActiveEffect.getModifiableValue(model, change.key);
        if (value) {
            value.mod.push({ name: effect.name, value: Number(change.value) });

            return true;
        }

        // Don't apply any changes if there is NO matching value.
        if (value === undefined) return true;

        // Hand back application to other methods.
        return false;
    }

    /**
     * Try redirecting given change key to a key matching a ModifiableValue instead of it's leafs.
     * Otherwise, redirect key as is. ChangeData will be altered in place.
     *
     * @param model The model used to check value types under key
     * @param change The change key to redirect.
     * @returns true, if a ModifiableValue is addressed.
     */
    static redirectToNearModifiableValue(model: DataModel.Any, change: ActiveEffect.ChangeData, keyIsModifiableValue: boolean) {
        if (keyIsModifiableValue) return true;

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
     * 
     * @param model The model used to check value types under key
     * @param change The effect change data.
     */
    static alterChange(model: DataModel.Any, change: ActiveEffect.ChangeData) {
        // Check direct match once across all methods to avoid redundant checks.
        let isModifiableValue = !!SR5ActiveEffect.getModifiableValue(model, change.key);

        if (!isModifiableValue && SR5ActiveEffect.redirectModes.includes(change.mode as any)) {
            isModifiableValue = SR5ActiveEffect.redirectToNearModifiableValue(model, change, isModifiableValue);
        }

        if (change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM) {
            SR5ActiveEffect.changeCustomToAddMode(model, change, isModifiableValue);
        } else if (change.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
            SR5ActiveEffect.changeAddToCustomMode(model, change, isModifiableValue);
        }
    }

    /**
     * Avoid misuse of some mods to break sheet rendering. Specifically due to modify and override special
     * handling of ModifiableField, we should save users from using mode Add wrong by addressing a ModifiableField
     * change key directly, therefore breaking sheet rendering.
     * 
     * @param model The model used to check value types under key
     * @param change  The change key to redirect.
     * @param keyIsModifiableValue true, if the change key is a ModifiableValue.
     */
    static changeAddToCustomMode(model: DataModel.Any, change: ActiveEffect.ChangeData, keyIsModifiableValue: boolean) {
        if (change.mode !== CONST.ACTIVE_EFFECT_MODES.ADD) return;

        // Stop Add overriding ModifiableValue with change key, breaking sheet rendering.
        if (keyIsModifiableValue) {
            change.mode = CONST.ACTIVE_EFFECT_MODES.CUSTOM;
            return;
        }

        // Move key up one hierarchy and check again
        const nodes = change.key.split('.');
        const indirectKey = nodes.join('.');

        const value = SR5ActiveEffect.getModifiableValue(model, indirectKey);
        if (value) {
            change.key = indirectKey;
            change.mode = CONST.ACTIVE_EFFECT_MODES.CUSTOM;
        }
    }

    /**
     * Change change mode from custom (modify) to add, if the change key is NOT a ModifiableValue.
     * 
     * @param model The model used to check value types under key
     * @param change The change key to redirect.
     * @param keyIsModifiableValue true, if the change key is a ModifiableValue.
     */
    static changeCustomToAddMode(model: DataModel.Any, change: ActiveEffect.ChangeData, keyIsModifiableValue: boolean) {
        if (change.mode !== CONST.ACTIVE_EFFECT_MODES.CUSTOM) return;

        if (!keyIsModifiableValue) {
            change.mode = CONST.ACTIVE_EFFECT_MODES.ADD;
        }
    }

    /**
     * Overriding can be tricky if the overwritten value is a ModifiableValue with derived values.
     *
     * To keep the ActiveEffect workflow simple and still allow to override values that aren't a ModifiableValue,
     * check for such values and give the ActorDataPreparation flow some hints.
     *
     * To complicate things, there are some use cases when overwriting an actual property of a ValueField
     * is needed. The SR5 uneducated quality needs to override the canDefault field of a skill.
     */
    override _applyOverride(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        if(SR5ActiveEffect.applyOverrideToModifiableValue(this, actor, change, current, delta)) return;

        super._applyOverride(actor, change, current, delta, changes);
    }

    /**
     * Inject system upgrade / downgrade behavior into change keys using ModifiableValue.
     */
    override _applyUpgrade(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        // Foundry passes both upgrade and downgrade into _applyUpgrade within _applyLegacy
        if (change.mode === CONST.ACTIVE_EFFECT_MODES.UPGRADE) {
            if(SR5ActiveEffect.applyUpgradeToModifiableValue(this, actor, change, current, delta)) return;
        }
        if (change.mode === CONST.ACTIVE_EFFECT_MODES.DOWNGRADE) {
            if(SR5ActiveEffect.applyDowngradeToModifiableValue(this, actor, change, current, delta)) return;
        }

        super._applyUpgrade(actor, change, current, delta, changes);
    }

    /**
     * Apply for the override mode but, if possible, apply to a ModifiableValue.
     * 
     * This method is designed to handle application and report back if further application is needed.
     * 
     * @param effect
     * @param model
     * @param change
     * @param current
     * @param delta
     * @param changes
     * @returns true, if a ModifiableValue was found and the override was applied.
     */
    static applyOverrideToModifiableValue(effect: SR5ActiveEffect, model: DataModel.Any, change: ActiveEffect.ChangeData, current, delta) {
        const modValue = SR5ActiveEffect.getModifiableValue(model, change.key);
        if (!modValue) return false;

        const value = Number(change.value);
        if (isNaN(value)) return true;

        modValue.override = { name: effect.name, value };

        return true;
    }

    /**
     * Apply for the Upgrade mode but, if possible, apply to a ModifiableValue.
     * @returns true, if a ModifiableValue was found and the override was applied.
    */
    static applyUpgradeToModifiableValue(effect: SR5ActiveEffect, model: DataModel.Any, change: ActiveEffect.ChangeData, current, delta) {
        const modValue = SR5ActiveEffect.getModifiableValue(model, change.key);
        if (!modValue) return false;

        const value = Number(change.value);
        if (isNaN(value)) return true;

        // Apply only the strongest (highest) upgrade
        if (!modValue.upgrade || value > modValue.upgrade.value)
            modValue.upgrade = { name: effect.name, value };

        return true;
    }

    /**
     * Apply for the Downgrade mode but, if possible, apply to a ModifiableValue.
     * @returns true, if a ModifiableValue was found and the override was applied.
     */
    static applyDowngradeToModifiableValue(effect: SR5ActiveEffect, model: DataModel.Any, change: ActiveEffect.ChangeData, current, delta) {
        const modValue = SR5ActiveEffect.getModifiableValue(model, change.key);
        if (!modValue) return false;

        const value = Number(change.value);
        if (isNaN(value)) return true;

        // Store only the strongest (lowest) cap
        if (!modValue.downgrade || value < modValue.downgrade.value)
            modValue.downgrade = { name: effect.name, value };

        return true;
    }

    /**
     * Return a ModifiableValue at the given key if it matches the ModifiableValue shape.
     * 
     * @param model Data model or plain object to resolve the key against.
     * @param key   Dot-delimited path to the candidate value.
     * @returns {ModifiableValueType | null} The ModifiableValue when found; otherwise null.
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
    static get modifiableValueProperties() {
        return ['base', 'value', 'mod', 'override', 'temp'];
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
     * @param model DataModel or any object to apply the change to
     * @param change The effect change to apply
     */
    override apply(model: DataModel.Any, change: ActiveEffect.ChangeData) {
        // legacyTransferal has item effects created with their items as owner/source.
        // modern transferal has item effects directly on owned items.
        const source = CONFIG.ActiveEffect.legacyTransferral ? this.source : this.parent;

        SR5ActiveEffect.alterChange(model, change);
        SR5ActiveEffect.resolveDynamicChangeValue(source, change);

        // Add item error case, as FoundryVTT ActiveEffect.apply() is not meant to be used on items.
        if (model instanceof SR5Item) throw new Error("SR5ActiveEffect.apply() cannot be used on SR5Item objects.");

        // Other cases should be directly applied to the data, without actor / schema handling.
        // This is used when applying effects to non-Actor objects, like tests.
        if (!(model instanceof SR5Actor)) {
            this._applyToObject(model, change);
            return {};
        }

        // Foundry default effect application will use DataModel.applyChange.
        const changes = super.apply(model, change);

        // ModifiableField applies some changes outside of Foundry behavior, not causing a override value.
        // Those override values are then undefined and should be hidden from Foundries 'override' behavior.
        for (const key of Object.keys(changes))
            if (changes[key] === undefined)
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete changes[key];

        return changes;
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

    /**
     * Handle application for none-Document objects
     * @param object
     * @param change
     * @returns
     */
    _applyToObject(object, change) {
        // Determine the data type of the target field
        const current = foundry.utils.getProperty(object, change.key);
        // let target = current;
        // if ( current === null ) {
        //   const model = game.model.Actor[test.type] || {};
        //   target = foundry.utils.getProperty(model, change.key) ?? null;
        // }

        const target = foundry.utils.getProperty(object, change.key);
        const targetType = foundry.utils.getType(target);

        // Cast the effect change value to the correct type
        let delta;
        try {
            if (Array.isArray(target)) {
                const innerType = target.length ? foundry.utils.getType(target[0]) : "string";
                delta = this.__castArray(change.value, innerType);
            }
            else delta = this.__castDelta(change.value, targetType);
        } catch (err) {
            console.warn(`Test [${object.constructor.name}] | Unable to parse active effect change for ${change.key}: "${change.value}"`);
            return;
        }

        // Apply the change depending on the application mode
        const modes = CONST.ACTIVE_EFFECT_MODES;
        const changes = {};
        switch (change.mode) {
            case modes.ADD:
                this._applyAdd(object, change, current, delta, changes);
                break;
            case modes.MULTIPLY:
                this._applyMultiply(object, change, current, delta, changes);
                break;
            case modes.OVERRIDE:
                this._applyOverride(object, change, current, delta, changes);
                break;
            case modes.UPGRADE:
            case modes.DOWNGRADE:
                this._applyUpgrade(object, change, current, delta, changes);
                break;
            default:
                this._applyCustom(object, change, current, delta, changes);
                break;
        }

        // Apply all changes to the Actor data
        foundry.utils.mergeObject(object, changes);

        return changes;
    }

    static override migrateData(data: any) {
        Migrator.migrate("ActiveEffect", data);

        return super.migrateData(data);
    }

    override async update(
        data: ActiveEffect.UpdateData | undefined,
        operation?: ActiveEffect.Database.UpdateOperation,
    ) {
        if (this.parent instanceof SR5Item && this.parent._isNestedItem) {
            if (data) data._id = this.id;
            await this.parent.updateNestedEffects(data);
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
    __castArray(raw, type) {
        let delta;
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
    __castDelta(raw, type) {
        let delta;
        switch (type) {
            case "boolean":
                delta = Boolean(this.__parseOrString(raw));
                break;
            case "number":
                delta = Number.fromString(raw);
                if (Number.isNaN(delta)) delta = 0;
                break;
            case "string":
                delta = String(raw);
                break;
            default:
                delta = this.__parseOrString(raw);
        }
        return delta;
    }

    /**
     * This is 1to1 copy from the FoundryVTTv13 method with the private-# prefix...
     * Parse serialized JSON, or retain the raw string.
     * @param {string} raw      A raw serialized string
     * @returns {*}             The parsed value, or the original value if parsing failed
     */
    __parseOrString(raw) {
        try {
            return JSON.parse(raw);
        } catch (err) {
            return raw;
        }
    }
}
