import { SR5Actor } from "../actor/SR5Actor";
import { Helpers } from "../helpers";
import { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import { SYSTEM_NAME } from "../constants";
import { SR5Item } from "../item/SR5Item";



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
    public origin: string;
    public active: boolean;
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
        //@ts-ignore
        return this.origin ? fromUuidSync(this.origin) : null;
    }

    /**
     * Render the sheet of the active effect source
     */
    public renderSourceSheet() {        
        return this.source?.sheet?.render(true);
    }

    async toggleDisabled() {
        // @ts-ignore
        return this.update({ disabled: !this.disabled });
    }

    async disable(disabled) {
        return this.update({ disabled });
    }

    //@ts-ignore // TODO: foundry-vtt-types
    protected _applyCustom(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        return this._applyModify(actor, change, current, delta, changes);
    }

    /**
     * Apply a modification to a ModifiableValue.
     * Both direct key matches to the whole value and indirect matches to a value property are supported.
     *
     * @protected
     */
    //@ts-ignore // TODO: foundry-vtt-types
    protected _applyModify(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            const value = foundry.utils.getProperty(actor, change.key) as Shadowrun.ModifiableValue;
            //@ts-ignore // TODO: foundry-vtt-types v10
            value.mod.push({ name: this.name, value: Number(change.value) });

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // Don't apply any changes if it's also not a indirect match.
        if (this._isKeyModifiableValue(actor, indirectKey)) {
            const value = foundry.utils.getProperty(actor, indirectKey) as Shadowrun.ModifiableValue;
            //@ts-ignore // TODO: foundry-vtt-types v10
            value.mod.push({ name: this.name, value: Number(change.value) });

            return null;
        }

        // If both indirect or direct didn't provide a match, assume the user want's to add to whatever value chosen
        //@ts-ignore // TODO: foundry-vtt-types
        return super._applyAdd(actor, change, current, delta, changes);
    }

    /**
     * Overriding can be tricky if the overwritten value is a ModifiableValue with derived values.
     *
     * To keep the ActiveEffect workflow simple and still allow to override values that aren't a ModifiableValue,
     * check for such values and give the ActorDataPreparation flow some hints.
     *
     * @protected
     */
    //@ts-ignore // TODO: foundry-vtt-types
    protected _applyOverride(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            const value = foundry.utils.getProperty(actor, change.key);
            //@ts-ignore // TODO: foundry-vtt-types v10
            value.override = { name: this.name, value: Number(change.value) };
            value.value = change.value;

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        if (this._isKeyModifiableValue(actor, indirectKey)) {
            const value = foundry.utils.getProperty(actor, indirectKey);
            //@ts-ignore // TODO: foundry-vtt-types v10
            value.override = { name: this.name, value: Number(change.value) };

            return null;
        }

        // Neither a direct nor an indirect ModifiableValue match.
        //@ts-ignore // TODO: foundry-vtt-types v10
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
     * When this flag is set the parent item wireless status is taken into account.
     */
    get onlyForWireless(): boolean {
        return this.getFlag(SYSTEM_NAME, 'onlyForWireless') as boolean || false;
    }

    /**
     * Some effects should only be applied when their parent item is in active wireless mode.
     */
    applyForWirelessActiveOnly(item: SR5Item|undefined): boolean {
        if (!item) return false;
        if (!this.onlyForWireless) return true;

        return item.isWireless();
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
        // @ts-ignore
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
        const terms = Roll.parse(change.value, source);
        const expression = terms.map(term => term.total).join(' ');
        const value = Roll.safeEval(expression);

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
                //@ts-ignore
                delta = this._castArray(change.value, innerType);
            }
            //@ts-ignore
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
                //@ts-ignore
                this._applyAdd(object, change, current, delta, changes);
                break;
            case modes.MULTIPLY:
                //@ts-ignore
                this._applyMultiply(object, change, current, delta, changes);
                break;
            case modes.OVERRIDE:
                //@ts-ignore
                this._applyOverride(object, change, current, delta, changes);
                break;
            case modes.UPGRADE:
            case modes.DOWNGRADE:
                //@ts-ignore
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
}