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
        const target = this.system.targets.find(target => target.id === change.target);
        if (target || change.target) return target;

        // Changes added through a later effect update do not pass through _preCreate's target
        // binding. A lone target is unambiguous and preserves the legacy actor-target default.
        return this.system.targets.length === 1 ? this.system.targets[0] : undefined;
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
            this.updateSource({ system: { changes, targets: [{ id, name: game.i18n.localize('SR5.ActiveEffect.Target'), applyTo: 'actor' }] } });
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
        if (this.parent instanceof SR5Item) return this.parent.actorOwner ?? null;
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
     * Out-of-place AE spike: custom application phase names for the native path.
     *
     * Actor-bound ModifiableValue changes are normalized into one of these phases during effect preparation.
     * They apply to the leaf `.value` NumberField at the matching dependency-layer boundary instead of being
     * redirected into a ModifiableValue's `changes[]`.
     */
    /**
     * Out-of-place AE spike (items): ModifiableValue keys whose item-target changes apply natively to the
     * leaf `.value` NumberField instead of being redirected into `changes[]`. Items are not applied through
     * Foundry's phase system (SR5 applies them manually in SR5Item.applyItemActiveEffects), so a flat key set
     * plays the role the phase names play for actors.
     */
    static readonly OUT_OF_PLACE_ITEM_VALUE_KEYS: readonly string[] = [
        'system.technology.cost',
        'system.technology.availability',
        'system.technology.conceal',
        'system.range.rc',
        'system.action.damage',
        'system.action.damage.ap',
        'system.action.limit',
        'system.armor',
    ];

    static readonly ATTRIBUTES_PHASE = 'attributes';
    static readonly FORCE_PHASE = 'force';
    static readonly LEVEL_PHASE = 'level';
    static readonly MATRIX_PHASE = 'matrix';
    static readonly VEHICLE_PHASE = 'vehicle';
    static readonly DERIVED_PHASE = 'derived';
    static readonly NATIVE_PHASES: readonly string[] = [
        SR5ActiveEffect.ATTRIBUTES_PHASE,
        SR5ActiveEffect.FORCE_PHASE,
        SR5ActiveEffect.LEVEL_PHASE,
        SR5ActiveEffect.MATRIX_PHASE,
        SR5ActiveEffect.VEHICLE_PHASE,
        SR5ActiveEffect.DERIVED_PHASE,
    ];

    /**
     * Whether a change's phase opts it into the native (out-of-place) application path.
     */
    static isNativePhase(phase: string | undefined): boolean {
        return !!phase && SR5ActiveEffect.NATIVE_PHASES.includes(phase);
    }

    /**
     * Normalize a character, spirit, or sprite actor's ModifiableValue change to its leaf NumberField and dependency phase.
     * This only mutates prepared effect data. The saved source remains in its original, user-authored form.
     */
    private normalizeActorValueChange(change: { key: string; phase: string; target?: string }) {
        const actor = this.actor;
        const target = this.targetForChange(change);
        if (!actor || !['character', 'spirit', 'sprite', 'vehicle', 'ic'].includes(actor.type) ||
            !target || !['actor', 'targeted_actor'].includes(target.applyTo)) return;

        const key = change.key;
        let valueKey: string | null = null;
        if (SR5ActiveEffect.getModifiableValue(actor, key)) {
            valueKey = `${key}.value`;
        } else {
            const nodes = key.split('.');
            const property = nodes.pop();
            const parentKey = nodes.join('.');
            if (property && SR5ActiveEffect.modifiableValueProperties.includes(property) &&
                SR5ActiveEffect.getModifiableValue(actor, parentKey)) {
                valueKey = `${parentKey}.value`;
            }
        }

        if (!valueKey) return;

        change.key = valueKey;
        if (actor.type === 'spirit' && valueKey === 'system.attributes.force.value') {
            change.phase = SR5ActiveEffect.FORCE_PHASE;
        } else if (actor.type === 'sprite' && valueKey === 'system.attributes.level.value') {
            change.phase = SR5ActiveEffect.LEVEL_PHASE;
        } else if (actor.type === 'vehicle' && /^system\.vehicle_stats\.[^.]+\.value$/.test(valueKey)) {
            change.phase = SR5ActiveEffect.VEHICLE_PHASE;
        } else if (/^system\.attributes\.[^.]+\.value$/.test(valueKey)) {
            change.phase = SR5ActiveEffect.ATTRIBUTES_PHASE;
        } else if (/^system\.matrix\.(attack|sleaze|data_processing|firewall)\.value$/.test(valueKey)) {
            change.phase = SR5ActiveEffect.MATRIX_PHASE;
        } else {
            change.phase = SR5ActiveEffect.DERIVED_PHASE;
        }
    }

    /**
     * Effect change given by user is altered to what is best for the system.
     *
     * We do this to avoid effects breaking the sheet and easing the use of custom changes
     * for users not aware of system internal around ModifiableValue.
     */
    static alterChange(model: DataModel.Any, change: ActiveEffect.ChangeData) {
        // Out-of-place AE spike: changes opted into a native phase (actors) or flagged out-of-place (items)
        // are applied natively to the leaf `.value` NumberField, so skip redirection to the parent
        // ModifiableField that would otherwise divert them into `changes[]`.
        if (SR5ActiveEffect.isNativePhase(change.phase) || (change as { outOfPlace?: boolean }).outOfPlace) return;

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
     * SR5 adds owner action-phase start/end triggers on top of the native combat boundaries.
     * `sr5MyActionStart` fires when the owner starts acting; `sr5MyActionEnd` fires when advancing
     * away from the owner's completed action phase. Outside of combat, both fall back to world-time
     * expiry once the duration span is exhausted, matching native combat-trigger behavior.
     */
    override isExpiryEvent(event: string, context?: ActiveEffect.IsExpiryEventContext): boolean {
        if (this.duration.expiry !== 'sr5MyActionStart' && this.duration.expiry !== 'sr5MyActionEnd') {
            return super.isExpiryEvent(event, context);
        }

        if (event === 'updateWorldTime') return !this.actor?.inCombat;

        const combat = context?.combat ?? game.combat;
        const actorMatches = combat?.combatant?.actor === this.actor;
        if (!actorMatches) return false;

        if (this.duration.expiry === 'sr5MyActionStart') return event === 'sr5ActionPhaseStart';
        return event === 'sr5ActionPhaseEnd';
    }

    override _onUpdate(...args: Parameters<ActiveEffect["_onUpdate"]>) {
        super._onUpdate(...args);
        if (!game.users?.activeGM?.isSelf) return;
        const [changed] = args;

        if (changed?.duration?.expired === true && this.resolvedExpiryAction === 'delete') {
            void this.delete();
        }
    }

    private get resolvedExpiryAction() {
        const action = this.system.expiryAction ?? 'default';
        return action === 'default' ? CONFIG.ActiveEffect.expiryAction : action;
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
        if (targetDoc instanceof SR5Item && change.effect instanceof SR5ActiveEffect) {
            const target = change.effect.targetForChange(change as { target?: string });
            if (target?.applyTo !== 'item') return {};
        }

        // Skip applying this change if the target key does not exist on the model.
        // TypedObjectField will otherwise create the missing property as a string,
        // which breaks data integrity and can result in errors like "undefined[object Object]".
        // For example, a change targeting "firstaid" instead of "first_aid" would trigger this case.
        if (!foundry.utils.hasProperty(targetDoc, change.key))
            return {};

        // Resolve dynamic value references in change.
        const source = SR5ActiveEffect.dynamicChangeSource(change.effect?.parent) ?? targetDoc;
        SR5ActiveEffect.alterChange(targetDoc, change);
        SR5ActiveEffect.resolveDynamicChangeValue(source, change);
        
        // Other cases should be directly applied to the data, without actor / schema handling.
        // This is used when applying effects to non-Actor objects, like tests. TokenDocument is
        // explicitly supported by Foundry v14's ActiveEffect.applyChange and must stay on the
        // core/schema path for token.* changes routed by Actor.applyActiveEffects.
        if (!(targetDoc instanceof SR5Actor) && !(targetDoc instanceof SR5Item) && !(targetDoc instanceof TokenDocument)) {
            return SR5ActiveEffect._applyToObject(targetDoc, change);
        }

        const result = super.applyChange(targetDoc, change, options);

        // Out-of-place AE spike: native application mutates `.value` directly and leaves `changes[]` empty,
        // so the sheet tooltip would lose the attribute AE. Record a display-only entry so the existing
        // tooltip renderer (ModifierHelpers reads the value's `changes[]`) still shows it.
        // NOTE (Risk 2): this is a plain applied-delta log; it does NOT recompute override/upgrade masking
        // across multiple changes, so a masked change would still display un-struck.
        const actorNative = SR5ActiveEffect.isNativePhase(change.phase) && targetDoc instanceof SR5Actor;
        const itemNative = (change as { outOfPlace?: boolean }).outOfPlace && targetDoc instanceof SR5Item;
        if (actorNative || itemNative) {
            SR5ActiveEffect.recordNativeChange(targetDoc, change);
        }

        return result;
    }

    /**
     * Out-of-place AE spike: append a display-only entry into the target ModifiableValue's `changes[]`
     * for a natively-applied change, so the sheet tooltip keeps showing it. The value itself is already
     * set by Foundry's native application; this entry is for display and is cleared each prep cycle by
     * ModifiableFieldPrep.resetAllModifiers.
     *
     * @param actor The actor the change was applied to.
     * @param change The natively-applied change (leaf key, e.g. system.attributes.body.value).
     */
    static recordNativeChange(target: SR5Actor | SR5Item, change: ActiveEffect.ChangeData) {
        if (!change.effect) return;

        const value = Number(change.value);
        if (!Number.isFinite(value)) return;

        // The ModifiableValue lives one level up from the leaf value key.
        const nodes = change.key.split('.');
        nodes.pop();
        const mod = SR5ActiveEffect.getModifiableValue(target, nodes.join('.'));
        if (!mod) return;

        mod.changes.push(
            DataDefaults.createData('change_entry', {
                name: change.effect.name,
                type: change.type,
                value,
                priority: change.priority ?? ActiveEffect.CHANGE_TYPES[change.type!]?.defaultPriority ?? 20,
                source: change.effect.uuid,
            })
        );
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
     * Resolve a dynamic change value against model data before it's applied to a document.
     *
     * A dynamic value contains @property references (e.g. '@system.technology.rating * 3'),
     * substituted from source, then evaluated with Foundry's Math-sandboxed evaluator. On success,
     * change.value is overwritten with the resulting number; otherwise it's left as-is so the
     * change is skipped.
     *
     * @param source Any object style value, either a Foundry document or a plain object
     * @param change A singular ActiveEffect.ChangeData object
     */
    /**
     * Out-of-place AE spike: build the data object that dynamic change values (`@` references) resolve
     * against. `@system.*` references are resolved from the effect parent's raw persisted `_source`
     * instead of the prepared model, so a dynamic value is deterministic and independent of prior effect
     * application / derived-data preparation order.
     *
     * Falls back to the parent as-is when it has no DataModel `_source` (e.g. plain-object test targets).
     *
     * @param parent The effect's parent document (Actor/Item) or undefined.
     * @returns The resolution data object, or null when there is no parent.
     */
    static dynamicChangeSource(parent: any): object | null {
        if (!parent) return null;

        const rawSystem = parent.system?._source;
        if (!rawSystem) return parent;

        return { ...parent, system: rawSystem };
    }

    static resolveDynamicChangeValue(source: any, change: ActiveEffect.ChangeData) {
        // Dynamic value present?
        if (typeof change.value !== 'string') return;
        if (change.value.length === 0) return;

        // Evaluated via Foundry's Math-sandboxed evaluator.
        // Trim: a leading newline triggers ASI on safeEval's internal `return`.
        const expression = Roll.replaceFormulaData(change.value, source).trim();
        try {
            const value = Roll.safeEval(expression);
            if (Number.isFinite(value)) change.value = value.toString();
        } catch {
            // Unresolvable: leave change.value as-is so appliers reject it and skip the change.
        }
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
            this.normalizeActorValueChange(change);
        }
    }
}
