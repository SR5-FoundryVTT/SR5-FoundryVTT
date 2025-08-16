import { SR5Actor } from '../actor/SR5Actor';
import { SR5 } from '../config';
import { ActionFlow } from '../item/flows/ActionFlow';
import { Translation } from '../utils/strings';
import { TagifyTags, TagifyValues } from '@/module/utils/sheets';

import ActiveEffectConfig = foundry.applications.sheets.ActiveEffectConfig;
import { ActiveEffectDM } from '@/module/types/effect/ActiveEffect';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

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

type ApplyToOptions = { label: string, value: string }[];

/**
 * Data Object that gets provided to the templates for ActiveEffects
 */
type SR5ActiveEffectSheetData = ActiveEffectConfig.RenderContext & {
    selection_test_options: TagifyValues;
    selection_category_options: TagifyValues;
    selection_attribute_options: TagifyValues;
    selection_skill_options: TagifyValues;
    selection_limit_options: TagifyValues;

    applyToOptions: ApplyToOptions;
    isv11: boolean;
    system: ActiveEffectDM;
    systemFields: typeof ActiveEffectDM.schema.fields;
}

export class SR5ActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig<SR5ActiveEffectSheetData> {

    static override DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            // override the onAdd so we can change the default mode to custom
            addChange: this.#onAddChange,
        },
        classes: ["active-effect-config", SR5_APPV2_CSS_CLASS],
        position: { width: 580 },
    }

    static override TABS = {
        ...super.TABS,
        sheet: {
            ...super.TABS.sheet,
            tabs: [
                ...super.TABS.sheet.tabs,
                { id: 'applyTo', group: 'sheet', cssClass: '', label: 'SR5.ActiveEffect.ApplyTo', icon: 'fas fa-filter' },
                { id: 'help', group: 'sheet', cssClass: '', label: 'SR5.Help', icon: 'fas fa-book' },
            ],
            initial: 'details',
        }
    }

    /**
     * Do any final preparations when rendering the sheet
     * @param context
     * @param options
     */
    protected override async _renderHTML(context, options) {
        // push footer to the end of parts os it is rendered at the bottom
        if (options.parts.includes("footer")) {
            const index = options.parts.indexOf("footer");
            options.parts.push(options.parts.splice(index, 1)[0]);
        }
        return await super._renderHTML(context, options);
    }

    /**
     * Override preparingParts to prepare our own custom modes
     * @param partId
     * @param context
     * @param options
     */
    override async _preparePartContext(partId, context, options) {
       const data = await super._preparePartContext(partId, context, options) as any;

       // if the part is the "changes" tab, override the modes to use "Modify" instead of "Custom"
       if (partId === 'changes') {
           data.modes = this.applyModifyLabelToCustomMode(data.modes);
       }

       return data;
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
        help: {template: 'systems/shadowrun5e/dist/templates/effect/active-effect-help.hbs'},
    }

    /**
     * Prepare data for the templates to use
     * @param options
     */
    override async _prepareContext(options) {
        const data = await super._prepareContext(options);

        // create the lists of options for each selection
        data.selection_test_options = this._getTestOptions();
        data.selection_category_options = this._getCategoryOptions();
        data.selection_attribute_options = this._getAttributeOptions();
        data.selection_skill_options = this._getSkillOptions();
        data.selection_limit_options = this._getLimitOptions();

        data.applyToOptions = this.prepareApplyToOptions();
        data.isv11 = game.release.generation === 11;

        data.systemFields = this.document.system.schema.fields;
        data.system = this.document.system;

        return data;
    }

    /**
     * Called just before the window itself renders
     * - add event listeners as needed
     * - access "html" via $(this.element) to use JQuery stuff
     * @param context
     * @param options
     */
    override async _onRender(context, options) {
        const applyToSelect = this.element.querySelector<HTMLSelectElement>('select[name="system.applyTo"]')
        if (applyToSelect) {
            applyToSelect.addEventListener('change', async (event) => {
                await this.onApplyToChange(event, applyToSelect);
            });
            // if we have changes, add a tooltip to the select to indicate it as disabled
            if (this.hasChanges) {
                applyToSelect.setAttribute('data-tooltip', game.i18n.localize("SR5.Tooltips.Effect.AlterApplyToWithChanges"));
                applyToSelect.setAttribute('disabled', 'true');
            }
        } else {
            console.error("Shadowrun5e | Could not find the 'applyTo' select.");
        }
    }

    /**
     * Handle anything needed after the sheet has been rendered
     * - register tagify inputs
     * @param context
     * @param options
     */
    override async _postRender(context, options) {
        await super._postRender(context, options);
        // once we render, process the Tagify Elements to we rendered
        Hooks.call('sr5_processTagifyElements', this.element);
    }

    /**
     * Handle adding a new change to the changes array.
     *
     * This overrides the Foundry default behavior of using ADD as default.
     * Shadowrun mostly uses MODIFY, so we use that as default.
     *
     * - this here is the SR5ActiveEffectConfig, however not all the types work correctly so I used any
     */
    static async #onAddChange(this: any, event: PointerEvent, target: HTMLElement) {
        if (this.form) {
            const submitData = this._processFormData(null, this.form, new FormDataExtended(this.form));
            const changes = Object.values(submitData.changes ?? {});
            changes.push({ mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM });
            return this.submit({updateData: {changes}});
        }
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
     * Foundry provides a custom mode for systems to implement behavior with.
     * 
     * Shadowrun uses this mode to implement 'modify' mode, with complex behavior.
     * To give users better information about the mode, inject a 'modify' label.
     * 
     * @param modes A object prepared for display using Foundry select handlebarjs helper.
     * @returns Copy of the original modes and labels.
     */
    applyModifyLabelToCustomMode(modes: Record<number, string>): Record<number, string> {
        return { ...modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify') };
    }

    /**
     * Depending on this effects source document being actor or item, some effect apply to
     * should not be available.
     */
    prepareApplyToOptions(): {label: string, value: string}[] {
        const effectApplyTo = foundry.utils.deepClone(SR5.effectApplyTo) as Record<string, string>;

        // Actors can't use effects that only apply to tests from items.
        if (this.document.parent instanceof SR5Actor) {
            delete effectApplyTo.test_item;
        }

        // data model types expect an array of value/label objects
        return Object.entries(effectApplyTo).map(([value, label]) => {
            return {
                label: game.i18n.localize(label),
                value,
            }
        });
    }

    /**
     * Determine if the effect has changes applied already.
     * 
     * This should be used to prohibit changing of applyTo selections.
     * @returns true if changes are present, false otherwise.
     */
    get hasChanges(): boolean {
        return this.document.changes.length > 0;
    }


    /**
     * Get the available Test types for applyTo Test options
     */
    _getTestOptions() {
        // Tagify expects this format for localized tags.
        // FIXME TS 'test' comes out as 'unknown' so we need to cast it to any here
        return Object.values(game.shadowrun5e.tests).map(((test: any) => ({
            label: test.label, id: test.name
        })));
    }

    /**
     * Get the available Action Categories for applyTo Test options
     */
    _getCategoryOptions() {
        // Tagify expects this format for localized tags.
        return Object.entries(SR5.actionCategories).map(([category, label]) => ({ label, id: category }));
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
        const selectedSkillNames = selected.map(({id}) => id);
        const skills = ActionFlow.sortedActiveSkills(actorOrNothing, selectedSkillNames);
        return Object.entries(skills).map(([id, label]) => ({ label: label as Translation, id }));
    }

    /**
     * Get the available Attributes for applyTo Test options
     */
    _getAttributeOptions() {
        return Object.entries(SR5.attributes).map(([attribute, label]) => ({ label, id: attribute }));
    }

    /**
     * Get the available Limits for applyTo Test options
     */
    _getLimitOptions() {
        return Object.entries(SR5.limits).map(([limit, label]) => ({ label, id: limit }));
    }
}
