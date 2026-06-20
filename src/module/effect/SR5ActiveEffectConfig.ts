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

    applyToOptions: { label: Translation, value: string }[];
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
 * The ActiveEffectConfig differs from other sheets in updating / submitting behavior due to changes needing a
 * multi step configuration process. If a change is partially configured it might break the underlying data structure 
 * and sheet rendering. To prevent this, the config sheet is rendered with a manually triggered 'submit' button.
 * 
 * The Shadowrun5e system uses ActiveEffects for more than only altering actor data.
 * Besides the default 'actor' apply-to type others are also supported, with all changes of an effect applying to that target only.
 * 
 * Some apply-to types follow the default key-value change structure of altering data, while others (modifiers) allow defining 
 * custom handlers to apply complex behaviors to targets.
 * 
 * Each apply-to target defines what effects are applicable to it and how changes are to be applied. These differing behaviors
 * are defined in <>EffectsFlow.ts or <>ChangeFlow.ts and follow the Foundry interface of 'apply' and 'allApplicableEffects' methods.
 * 
 * While actors apply effects as part of their prepareData flow the modifier apply-to target applies effects as part of the calculation of their
 * situational modifiers and others still can behave differently.
 */
export class SR5ActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig<SR5ActiveEffectSheetData> {
    private static readonly HELP_PAGE_URL = 'http://sr5-foundryvtt.privateworks.com/index.php/Active_Effect';

    static override DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            openHelp: this.#onOpenHelp,
        },
        classes: ["active-effect-config", SR5_APPV2_CSS_CLASS, 'named-sheet'],
        position: { width: 760 },
        window: {
            resizable: true
        }
    }

    static override TABS = {
        ...super.TABS,
        sheet: {
            ...super.TABS.sheet,
            tabs: [
                ...super.TABS.sheet.tabs.slice(0, 2),
                { id: 'applyTo', group: 'sheet', cssClass: '', label: 'SR5.ActiveEffect.ApplyTo', icon: 'fas fa-filter' },
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
        applyTo: {template: 'systems/shadowrun5e/dist/templates/effect/active-effect-apply-to.hbs'},
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

        data.applyToOptions = this.prepareApplyToOptions();
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

        const applyToSelect = this.element.querySelector<HTMLSelectElement>('select[name="system.applyTo"]')
        if (applyToSelect) {
            applyToSelect.addEventListener('change', (event) => { void this.onApplyToChange(event, applyToSelect); });
            // if we have changes, add a tooltip to the select to indicate it as disabled
            if (this.hasChanges) {
                applyToSelect.setAttribute('data-tooltip', game.i18n.localize("SR5.Tooltips.Effect.AlterApplyToWithChanges"));
                applyToSelect.setAttribute('disabled', 'true');
            }
        } else {
            console.error("Shadowrun5e | Could not find the 'applyTo' select.");
        }

        // disable and set tooltips on the priority inputs since we don't currently support changing it
        for (let i = 0; i < this.document.system.changes.length; i++) {
            const input = this.element.querySelector<HTMLInputElement>(`input[name="system.changes.${i}.priority"]`);
            if (input) {
                input.removeAttribute('disabled');
                input.setAttribute('data-tooltip', 'SR5.Tooltips.Effect.PriorityFieldDisabled');
            } else {
                console.error(`Shadowrun5e | Could not find the 'priority' input field for ${i}.`);
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

    /**
     * Assure both no changes are present before changing the applyTo type
     * and re-render the sheet to refresh prepared change value options.
     * 
     * This is to avoid configured changes breaking when changing to other applyTo types
     * that do not support the same change keys.
     */
    async onApplyToChange(event: Event, target: HTMLElement) {
        const select = event.currentTarget as HTMLSelectElement;

        if (this.document.system.applyTo === select.value) return;

        if (this.document.changes.length) {
            ui.notifications?.error('You must delete changes before changing the apply-to type.');
        } else {
            // Make sure applyTo is saved but also save all other form data on sheet.
            const updateData = { 'system.applyTo': select.value };
            await this.submit({ updateData, preventClose: true })
        }
    }

    /**
     * Prepare possible choice types. This is necessary as we override most effect templates and can't use
     * default FoundryVTT effect code.
     * NOTE: This is taken from FoundryVTT v14 preparePartsContext 'changes'
     */
    prepareChangeTypes() {
        // @ts-ignore TODO: fvtt- v14 - types missing
        return Object.entries(SR5ActiveEffect.CHANGE_TYPES as unknown as any)
            // TODO: fvtt - v14 - Remove subtract type until typings to cleanly change ModifiableValue implemenation to use type instead of mode
            .filter(([type]) => type !== 'subtract')
            .map(([type, { label }]) => ({ type, label: game.i18n.localize(label) }))
            .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang))
            .reduce((types, { type, label }) => {
                types[type] = label;
                return types;
            }, {});

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
     * Determine if the effect has changes applied already.
     * 
     * This should be used to prohibit changing of applyTo selections.
     * @returns true if changes are present, false otherwise.
     */
    get hasChanges(): boolean {
        return this.document.system.changes.length > 0;
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

        // Use ActionFlow to assure either custom skills or global skills to be included.
        const selected = this.document.system.selection_skills;
        return ActionFlow.sortedActiveSkills(actorOrNothing, selected);
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

        // Update the priority value to match the type selection
        // Use FoundryVTT default approach of changing priority based on type changes using _onChangeForm
        // @ts-expect-error TODO: fvtt - v14 - missing type foundry.utils.isElementInstanceOf
        if (foundry.utils.isElementInstanceOf(event.target, "select") && event.target.name.endsWith(".type")) {
            const typeSelect = event.target as HTMLSelectElement;
            const selector = `input[name="${typeSelect.name.replace(/\.type$/, ".priority")}"]`;
            const priorityInput = typeSelect.closest("li")!.querySelector(selector);
            // @ts-expect-error TODO: fvtt - v14 - missing type ActiveEffect.CHANGE_TYPES
            priorityInput.value = ActiveEffect.CHANGE_TYPES[typeSelect.value]?.defaultPriority ?? "";
        }
      }
}
