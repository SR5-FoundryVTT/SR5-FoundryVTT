import { SR5Actor } from '../actor/SR5Actor';
import { SR5 } from '../config';
import { ActionFlow } from '../item/flows/ActionFlow';
import { LinksHelpers } from '@/module/utils/links';

import ActiveEffectConfig = foundry.applications.sheets.ActiveEffectConfig;
import { ActiveEffectDM } from '@/module/types/effect/ActiveEffect';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5ActiveEffect } from './SR5ActiveEffect';
import { SR5ActiveEffectValueEditor } from './SR5ActiveEffectValueEditor';
import { Translation } from '../utils/strings';
import { EffectDurationStatus, prepareEffectDurationStatus } from './EffectDurationStatus';

/**
 * Data Object that gets provided to the templates for ActiveEffects
 */
type SR5ActiveEffectSheetData = ActiveEffectConfig.RenderContext & {
    selection_test_options: Record<string, Translation>;
    selection_category_options: Record<string, Translation>;
    selection_attribute_options: Record<string, Translation>;
    selection_skill_options: Record<string, Translation>;
    selection_limit_options: Record<string, Translation>;

    selectionModeOptions: { label: Translation, value: string }[];
    filterTypeOptions: { label: Translation, value: string }[];
    filterOptionsByType: Record<string, Record<string, Translation>>;

    applyToOptions: { label: Translation, value: string }[];
    changeTargetOptions: { label: string, value: string }[];
    targetApplyToById: Record<string, string>;
    changeTypes: Record<string, string>;
    changePriorityPlaceholders: Record<string, string>;
    expiryActionOptions: { label: string, value: 'default' | 'update' | 'delete', selected: boolean }[];
    system: ActiveEffectDM;
    systemFields: typeof ActiveEffectDM.schema.fields;

    /** Prepared boundary choices for the expiry trigger select. */
    boundaryOptions: { value: string; label: string; selected: boolean }[];
    /** State-aware summary for the duration status strip. */
    durationStatus: EffectDurationStatus;
    /** Prepared display data for the effect's working-copy start anchor. */
    start?: ActiveEffectConfig.StartContext | null;
}

/**
 * Shadowrun system alters some behaviors of Active Effects, making a custom ActiveEffectConfig necessary.
 *
 * NOTE: A ActiveEffectConfig class is comparable to a DocumentSheet class, but Foundry differentiates between
 * 'Config' and 'Sheet'.
 *
 * The Shadowrun5e system uses ActiveEffects for more than only altering actor data. Each effect defines one or
 * more 'targets', where each target bundles an apply-to destination ('actor', 'test_all', 'modifier', ...) with
 * its filter conditions. Each change of the effect is assigned to one of these targets, so a single effect can
 * drive different changes against different destinations with different rules.
 *
 * Editing model: the sheet edits a temporary working copy (`this.clone`) of the document rather than the
 * document itself. Structural actions (add/remove targets, conditions, changes) fold the live form into the
 * clone and mutate it through the schema (`clone.updateSource`). Nothing reaches the database until the user
 * presses "Submit Changes", at which point the form is written to the real document and the clone is dropped.
 *
 * Some apply-to types follow the default key-value change structure of altering data, while others (modifiers) allow
 * defining custom handlers to apply complex behaviors to targets. These differing behaviors are defined in
 * <>EffectsFlow.ts or <>ChangeFlow.ts and follow the Foundry interface of 'apply' and 'allApplicableEffects' methods.
 */
export class SR5ActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig<SR5ActiveEffectSheetData> {
    private static readonly HELP_PAGE_URL = 'http://sr5-foundryvtt.privateworks.com/index.php/Active_Effect';

    /**
     * Temporary working copy the sheet renders from and mutates. Created lazily from the document and
     * dropped on submit/close so the next render reflects the saved document.
     */
    private _clone: SR5ActiveEffect | null = null;
    private _restartDurationPending = false;
    private _valueEditor: SR5ActiveEffectValueEditor | null = null;

    get clone(): SR5ActiveEffect {
        return (this._clone ??= this.document.clone({}, { keepId: true }) as unknown as SR5ActiveEffect);
    }

    static override DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            ...super.DEFAULT_OPTIONS.actions,
            openHelp: this.#onOpenHelp,
            addTarget: this.#onAddTarget,
            removeTarget: this.#onRemoveTarget,
            addCondition: this.#onAddCondition,
            removeCondition: this.#onRemoveCondition,
            addChange: this.#onAddChange,
            deleteChange: this.#onDeleteChange,
            editChangeValue: this.#onEditChangeValue,
            restartDuration: this.#onRestartDuration,
        },
        classes: ["active-effect-config", SR5_APPV2_CSS_CLASS, 'named-sheet'],
        position: { width: 680 },
        window: {
            resizable: true
        },
    }

    static override TABS = {
        ...super.TABS,
        sheet: {
            ...super.TABS.sheet,
            tabs: [
                ...super.TABS.sheet.tabs.slice(0, 2),
                { id: 'targets', group: 'sheet', cssClass: '', label: 'SR5.ActiveEffect.Targets', icon: 'fas fa-filter' },
                ...super.TABS.sheet.tabs.slice(2),
            ],
            initial: 'details',
        }
    }

    /**
     * Do any final preparations when rendering the sheet
     */
    protected override async _renderHTML(context, options) {
        this._closeValueEditor();

        // push footer to the end of parts so it is rendered at the bottom
        if (options.parts?.includes("footer")) {
            const index = options.parts.indexOf("footer");
            options.parts.push(options.parts.splice(index, 1)[0]);
        }
        return super._renderHTML(context, options);
    }

    /**
     * Define the different parts to use for the template
     * - use the ActiveEffectConfig Parts by default
     */
    static override PARTS = {
        ...super.PARTS,
        // override the changes tab so we can use autoinline properties
        changes: {template: 'systems/shadowrun5e/dist/templates/effect/active-effect-changes.hbs', scrollable: ["ol[data-changes]"]},
        // override the details tab so we can include our extra settings
        details: {template: 'systems/shadowrun5e/dist/templates/effect/active-effect-details.hbs', scrollable: [""]},
        // override the duration tab with SR5-specific type/boundary controls
        duration: {template: 'systems/shadowrun5e/dist/templates/effect/active-effect-duration.hbs', scrollable: [""]},
        targets: {template: 'systems/shadowrun5e/dist/templates/effect/active-effect-targets.hbs', scrollable: [""]},
    }

    protected override async _renderFrame(...args: Parameters<ActiveEffectConfig['_renderFrame']>) {
        const frame = await super._renderFrame(...args);

        if (!this.hasFrame) return frame;

        const helpLabel = game.i18n.localize('SR5.Help');
        const helpButton = document.createElement('button');
        helpButton.type = 'button';
        helpButton.className = 'header-control fa-solid fa-circle-question icon';
        helpButton.dataset.action = 'openHelp';
        helpButton.dataset.tooltip = 'SR5.Tooltips.Effect.HelpLinkEnglishOnly';
        helpButton.setAttribute('aria-label', helpLabel);

        const copyUuidButton = frame.querySelector<HTMLButtonElement>('button[data-action="copyUuid"]');
        const closeButton = frame.querySelector<HTMLButtonElement>('button[data-action="close"]');

        if (copyUuidButton) {
            copyUuidButton.insertAdjacentElement('beforebegin', helpButton);
        } else if (closeButton) {
            closeButton.insertAdjacentElement('beforebegin', helpButton);
        }

        return frame;
    }

    /**
     * Prepare start details from the working clone so staged restarts are reflected before submit.
     */
    protected override async _prepareStartContext(): Promise<ActiveEffectConfig.StartContext | null> {
        const start = this.clone.toObject().start;
        if (!start) return null;

        const time = game.time.calendar.format(game.time.worldTime - start.time, 'ago');
        const combat = this.clone.start?.combat ?? null;
        const combatant = start.combatant ? (combat?.combatants.get(start.combatant) ?? null) : null;
        const combatantName = combatant?.visible ? (combatant.name ?? '???') : '???';
        const combatantInitiative = combatant?.visible === false
            ? '???'
            : typeof combatant?.initiative === 'number'
                ? combatant.initiative
                : game.i18n.localize('EFFECT.START.NoInitiative');

        return { ...start, time, combat, combatant, combatantName, combatantInitiative };
    }

    /**
     * Prepare data for the templates to use.
     * Renders from the working clone so unsaved structural edits show without touching the document.
     */
    override async _prepareContext(...args: Parameters<ActiveEffectConfig['_prepareContext']>) {
        const data = await super._prepareContext(...args);

        // Render every field from the working clone instead of the saved document.
        data.source = this.clone.toObject();
        data.system = this.clone.system;
        data.systemFields = this.clone.system.schema.fields;

        // create the lists of options for each selection
        data.selection_test_options = this._getTestOptions();
        data.selection_category_options = this._getCategoryOptions();
        data.selection_attribute_options = this._getAttributeOptions();
        data.selection_skill_options = this._getSkillOptions();
        data.selection_limit_options = this._getLimitOptions();

        data.selectionModeOptions = this.prepareSelectionModeOptions();
        data.filterTypeOptions = this.prepareFilterTypeOptions();
        data.filterOptionsByType = {
            tests: data.selection_test_options,
            categories: data.selection_category_options,
            skills: data.selection_skill_options,
            attributes: data.selection_attribute_options,
            limits: data.selection_limit_options,
        };
        data.applyToOptions = this.prepareApplyToOptions();
        data.changeTargetOptions = this.prepareChangeTargetOptions();
        data.targetApplyToById = this.prepareTargetApplyToById();
        data.changeTypes = this.prepareChangeTypes();
        data.changePriorityPlaceholders = this.prepareChangePriorityPlaceholders();
        data.expiryActionOptions = this.prepareExpiryActionOptions(data.source);

        // Duration tab context
        data.boundaryOptions = this.prepareBoundaryOptions(data.source);
        data.durationStatus = prepareEffectDurationStatus(this.clone, {
            restartPending: this._restartDurationPending,
        });

        return data;
    }

    /**
     * Discard the working copy when the sheet closes so a reused instance doesn't keep stale edits.
     */
    protected override _onClose(...args: Parameters<ActiveEffectConfig['_onClose']>) {
        this._closeValueEditor();
        super._onClose(...args);
        this._clone = null;
        this._restartDurationPending = false;
    }

    /**
     * Called just before the window itself renders
     * - add event listeners as needed
     * - access "html" via $(this.element) to use JQuery stuff
     */
    override async _onRender(...args: Parameters<ActiveEffectConfig['_onRender']>) {
        await super._onRender(...args);

        for (const select of this.element.querySelectorAll<HTMLSelectElement>('select.filter-condition-type')) {
            select.addEventListener('change', event => {
                void this._onConditionTypeChange(event, select);
            });
        }

        this._updateConditionTypeOptions();

        // disable and set tooltips on the priority inputs since we don't currently support changing it
        for (let i = 0; i < this.clone.system.changes.length; i++) {
            const input = this.element.querySelector<HTMLInputElement>(`input[name="system.changes.${i}.priority"]`);
            if (input) {
                input.removeAttribute('disabled');
                input.setAttribute('data-tooltip', 'SR5.Tooltips.Effect.PriorityFieldDisabled');
            }
        }
    }

    /**
     * Handle anything needed after the sheet has been rendered
     * - register tagify inputs
     */
    override async _postRender(...args: Parameters<ActiveEffectConfig['_postRender']>) {
        await super._postRender(...args);
        // once we render, process the Tagify Elements to we rendered
        Hooks.call('sr5_processTagifyElements', this.element);
    }

    static #onOpenHelp(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        LinksHelpers.openSourceURL(SR5ActiveEffectConfig.HELP_PAGE_URL);
    }

    static async #onAddTarget(this: SR5ActiveEffectConfig, event: PointerEvent, _target: HTMLElement) {
        event.preventDefault();
        const { targets } = this._syncFormIntoClone();
        // schema cleaning fills id + empty conditions
        targets.push({ applyTo: 'actor', name: `${game.i18n.localize('SR5.ActiveEffect.Target')} #${targets.length + 1}` });
        this.clone.updateSource({ system: { targets } });
        await this.render();
    }

    static async #onRemoveTarget(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const index = Number(target.dataset.targetIndex ?? -1);
        if (index < 0) return;

        const { targets, changes } = this._syncFormIntoClone();

        // Always keep at least one target so changes have a destination.
        if (targets.length <= 1) {
            ui.notifications?.warn(game.i18n.localize('SR5.ActiveEffect.AtLeastOneTarget'));
            return;
        }

        const removed = targets[index];
        targets.splice(index, 1);

        // Reassign any changes that referenced the removed target to the first remaining target.
        const fallbackId = targets[0]?.id ?? '';
        for (const change of changes) {
            if (change.target === removed?.id) change.target = fallbackId;
        }

        this.clone.updateSource({ system: { targets, changes } });
        await this.render();
    }

    static async #onAddCondition(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const targetIndex = Number(target.dataset.targetIndex ?? -1);
        const { targets } = this._syncFormIntoClone();
        if (!targets[targetIndex]) return;

        const usedTypes = new Set<string>((targets[targetIndex].conditions ?? []).map((c: any) => c.type as string));
        const availableType = Object.keys(SR5.effectFilterTypes).find(t => !usedTypes.has(t));
        if (!availableType) return;

        targets[targetIndex].conditions.push({ type: availableType });
        this.clone.updateSource({ system: { targets } });
        await this.render();
    }

    static async #onRemoveCondition(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const targetIndex = Number(target.dataset.targetIndex ?? -1);
        const conditionIndex = Number(target.dataset.conditionIndex ?? -1);
        const { targets } = this._syncFormIntoClone();
        if (!targets[targetIndex]?.conditions?.[conditionIndex]) return;
        targets[targetIndex].conditions.splice(conditionIndex, 1);
        this.clone.updateSource({ system: { targets } });
        await this.render();
    }

    static async #onAddChange(this: SR5ActiveEffectConfig, event: PointerEvent, _target: HTMLElement) {
        event.preventDefault();
        const { targets, changes } = this._syncFormIntoClone();
        const firstTarget = targets[0]?.id ?? '';
        changes.push({ key: '', value: '', target: firstTarget });
        this.clone.updateSource({ system: { changes } });
        await this.render();
    }

    static async #onDeleteChange(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const index = Number(target.closest('li')?.dataset.index ?? -1);
        if (index < 0) return;

        const { changes } = this._syncFormIntoClone();
        if (!changes[index]) return;

        changes.splice(index, 1);
        this.clone.updateSource({ system: { changes } });
        await this.render();
    }

    static #onEditChangeValue(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        const control = target.closest<HTMLElement>('.sr5-effect-value-control');
        const input = control?.querySelector<HTMLInputElement | HTMLTextAreaElement>('[name]');
        if (!control || !input) return;

        const applyTo = [...control.closest<HTMLElement>('.value')?.classList ?? []]
            .find(cssClass => cssClass.startsWith('autocomplete-value-'))
            ?.replace('autocomplete-value-', '');
        if (!applyTo) return;

        this._openValueEditor(control, input, applyTo);
    }

    /**
     * Stage a restart on the working clone. The saved effect is not changed until the sheet is submitted.
     */
    static async #onRestartDuration(this: SR5ActiveEffectConfig, event: PointerEvent, _target: HTMLElement) {
        event.preventDefault();
        this._syncFormIntoClone();

        const combat = this.clone.actor?.inCombat ? (game.combat ?? null) : null;
        this.clone.updateSource({
            disabled: false,
            duration: { expired: false },
            start: SR5ActiveEffect.getEffectStart(combat),
        });
        this._restartDurationPending = true;

        await this.render();
    }

    /**
     * Preserve conditional data which is intentionally absent from the rendered form.
     * This applies both to working-clone synchronization and the final document submit.
     */
    protected override _processFormData(...args: Parameters<ActiveEffectConfig['_processFormData']>) {
        const submitData = super._processFormData(...args) as {
            system?: { targets?: unknown };
            [key: string]: unknown;
        };
        const submittedTargets = submitData.system?.targets;

        if (submittedTargets && typeof submittedTargets === 'object') {
            const cloneTargets = this.clone.system.toObject().targets;
            for (const [index, submittedTarget] of Object.entries(submittedTargets)) {
                if (!submittedTarget || typeof submittedTarget !== 'object' || 'conditions' in submittedTarget) continue;

                const target = submittedTarget as { id?: string, conditions?: unknown[] };
                const existingTarget = cloneTargets.find(candidate => candidate.id === target.id)
                    ?? cloneTargets[Number(index)];
                target.conditions = existingTarget?.conditions ?? [];
            }
        }

        const dur = (submitData.duration ?? {}) as Record<string, unknown>;

        // A blank value input means permanent — no finite duration, never tracked.
        if (dur.value === null || dur.value === '' || dur.value === undefined) {
            dur.value = null;
        }

        // Normalize blank expiry string to null.
        if (dur.expiry === '' || dur.expiry === undefined) dur.expiry = null;

        if (this._restartDurationPending) {
            submitData.disabled = false;
            dur.expired = false;
            submitData.start = this.clone.toObject().start;
        }

        submitData.duration = dur;

        return submitData;
    }

    /**
     * Fold the live form's edits into the working clone before a structural mutation, so pending
     * field edits (apply-to, tags, key/value) survive the re-render. `updateSource` cleans the
     * form data — normalizing indexed-object arrays and filling schema defaults.
     */
    private _syncFormIntoClone() {
        const form = this.form;
        if (!form) throw new Error('Cannot read Active Effect data before its form is rendered.');

        const formData = new foundry.applications.ux.FormDataExtended(form);
        this.clone.updateSource(this._processFormData(null, form, formData));

        // Return detached data so callers can safely perform structural edits before updateSource.
        const { targets, changes } = this.clone.system.toObject();
        return {
            targets: targets as any[],
            changes: changes as any[],
        };
    }

    private _openValueEditor(anchor: HTMLElement, source: HTMLInputElement | HTMLTextAreaElement, applyTo: string) {
        if (this._valueEditor?.sourceInput === source) {
            this._valueEditor.bringToFront();
            this._valueEditor.focusTextarea();
            return;
        }

        this._closeValueEditor();

        const anchorRect = anchor.getBoundingClientRect();
        const editor = new SR5ActiveEffectValueEditor(this, source, applyTo, {
            top: Math.round(anchorRect.bottom + 6),
            left: Math.round(anchorRect.right - SR5ActiveEffectValueEditor.DEFAULT_WIDTH),
        });

        editor.addEventListener('close', () => {
            if (this._valueEditor === editor) this._valueEditor = null;
        }, { once: true });

        this._valueEditor = editor;
        // @ts-expect-error fvtt-types does not expose ApplicationV2 window.windowId yet.
        const windowId = this.window?.windowId;
        // @ts-expect-error fvtt-types is missing the AppV2 render options overload here.
        void editor.render({
            force: true,
            window: windowId ? { windowId } : undefined,
        });
    }

    private _closeValueEditor() {
        const editor = this._valueEditor;
        if (!editor) return;
        void editor.close();
        this._valueEditor = null;
    }

    /**
     * Disable condition type options already in use by sibling conditions within the same target,
     * so each filter type can only appear once per target.
     */
    private _updateConditionTypeOptions() {
        for (const targetEl of this.element.querySelectorAll<HTMLElement>('.effect-target')) {
            const typeSelects = [...targetEl.querySelectorAll<HTMLSelectElement>('select.filter-condition-type')];
            const usedTypes = new Set(typeSelects.map(s => s.value));
            for (const select of typeSelects) {
                for (const option of select.options) {
                    option.disabled = option.value !== select.value && usedTypes.has(option.value);
                }
            }
        }
    }

    private async _onConditionTypeChange(event: Event, select: HTMLSelectElement) {
        event.stopPropagation();

        const match = /^system\.targets\.(\d+)\.conditions\.(\d+)\.type$/.exec(select.name);
        if (!match) return;

        const { targets } = this._syncFormIntoClone();
        const condition = targets[Number(match[1])]?.conditions?.[Number(match[2])];
        if (!condition) return;

        condition.type = select.value;
        condition.values = [];
        this.clone.updateSource({ system: { targets } });
        await this.render();
    }

    /**
     * Prepare possible choice types. This is necessary as we override most effect templates and can't use
     * default FoundryVTT effect code.
     * NOTE: This is taken from FoundryVTT v14 preparePartsContext 'changes'
     */
    prepareChangeTypes() {
        return Object.entries(SR5ActiveEffect.CHANGE_TYPES)
            .map(([type, { label }]) => ({ type, label: game.i18n.localize(label) }))
            .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
            .reduce((types, { type, label }) => {
                types[type] = label;
                return types;
            }, {});

    }

    prepareChangePriorityPlaceholders() {
        return Object.entries(SR5ActiveEffect.CHANGE_TYPES).reduce((placeholders, [type, data]) => {
            placeholders[type] = String(data.defaultPriority ?? '');
            return placeholders;
        }, {} as Record<string, string>);
    }

    prepareSelectionModeOptions() {
        return Object.entries(SR5.effectSelectionModes)
            .map(([value, label]) => ({ label: game.i18n.localize(label) as Translation, value }));
    }

    prepareFilterTypeOptions() {
        return Object.entries(SR5.effectFilterTypes)
            .map(([value, label]) => ({ label: game.i18n.localize(label) as Translation, value }));
    }

    /**
     * Options for the per-change Target dropdown: one entry per target, labelled by its name.
     */
    prepareChangeTargetOptions() {
        return this.clone.system.targets.map((target, index: number) => ({
            value: target.id,
            label: target.name || `${game.i18n.localize('SR5.ActiveEffect.Target')} #${index + 1}`,
        }));
    }

    /**
     * Map of target id to its apply-to destination, used by the changes template to derive
     * each change row's apply-to (for autocomplete classes and column visibility).
     */
    prepareTargetApplyToById(): Record<string, string> {
        return Object.fromEntries(this.clone.system.targets.map(target => [target.id, target.applyTo]));
    }

    /**
     * Depending on this effects source document being actor or item, some effect apply to
     * should not be available.
     */
    prepareApplyToOptions() {
        const isActor = this.document.parent instanceof SR5Actor;

        return Object.entries(SR5.effectApplyTo)
            // Skip 'test_item' if the parent is an Actor
            .filter(([value]) => !(isActor && value === 'test_item'))
            // Map the remaining entries to the expected data model format
            .map(([value, label]) => ({ label: game.i18n.localize(label) as Translation, value }));
    }

    /**
     * Get the available Test types for applyTo Test options
     */
    _getTestOptions() {
        const options: Record<string, Translation> = {};

        for (const test of Object.values(game.shadowrun5e.tests) as any[]) {
            options[test.name] = test.label;
        }

        return options;
    }

    /**
     * Get the available Action Categories for applyTo Test options
     */
    _getCategoryOptions() {
        // Tagify expects this format for localized tags.
        return { ...SR5.actionCategories };
    }

    /**
     * Get the available Skills for applyTo Test options.
     * Includes skills already used in conditions so they remain selectable.
     */
    _getSkillOptions() {
        // Make sure custom skills of an actor source are included.
        const actor = this.document.actor;
        const actorOrNothing = !(actor instanceof SR5Actor) ? undefined : actor;

        const usedSkills = this.clone.system.targets
            .flatMap(t => t.conditions ?? [])
            .filter(c => c.type === 'skills')
            .flatMap(c => c.values ?? []);

        return ActionFlow.sortedActiveSkills(actorOrNothing, usedSkills);
    }

    /**
     * Get the available Attributes for applyTo Test options
     */
    _getAttributeOptions() {
        return { ...SR5.attributes };
    }

    /**
     * Get the available Limits for applyTo Test options
     */
    _getLimitOptions() {
        return { ...SR5.limits };
    }

    override _onChangeForm(...args: Parameters<ActiveEffectConfig['_onChangeForm']>) {
        super._onChangeForm(...args);
        const [, event] = args;
        const target = event.target;

        // Safely extract the name string
        const name = (target as HTMLSelectElement).name || "";

        // The combined regex as a boolean constant
        const isTargetOrApplyToChange = /^system\.(targets\.\d+\.(applyTo|name)|changes\.\d+\.target)$/.test(name);

        if ((target instanceof HTMLInputElement || target instanceof HTMLSelectElement) && isTargetOrApplyToChange) {
            this._syncFormIntoClone();
            void this.render();
            return;
        }

        if (target instanceof HTMLSelectElement && name.endsWith(".type")) {
            const priorityInput = target.closest("li")?.querySelector<HTMLInputElement>(
                `input[name="${name.replace(/\.type$/, ".priority")}"]`
            );
            if (priorityInput) {
                priorityInput.placeholder = String(ActiveEffect.CHANGE_TYPES[target.value]?.defaultPriority ?? "");
            }
        }

        if ((target instanceof HTMLInputElement || target instanceof HTMLSelectElement)
            && (name === 'duration.value' || name === 'duration.units')) {
            this._syncFormIntoClone();
            void this.render();
            return;
        }

        if (target instanceof HTMLSelectElement && name === 'duration.expiry') {
            this._syncFormIntoClone();
            void this.render();
            return;
        }
    }

    /** Build the expiry trigger choices list for the expiry trigger select. */
    private prepareBoundaryOptions(source: ReturnType<SR5ActiveEffect['toObject']>) {
        const current = source.duration?.expiry ?? null;
        return Object.entries(SR5.effectExpiryTriggers).map(([value, locKey]) => ({
            value,
            label: game.i18n.localize(locKey),
            selected: value === current,
        }));
    }

    /** Build the expiry action choices list, resolving the default label from Foundry's configured action. */
    private prepareExpiryActionOptions(source: ReturnType<SR5ActiveEffect['toObject']>) {
        const current = source.system?.expiryAction ?? 'default';
        const update = game.i18n.localize('SR5.ActiveEffect.Duration.ExpiryActionUpdate');
        const deleteAction = game.i18n.localize('SR5.ActiveEffect.Duration.ExpiryActionDelete');
        const configuredAction = CONFIG.ActiveEffect.expiryAction === 'delete' ? deleteAction : update;

        return [
            {
                value: 'default',
                label: game.i18n.format('SR5.ActiveEffect.Duration.ExpiryActionDefault', { action: configuredAction }),
                selected: current === 'default',
            },
            {
                value: 'delete',
                label: deleteAction,
                selected: current === 'delete',
            },
            {
                value: 'update',
                label: update,
                selected: current === 'update',
            },
        ] satisfies { label: string, value: 'default' | 'update' | 'delete', selected: boolean }[];
    }

}
