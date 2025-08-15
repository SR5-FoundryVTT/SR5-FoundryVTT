import { SYSTEM_NAME } from "../constants";
import { PackSelectionConfig } from '@/module/settings/CompendiaSettingFlow';

const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

/**
 * Render a list of selects for different use case compendia, allowing users to select which compendia they want to use
 * for each use case.
 */
export default abstract class AbstractCompendiaSettings extends HandlebarsApplicationMixin(ApplicationV2<any>) {
    static override DEFAULT_OPTIONS = {
        id: 'sr5-compendia-settings',
        tag: 'form',
        position: {
            width: 400,
            height: 'auto' as const,
        },
        window: {
            contentClasses: ['standard-form'],
            title: 'SR5.CompendiaSettings.Title',
        },
        form: {
            // we utilize a button for submission so we want to close on submit
            handler: this.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: true,
        }
    }

    /**
     * Return an array filled with the pack options to use for each compendium
     */
    abstract getPacks(): PackSelectionConfig[];

    override get title() {
        return game.i18n.localize('SR5.CompendiaSettings.Title');
    }

    static override PARTS = {
        form: {
            template: `systems/shadowrun5e/dist/templates/apps/settings/compendia-settings.hbs`,
        },
        footer: {
            template: 'templates/generic/form-footer.hbs',
        }
    }

    /**
     * Prepare the Context Data for the compendia settings sheet
     * @param options
     */
    override async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.packs = this.getPacks();
        // add a submit button at the footer
        context.buttons = [
            { type: 'submit', icon: 'fa-solid fa-save', label: 'SETTINGS.Save' }
        ]
        return context;
    }

    /**
     * Handle submission of data for compendia settings
     * @param event
     * @param form
     * @param formData
     * @private
     */
    static async #onSubmit(this: AbstractCompendiaSettings, event, form, formData) {
        const validIds = Object.values(this.getPacks()).map(({ id }) => id);
        // process the formData, update the flags
        const expanded = foundry.utils.expandObject(formData.object);
        // id is expected to be the "name" of the field
        // value is expected to be the selected value
        for (const [id, value] of Object.entries(expanded)) {
            if (validIds.includes(id as any)) {
                await game.settings.set(SYSTEM_NAME, id as any, value);
            }
        }
    }
}
