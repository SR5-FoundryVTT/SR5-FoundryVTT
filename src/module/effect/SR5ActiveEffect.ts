import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { Migrator } from "../migrator/Migrator";
import { ModifiableValueType } from "../types/template/Base";

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
    static redirectToNearModifiableValue(actor: SR5Actor, change: ActiveEffect.ChangeData) {
        // Move key up one hierarchy and check indirect match
        const nodes = change.key.split('.');
        const property = nodes.pop() ?? '';
        const indirectKey = nodes.join('.');

        const value = SR5ActiveEffect.getModifiableValue(actor, indirectKey);
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
    static alterChange(actor: SR5Actor, change: ActiveEffect.ChangeData) {
        if (!SR5ActiveEffect.getModifiableValue(actor, change.key))
            SR5ActiveEffect.redirectToNearModifiableValue(actor, change);
    }

    /**
     * Return a ModifiableValue at the given key if it matches the ModifiableValue shape.
     */
    static getModifiableValue(actor: SR5Actor, key: string): ModifiableValueType | null {
        const possibleValue = foundry.utils.getProperty(actor, key);
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
     */
    override apply(actor: SR5Actor, change: ActiveEffect.ChangeData) {
        // legacyTransferal has item effects created with their items as owner/source.
        // modern transferal has item effects directly on owned items.
        const source = CONFIG.ActiveEffect.legacyTransferral ? this.source : this.parent;

        SR5ActiveEffect.alterChange(actor, change);
        SR5ActiveEffect.resolveDynamicChangeValue(source, change);

        // Add item error case, as FoundryVTT ActiveEffect.apply() is not meant to be used outside of Actor objects.
        if (!(actor instanceof Actor)) throw new Error("SR5ActiveEffect.apply() cannot be used on non-Actor objects.");

        return Object.fromEntries(
            Object.entries(super.apply(actor, change)).filter(([, v]) => v != null)
        );
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
}
