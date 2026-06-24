import { SR } from '../constants';
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { Migrator } from "../migrator/Migrator";
import { LinksHelpers } from '@/module/utils/links';
import { DataDefaults } from "../data/DataDefaults";
import { ModifiableValueType } from "../types/template/Base";
import { ModifiableValue } from "../mods/ModifiableValue";
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
 * NOTE: FoundryVTT DataModel is used to apply changes as well. Check custom Field implementations for effect change type
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
     * Whether this effect has a target for any of the given apply-to destinations.
     */
    appliesToAnyOf(applyTo: string[]): boolean {
        return this.system.targets.some(target => applyTo.includes(target.applyTo));
    }

    /**
     * Resolve the target a change belongs to or undefined if no matching target is found.
     */
    targetForChange(change: { target?: string }) {
        return this.system.targets.find(target => target.id === change.target);
    }

    /**
     * All changes whose resolved target applies to the given apply-to destination.
     */
    changesForApplyTo(applyTo: string) {
        return this.system.changes.filter(change => this.targetForChange(change)?.applyTo === applyTo);
    }

    /**
     * Ensure every effect is created with at least one target, so the config sheet always shows a
     * target and changes have a concrete destination. Effects created with explicit targets (tests,
     * imports, migration) keep theirs.
     */
    protected override async _preCreate(...args: Parameters<ActiveEffect['_preCreate']>): Promise<boolean | void> {
        const allowed = await super._preCreate(...args);
        if (allowed === false) return false;

        if (!this.system.targets?.length) {
            const id = 'actor';
            const changes = this.system.toObject().changes.map(change => ({
                ...change, target: change.target || id,
            }));
            this.updateSource({ system: { changes, targets: [{ id, applyTo: 'actor' }] } });
        } else {
            const firstId = this.system.targets[0].id;
            const sourceChanges = this.system.toObject().changes;
            if (sourceChanges.some(change => !change.target)) {
                const changes = sourceChanges.map(change => ({ ...change, target: change.target || firstId }));
                this.updateSource({ system: { changes } });
            }
        }

        // Core only anchors `start` for Actor-owned effects. Item-owned temporary effects need an
        // anchor too, otherwise isExpiryTrackable (requires !!start) will never be true for them.
        if (this.parent instanceof SR5Item && this.isTemporary && !this.start) {
            const combat = this.actor?.inCombat ? (game.combat ?? null) : null;
            this.updateSource({ start: SR5ActiveEffect.getEffectStart(combat) });
        }
    }

    /**
     * Always returns the parent actor of the effect, even if the effect is applied to an item.
     */
    override get actor(): SR5Actor | null {
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

    override get isSuppressed(): boolean {
        // Native registry sets duration.expired when the span+boundary are reached. Mirror that suppression
        // here so expired effects are greyed out and not applied, regardless of parent type.
        if (this.duration.expired) return true;

        if (!(this.parent instanceof SR5Item)) return false;

        if (this.system.onlyForEquipped && !this.parent.isEquipped()) return true;
        if (this.system.onlyForWireless && !this.parent.isWireless()) return true;
        if (this.parent.isType('critter_power') && !this.parent.system.enabled) return true;
        if (this.parent.isType('sprite_power') && !this.parent.system.enabled) return true;

        return false;
    }

    /**
     * `sr5MyAction` fires when the owner acts (any pass); everything else delegates to native.
     * SR5Combat._onUpdate emits `sr5ActionPhase` every phase, covering single-combatant re-acts
     * that Foundry's own turn dispatch misses.
     */
    override isExpiryEvent(event: string, context?: ActiveEffect.IsExpiryEventContext): boolean {
        if (this.duration.expiry !== 'sr5MyAction') return super.isExpiryEvent(event, context);
        const combat = context?.combat ?? game.combat;
        return event === 'sr5ActionPhase' && combat?.combatant?.actor === this.actor;
    }

    override _onUpdate(...args: Parameters<ActiveEffect["_onUpdate"]>) {
        super._onUpdate(...args);
        if (!game.users?.activeGM?.isSelf) return;
        const [changed] = args;

        if (changed?.duration?.expired === true && this.system.deleteOnExpiry) {
            void this.delete();
        }
    }

    /**
     * Re-enable an expired effect, reset its anchor, and re-register it with the expiry registry.
     * Use this to restart a duration that was consumed (e.g. buff renewed for another combat).
     */
    async restart(): Promise<this | void> {
        const combat = this.actor?.inCombat ? (game.combat ?? undefined) : undefined;
        return this.update({
            disabled: false,
            duration: { expired: false },
            start: SR5ActiveEffect.getEffectStart(combat ?? null),
        });
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

        // Effects copied onto a target actor by a test always apply to that actor.
        if (this.system.appliedByTest) return true;

        // Otherwise hide only effects whose targets are exclusively targeted_actor,
        // as those are meant for another actor acted upon, not the one acting.
        return this.system.targets.some(target => target.applyTo !== 'targeted_actor');
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
     * This can cause differing behavior between these two for effect application.
     *
     * @param targetDoc The targeted document or object...
     * @param change The effect change being applied
     * @param options Additional FoundryVTT options.
     */
    static override applyChange(
        targetDoc: ActiveEffect.TargetDocument | DataModel.Any,
        change: ActiveEffect.ChangeData,
        options: ActiveEffect.ApplyChangeOptions = {}
    ): Record<string, unknown> {
        // Foundry core iterates every change of an applicable effect when applying to actor data.
        // Only apply changes whose target is actor-bound. Both 'actor' and 'targeted_actor' targets
        // apply to actor data (targeted_actor effects are only collected onto an actor when they
        // belong to it - either embedded directly or copied there by a test).
        if (targetDoc instanceof SR5Actor && change.effect instanceof SR5ActiveEffect) {
            const target = change.effect.targetForChange(change as { target?: string });
            const appliesToActor = !!target && (target.applyTo === 'actor' || target.applyTo === 'targeted_actor');
            if (!appliesToActor) return {};
        }

        // Skip applying this change if the target key does not exist on the model.
        // TypedObjectField will otherwise create the missing property as a string,
        // which breaks data integrity and can result in errors like "undefined[object Object]".
        // For example, a change targeting "firstaid" instead of "first_aid" would trigger this case.
        if (!foundry.utils.hasProperty(targetDoc, change.key))
            return {};

        // Resolve dynamic value references in change.
        const source = change.effect?.parent ?? targetDoc;
        SR5ActiveEffect.alterChange(targetDoc, change);
        SR5ActiveEffect.resolveDynamicChangeValue(source, change);
        
        // Other cases should be directly applied to the data, without actor / schema handling.
        // This is used when applying effects to non-Actor objects, like tests. TokenDocument is
        // explicitly supported by Foundry v14's ActiveEffect.applyChange and must stay on the
        // core/schema path for token.* changes routed by Actor.applyActiveEffects.
        if (!(targetDoc instanceof SR5Actor) && !(targetDoc instanceof SR5Item) && !(targetDoc instanceof TokenDocument)) {
            return SR5ActiveEffect._applyToObject(targetDoc, change);
        }

        return super.applyChange(targetDoc, change, options);
    }

    /**
     * Handle application for none-Document objects. This is typically used for SuccessTest instances.
     */
    private static _applyToObject(object: any, change: ActiveEffect.ChangeData): Record<string, unknown> {
        const target = foundry.utils.getProperty(object, change.key);
        const targetType = foundry.utils.getType(target);

        // Cast the effect change value to the correct type
        let delta: any;
        try {
            if (Array.isArray(target)) {
                const innerType = target.length ? foundry.utils.getType(target[0]) : "string";
                delta = SR5ActiveEffect.__castArray(String(change.value), innerType);
            }
            else delta = SR5ActiveEffect.__castDelta(String(change.value), targetType);
        } catch (err) {
            console.warn(`Test [${object.constructor.name}] | Unable to parse active effect change for ${change.key}: "${change.value}"`);
            return {};
        }

        if (ModifiableValue.isModifiableValue(target)) {
            const effect = change.effect;
            if (!effect) return {};
            target.changes.push(
                DataDefaults.createData('change_entry', {
                    enabled: effect.active,
                    name: effect.name,
                    value: delta,
                    type: change.type,
                    priority: change.priority ?? ActiveEffect.CHANGE_TYPES[change.type]?.defaultPriority ?? 20,
                    source: effect.uuid,
                })
            );
            return {};
        }

        // In case of non-existent change.key targets, catch errors and log it, but still allow the overall process to continue.
        // An example could be applying test effect changes, and a single misconfigured effect change shouldn't stop the test dialog 
        // from showing up.
        // TODO: v14 - check if the commented out code is still needed
        try {
            const changes = {};
            SR5ActiveEffect._applyChangeUnguided(object, change, changes);
            return changes as Record<string, unknown>;
        } catch (err) {
            console.error(`Test [${object.constructor.name}] | Failed to apply active effect change for ${change.key}: "${change.value}"`, err);
            return {};
        }
    }

    /**
     * Resolve a dynamic change value to the actual numerical value. A dynamic change value contains key references
     * to model properties, which must be resolved before application as literal values.
     *
     * A dynamic change value follows the same rules as a Foundry roll formula (including dice pools).
     *
     * A change could contain the key of 'system.attributes.body' with the type add and a dynamic value of
     * '@system.technology.rating * 3'. The dynamic property path would be taken from either the source or parent
     * document of the effect before the resolved value would be applied onto the target document / object.
     *
     * @param source Any object style value, either a Foundry document or a plain object
     * @param change A singular ActiveEffect.ChangeData object
     */
    static resolveDynamicChangeValue(source: any, change: ActiveEffect.ChangeData) {
        // Dynamic value present?
        if (typeof change.value !== 'string') return;
        if (change.value.length === 0) return;

        // Use Foundry Roll Term parser to both resolve dynamic values and resolve calculations.
        const expression = Roll.replaceFormulaData(change.value, source);
        const value = Roll.validate(expression) ? Roll.safeEval(expression) : change.value;

        // Overwrite change value with graceful default, to avoid NaN errors during change application.
        // Adhere to FoundryVTT expectation of receiving string values.
        if (value == null) change.value = '0';
        else change.value = value.toString();
    }

    static override migrateData(data: Parameters<typeof ActiveEffect['migrateData']>[0]) {
        // Execute Foundry migration first, as their v14 effect.changes => effect.system.changes influences system migrations.
        data = super.migrateData(data);

        Migrator.migrate("ActiveEffect", data);

        return data;
    }

    override async update(
        data: ActiveEffect.UpdateInput,
        operation?: ActiveEffect.Database.UpdateOneDocumentOperation,
    ) {
        if (this.parent instanceof SR5Item && this.parent._isNestedItem) {
            if (!data || !this.id) return this;

            await this.parent.updateNestedEffects({ ...data, _id: this.id } as ActiveEffect.UpdateInput);
            this.render();
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
          change.priority = change.priority === 0 ? ActiveEffect.CHANGE_TYPES[change.type!]?.defaultPriority : change.priority;
        }
    }
}
