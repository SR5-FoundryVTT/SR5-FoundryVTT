import { SR5Actor } from "../actor/SR5Actor";
import { Helpers } from "../helpers";
import { EffectChangeData, EffectChangeDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import { SYSTEM_NAME } from "../constants";
import { SR5Item } from "../item/SR5Item";
import { TagifyTags, tagifyFlagsToIds } from "../utils/sheets";



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
    // Foundry Core typing missing... TODO: foundry-vtt-types v10
    public active: boolean;
    public origin: string | null;
    public changes: EffectChangeData[];

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

    public get source(): SR5Actor | SR5Item | null {
        //@ts-expect-error // TODO: foundry-vtt-types v10
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
        return this.source?.sheet?.render(true);
    }

    async toggleDisabled() {
        // @ts-expect-error  TODO: foundry-vtt-types v10
        return this.update({ disabled: !this.disabled });
    }

    async disable(disabled) {
        return this.update({ disabled });
    }

    //@ts-expect-error // TODO: foundry-vtt-types
    protected _applyCustom(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        return this._applyModify(actor, change, current, delta, changes);
    }

    /**
     * Apply a modification to a ModifiableValue.
     * Both direct key matches to the whole value and indirect matches to a value property are supported.
     *
     * @protected
     */
    protected _applyModify(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        const value = foundry.utils.getProperty(actor, change.key);
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            value.mod.push({ name: this.name, value: Number(change.value) });

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // Don't apply any changes if it's also not a indirect match.
        if (this._isKeyModifiableValue(actor, indirectKey)) {
            const value = foundry.utils.getProperty(actor, indirectKey);
            value.mod.push({ name: this.name, value: Number(change.value) });

            return null;
        }

        // Don't apply any changes if there is NO matching value.
        if (value === undefined) return null;

        // If both indirect or direct didn't provide a match, assume the user want's to add to whatever value chosen
        //@ts-expect-error // TODO: foundry-vtt-types
        return super._applyAdd(actor, change, current, delta, changes);
    }

    /**
     * Overriding can be tricky if the overwritten value is a ModifiableValue with derived values.
     *
     * To keep the ActiveEffect workflow simple and still allow to override values that aren't a ModifiableValue,
     * check for such values and give the ActorDataPreparation flow some hints.
     * 
     * To complicate things, there are some use cases when overwriting an actual property of a ValueField
     * is needed. The SR5 uneducated quality needs to override the canDefault field of a skill.
     *
     * @protected
     */
    //@ts-expect-error // TODO: foundry-vtt-types
    protected _applyOverride(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            const value = foundry.utils.getProperty(actor, change.key);
            value.override = { name: this.name, value: Number(change.value) };
            value.value = change.value;

            return null;
        }

        //@ts-expect-error // TODO: foundry-vtt-types v10
        return super._applyOverride(actor, change, current, delta, changes);
    }

    _isKeyModifiableValue(actor: SR5Actor, key: string): boolean {
        const possibleValue = foundry.utils.getProperty(actor, key);
        const possibleValueType = foundry.utils.getType(possibleValue);

        return possibleValue && possibleValueType === 'Object' && Helpers.objectHasKeys(possibleValue, this.minValueKeys);
    }

    /**
     * Match against these keys, as the exact ModifiableValue layout might be different from time to time.
     */
    get minValueKeys(): string[] {
        return ['value', 'mod'];
    }

    /**
     * Apply to target configured for this effect.
     * 
     * @returns Either the configured value or 'actor' as a default.
     */
    get applyTo() {
        return this.getFlag(SYSTEM_NAME, 'applyTo') as Shadowrun.EffectApplyTo || 'actor';
    }

    /**
     * Some effects should only be applied depending on their parent items wireless status.
     * 
     * When this flag is set, the parent item wireless status is taken into account.
     */
    get onlyForWireless(): boolean {
        return this.getFlag(SYSTEM_NAME, 'onlyForWireless') as boolean || false;
    }

    /**
     * Some effects should only be applied depending on their parent items enabled status.
     * 
     * When this flag is set, the parent item enabled status is taken into account.
     */
    get onlyForEquipped(): boolean {
        return this.getFlag(SYSTEM_NAME, 'onlyForEquipped') as boolean || false;
    }

    /**
     * Some modifier effects should only be applied if they're applied for their parent items test.
     * 
     * When this flag is set, this effect shouldn't apply always.
     */
    get onlyForItemTest(): boolean {
        return this.getFlag(SYSTEM_NAME, 'onlyForItemTest') as boolean || false;
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
        if (this.onlyForWireless && !this.parent.isWireless()) return true;

        return false; 
    }

    /**
     * Determine if this effect is meant to be applied to the actor it's existing on.
     * 
     * Some effects are meant to be applied to other actors, and those shouldn't apply or show
     * on the actor that will cause them.
     * 
     * @return true, when the effect is meant to be applied to the actor it's existing on.
     */
    get appliesToLocalActor(): boolean {
        return !['targeted_actor'].includes(this.applyTo);
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
    override apply(object: any, change) {
        // @ts-expect-error
        // legacyTransferal has item effects created with their items as owner/source.
        // modern transferal has item effects directly on owned items.
        const source = CONFIG.ActiveEffect.legacyTransferral ? this.source : this.parent;

        SR5ActiveEffect.resolveDynamicChangeValue(source, change);

        // Foundry can be used to apply to actors.
        if (object instanceof SR5Actor) {
            return super.apply(object, change);
        }

        // Custom handling to apply to other object types.
        this._applyToObject(object, change);
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
     * @param change A singular EffectChangeData object
     */
    static resolveDynamicChangeValue(source: any, change: EffectChangeData) {
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
                //@ts-expect-error TODO: foundry-vtt-types v10
                delta = this._castArray(change.value, innerType);
            }
            //@ts-expect-error TODO: foundry-vtt-types v10
            else delta = this._castDelta(change.value, targetType);
        } catch (err) {
            console.warn(`Test [${object.constructor.name}] | Unable to parse active effect change for ${change.key}: "${change.value}"`);
            return;
        }

        // Apply the change depending on the application mode
        const modes = CONST.ACTIVE_EFFECT_MODES;
        const changes = {};
        switch (change.mode) {
            case modes.ADD:
                //@ts-expect-error TODO: foundry-vtt-types v10
                this._applyAdd(object, change, current, delta, changes);
                break;
            case modes.MULTIPLY:
                //@ts-expect-error TODO: foundry-vtt-types v10
                this._applyMultiply(object, change, current, delta, changes);
                break;
            case modes.OVERRIDE:
                this._applyOverride(object, change, current, delta, changes);
                break;
            case modes.UPGRADE:
            case modes.DOWNGRADE:
                //@ts-expect-error TODO: foundry-vtt-types v10
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
    // @ts-expect-error foundry-vtt-types v10
    static override migrateData(data: any) {
        /**
         * label -> name
         * @deprecated since v11
         */
        // @ts-expect-error TODO: foundry-vtt-types v10
        this._addDataFieldMigration(data, "label", "name", d => d.label || "Unnamed Effect");

        return data;
    }
}
