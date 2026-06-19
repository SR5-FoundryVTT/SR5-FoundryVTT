import { SR5Actor } from '../actor/SR5Actor';
import { SR5 } from '../config';
import { ActionFlow } from '../item/flows/ActionFlow';
import { LinksHelpers } from '@/module/utils/links';

import ActiveEffectConfig = foundry.applications.sheets.ActiveEffectConfig;
import { ActiveEffectDM } from '@/module/types/effect/ActiveEffect';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5ActiveEffect } from './SR5ActiveEffect';
import { Translation } from '../utils/strings';

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
    system: ActiveEffectDM;
    systemFields: typeof ActiveEffectDM.schema.fields;
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
 * Some apply-to types follow the default key-value change structure of altering data, while others (modifiers) allow
 * defining custom handlers to apply complex behaviors to targets. These differing behaviors are defined in
 * <>EffectsFlow.ts or <>ChangeFlow.ts and follow the Foundry interface of 'apply' and 'allApplicableEffects' methods.
 */
export class SR5ActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig<SR5ActiveEffectSheetData> {
    private static readonly HELP_PAGE_URL = 'http://sr5-foundryvtt.privateworks.com/index.php/Active_Effect';

    static override DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            openHelp: this.#onOpenHelp,
            addTarget: this.#onAddTarget,
            removeTarget: this.#onRemoveTarget,
            addCondition: this.#onAddCondition,
            removeCondition: this.#onRemoveCondition,
            addChange: this.#onAddChange,
        },
        classes: ["active-effect-config", SR5_APPV2_CSS_CLASS, 'named-sheet'],
        position: { width: 760 },
        window: {
            resizable: true
        },
        // Persist edits immediately on any change rather than requiring a manual submit.
        form: { submitOnChange: true, closeOnSubmit: false }
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
     * Prepare data for the templates to use
     * @param options
     */
    override async _prepareContext(...args: Parameters<ActiveEffectConfig['_prepareContext']>) {
        const data = await super._prepareContext(...args);

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

        data.systemFields = this.document.system.schema.fields;
        data.system = this.document.system;

        return data;
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

        // disable and set tooltips on the priority inputs since we don't currently support changing it
        for (let i = 0; i < this.document.system.changes.length; i++) {
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
        const { targets } = this._currentEffectFormData();
        // schema fills id + empty conditions
        targets.push({ applyTo: 'actor' });
        await this.document.update({ system: { targets } });
    }

    static async #onRemoveTarget(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const index = Number(target.dataset.targetIndex ?? -1);
        if (index < 0) return;

        // Always keep at least one target so changes have a destination.
        const { targets, changes } = this._currentEffectFormData();
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

        await this.document.update({ system: { targets, changes } });
    }

    static async #onAddCondition(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const targetIndex = Number(target.dataset.targetIndex ?? -1);
        const { targets } = this._currentEffectFormData();
        if (!targets[targetIndex]) return;
        targets[targetIndex].conditions = [...(targets[targetIndex].conditions ?? []), {}];
        await this.document.update({ system: { targets } });
    }

    static async #onRemoveCondition(this: SR5ActiveEffectConfig, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const targetIndex = Number(target.dataset.targetIndex ?? -1);
        const conditionIndex = Number(target.dataset.conditionIndex ?? -1);
        const { targets } = this._currentEffectFormData();
        if (!targets[targetIndex]?.conditions?.[conditionIndex]) return;
        targets[targetIndex].conditions.splice(conditionIndex, 1);
        await this.document.update({ system: { targets } });
    }

    static async #onAddChange(this: SR5ActiveEffectConfig, event: PointerEvent, _target: HTMLElement) {
        event.preventDefault();
        const { targets, changes } = this._currentEffectFormData();
        const firstTarget = targets[0]?.id ?? '';
        changes.push({ key: '', value: '', target: firstTarget });
        await this.document.update({ system: { changes } });
    }

    /**
     * Extract current targets and changes from the live form.
     *
     * Foundry expands indexed field names into numeric-keyed objects. Normalize those objects
     * into arrays before structural edits so submit validation can clean each schema element.
     */
    private _currentEffectFormData(): { targets: any[], changes: any[] } {
        const form = this.form;
        if (!form) throw new Error('Cannot read Active Effect data before its form is rendered.');

        const formData = new foundry.applications.ux.FormDataExtended(form);
        const submitData = this._processFormData(null, form, formData) as {
            system?: { targets?: unknown, changes?: unknown }
        };
        const targets = this._normalizeIndexedArray(submitData.system?.targets);

        for (const target of targets) {
            target.conditions = this._normalizeIndexedArray(target.conditions);
        }

        return {
            targets,
            changes: this._normalizeIndexedArray(submitData.system?.changes),
        };
    }

    private _normalizeIndexedArray<T = Record<string, any>>(value: unknown): T[] {
        if (Array.isArray(value)) return value as T[];
        if (typeof value === 'object' && value !== null) {
            return Object.values(value as Record<string, T>);
        }
        return [];
    }

    private async _onConditionTypeChange(event: Event, select: HTMLSelectElement) {
        event.stopPropagation();

        const match = /^system\.targets\.(\d+)\.conditions\.(\d+)\.type$/.exec(select.name);
        if (!match) return;

        const { targets } = this._currentEffectFormData();
        const condition = targets[Number(match[1])]?.conditions?.[Number(match[2])];
        if (!condition) return;

        condition.type = select.value;
        condition.values = [];
        await this.document.update({ system: { targets } });
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

    prepareSelectionModeOptions() {
        return Object.entries(SR5.effectSelectionModes)
            .map(([value, label]) => ({ label: game.i18n.localize(label) as Translation, value }));
    }

    prepareFilterTypeOptions() {
        return Object.entries(SR5.effectFilterTypes)
            .map(([value, label]) => ({ label: game.i18n.localize(label) as Translation, value }));
    }

    /**
     * Options for the per-change Target dropdown: one entry per target, labelled by its
     * position and apply-to destination.
     */
    prepareChangeTargetOptions() {
        const targetLabel = game.i18n.localize('SR5.ActiveEffect.Target');
        // system.targets falls back to a single implicit 'actor' target when none are defined.
        return this.document.system.targets.map((target, index: number) => ({
            value: target.id,
            label: `${targetLabel} ${index + 1} — ${game.i18n.localize(SR5.effectApplyTo[target.applyTo] ?? target.applyTo)}`,
        }));
    }

    /**
     * Map of target id to its apply-to destination, used by the changes template to derive
     * each change row's apply-to (for autocomplete classes and column visibility).
     */
    prepareTargetApplyToById(): Record<string, string> {
        return Object.fromEntries(this.document.system.targets.map(target => [target.id, target.applyTo]));
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
     * Get the available Skills for applyTo Test options
     */
    _getSkillOptions() {
        // Make sure custom skills of an actor source are included.
        const actor = this.document.actor;
        const actorOrNothing = !(actor instanceof SR5Actor) ? undefined : actor;

        const usedSkills = this.document.system.targets
            .flatMap(t => t.conditions)
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

        // Update the priority value to match the type selection
        // Use FoundryVTT default approach of changing priority based on type changes using _onChangeForm
        if (target instanceof HTMLSelectElement && target.name.endsWith(".type")) {
            const selector = `input[name="${target.name.replace(/\.type$/, ".priority")}"]`;
            const priorityInput = target.closest("li")?.querySelector<HTMLInputElement>(selector);
            if (!priorityInput) return;
            priorityInput.value = String(ActiveEffect.CHANGE_TYPES[target.value]?.defaultPriority ?? "");
        }
    }
}
