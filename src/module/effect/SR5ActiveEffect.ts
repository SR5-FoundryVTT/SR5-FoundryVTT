import { SR5Actor } from "../actor/SR5Actor";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import { ModifiableValueType } from "../types/template/Base";
import { tagifyFlagsToIds } from "../utils/sheets";



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
 */
export class SR5ActiveEffect extends ActiveEffect {
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
        return;
    }

    async toggleDisabled() {
        return this.update({ disabled: !this.disabled });
    }

    async disable(disabled) {
        return this.update({ disabled });
    }

    protected override _applyCustom(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        return this._applyModify(actor, change, current, delta, changes);
    }

    /**
     * Apply a modification to a ModifiableValue.
     * Both direct key matches to the whole value and indirect matches to a value property are supported.
     */
    protected _applyModify(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        // Check direct key.
        const value = this.getModifiableValue(actor, change.key);
        if (value) {
            value.mod.push({ name: this.name, value: Number(change.value) });

            return;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // Don't apply any changes if it's also not a indirect match.
        const modValue = this.getModifiableValue(actor, indirectKey);
        if (modValue) {
            modValue.mod.push({ name: this.name, value: Number(change.value) });

            return;
        }

        // Don't apply any changes if there is NO matching value.
        if (value === undefined) return;

        // If both indirect or direct didn't provide a match, assume the user want's to add to whatever value chosen
        super._applyAdd(actor, change, current, delta, changes);
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
    protected override _applyOverride(actor: SR5Actor, change: ActiveEffect.ChangeData, current, delta, changes) {
        // Check direct key.
        const modValue = this.getModifiableValue(actor, change.key);
        if (modValue) {
            modValue.override = { name: this.name, value: Number(change.value) };
            modValue.value = Number(change.value);

            return;
        }

        super._applyOverride(actor, change, current, delta, changes);
    }

    getModifiableValue(actor: SR5Actor, key: string): ModifiableValueType | null {
        const possibleValue = foundry.utils.getProperty(actor, key);
        const possibleValueType = foundry.utils.getType(possibleValue);

        if (possibleValue != null && possibleValueType === 'Object' && Helpers.objectHasKeys(possibleValue, ['value', 'mod']))
            return possibleValue as ModifiableValueType;

        return null;
    }

    /**
     * Apply to target configured for this effect.
     * 
     * @returns Either the configured value or 'actor' as a default.
     */
    get applyTo() {
        return this.flags[game.system.id]?.applyTo || 'actor';
    }

    /**
     * Some effects should only be applied depending on their parent items wireless status.
     * 
     * When this flag is set, the parent item wireless status is taken into account.
     */
    get onlyForWireless(): boolean {
        return this.flags[game.system.id]?.onlyForEquipped || false;
    }

    /**
     * Some effects should only be applied depending on their parent items enabled status.
     * 
     * When this flag is set, the parent item enabled status is taken into account.
     */
    get onlyForEquipped(): boolean {
        return this.flags[game.system.id]?.onlyForEquipped || false;
    }

    /**
     * Some modifier effects should only be applied if they're applied for their parent items test.
     * 
     * When this flag is set, this effect shouldn't apply always.
     */
    get onlyForItemTest(): boolean {
        return this.flags[game.system.id]?.onlyForItemTest || false;
    }

    /**
     * Determine if this effect has been created using the test effect application flow
     * typically reserved for targeted_actor effects.
     * 
     * @returns true, when the effect has been applied by a test.
     */
    get appliedByTest(): boolean {
        return this.flags[game.system.id]?.appliedByTest || false;
    }

    get selectionTests(): string[] {
        return tagifyFlagsToIds(this, 'selection_tests');
    }

    get selectionCategories() {
        return tagifyFlagsToIds(this, 'selection_categories') as Shadowrun.ActionCategories[];
    }

    get selectionSkills(): string[] {
        return tagifyFlagsToIds(this, 'selection_skills');
    }

    get selectionAttributes(): string[] {
        return tagifyFlagsToIds(this, 'selection_attributes');
    }

    get selectionLimits(): string[] {
        return tagifyFlagsToIds(this, 'selection_limits');
    }

    override get isSuppressed(): boolean {
        if (!(this.parent instanceof SR5Item)) return false;

        if (this.onlyForEquipped && !this.parent.isEquipped()) return true;
        if (this.onlyForWireless && !this.parent.system.technology?.wireless) return true;
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

        if (this.applyTo === 'targeted_actor') {
            return this.appliedByTest;
        }

        return true;
    }

    /**
     * Inject features into default FoundryVTT ActiveEffect implementation.
     * 
     * - dynamic source properties as change values
     * - apply to non-Actor objects
     * 
     * @param object 
     * @param change 
     */
    override apply(actor: SR5Actor, change: ActiveEffect.ChangeData) {
        // legacyTransferal has item effects created with their items as owner/source.
        // modern transferal has item effects directly on owned items.
        const source = CONFIG.ActiveEffect.legacyTransferral ? this.source : this.parent;

        SR5ActiveEffect.resolveDynamicChangeValue(source, change);

        // Add item error case, as FoundryVTT ActiveEffect.apply() is not meant to be used on items.
        if (actor instanceof SR5Item) throw new Error("SR5ActiveEffect.apply() cannot be used on SR5Item objects.");

        // Other cases should be directly applied to the data, without actor / schema handling.
        // This is used when applying effects to non-Actor objects, like tests.
        if (!(actor instanceof SR5Actor)) {
            this._applyToObject(actor, change);
            return {};
        }
        // Foundry can be used to apply to actors.
        return super.apply(actor, change);
    }

    /**
     * Resolve a dynamic change value to the actual numerical value.
     * 
     * A dynamic change value follows the same rules as a Foundry roll formula (including dice pools).
     * 
     * So a change could have the key of 'system.attributes.body' with the mode Modify and a dynamic value of
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
        const current = foundry.utils.getProperty(object, change.key) ?? null;
        // let target = current;
        // if ( current === null ) {
        //   const model = game.model.Actor[test.type] || {};
        //   target = foundry.utils.getProperty(model, change.key) ?? null;
        // }

        const target = foundry.utils.getProperty(object, change.key) ?? null;
        let targetType = foundry.utils.getType(target);

        // Cast the effect change value to the correct type
        let delta;
        try {
            if (targetType === "Array") {
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

    /**
     * Override Foundry effect data migration to avoid data => system migration.
     * 
     * Since the system provides autocomplete-inline-properties as a relationship and
     * has it configured to provide system as the default key, the Foundry migration
     * shouldn't be necessary. The migration hinders effects with apply-to test.
     * 
     * All migrations here are taken from FoundryVtt common.js BaseActiveEffect#migrateData
     * for v11.315
     */
    static override migrateData(data: any) {
        /**
         * label -> name
         * @deprecated since v11
         */
        this._addDataFieldMigration(data, "label", "name", d => d.label || "Unnamed Effect");

        return data;
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
