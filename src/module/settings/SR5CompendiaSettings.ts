import { SR5 } from "../config";
import { FLAGS, SYSTEM_NAME } from "../constants";

const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

/**
 * Render a list of selects for different use case compendia, allowing users to select which compendia they want to use
 * for each use case.
 */
export default class SR5CompendiaSettings extends HandlebarsApplicationMixin(ApplicationV2<any>) {
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
            handler: SR5CompendiaSettings.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false,
        }
    }

    override get title() {
        return game.i18n.localize('SR5.CompendiaSettings.Title');
    }

    static override PARTS = {
        form: {
            template: `systems/shadowrun5e/dist/templates/apps/settings/compendia-settings.hbs`,
        }
    }

    override async _prepareContext(options) {
        const context = await super._prepareContext(options);
        // Provide user with list of all compendium packs to be set for system packs.
        const generalActionsPackName = game.settings.get(SYSTEM_NAME, FLAGS.GeneralActionsPack) || SR5.packNames.generalActions;
        const matrixActionsPackName = game.settings.get(SYSTEM_NAME, FLAGS.MatrixActionsPack) || SR5.packNames.matrixActions;
        const generalActionPack = game.packs.find(p => p.metadata.name === SR5.packNames.generalActions);
        const matrixActionPack = game.packs.find(p => p.metadata.name === SR5.packNames.matrixActions);

        if (!generalActionPack || !matrixActionPack) {
            console.error(`SR5CompendiaSettings: Could not find all systsem default compendium packs. Please reinstall the system.`);
            return {};
        }
        
        // Collect packs for the system.
        const worldItemPacks = game.packs.filter(p => p.metadata.type === 'Item' && p.metadata.packageType === 'world' && p.metadata.system === SYSTEM_NAME);
        const generalActionsPackChoices = {
            // TODO: taMiF/marks use compendium label these packs as well?
            [SR5.packNames.generalActions]: generalActionPack.metadata.label,
        };
        const matrixActionsPackChoices = {
            [SR5.packNames.matrixActions]: matrixActionPack.metadata.label,
        };

        // Transform packs into selectOption choices for localization.
        for (const pack of worldItemPacks) {
            generalActionsPackChoices[pack.metadata.name] = pack.metadata.label;
            matrixActionsPackChoices[pack.metadata.name] = pack.metadata.label;
        }

        context.packs = {
            general: {
                id: FLAGS.GeneralActionsPack,
                field: {
                    label: 'SR5.CompendiaSettings.GeneralActions.label',
                    hint: 'SR5.CompendiaSettings.GeneralActions.hint',
                },
                value: generalActionsPackName,
                choices: generalActionsPackChoices,
            },
            matrix: {
                id: FLAGS.MatrixActionsPack,
                field: {
                    label: 'SR5.CompendiaSettings.MatrixActions.label',
                    hint: 'SR5.CompendiaSettings.MatrixActions.hint',
                },
                value: matrixActionsPackName,
                choices: matrixActionsPackChoices,
            },
        }

        return context;
    }

    static async #onSubmit(this: SR5CompendiaSettings, event, form, formData) {
        console.log('params', this, event, form, formData);
        const expanded = foundry.utils.expandObject(formData.object);
        console.log('expanded', expanded);
        // TODO read in id and value to update flags
        for (const [id, value] of Object.entries(expanded)) {
            await game.settings.set(SYSTEM_NAME, id as any, value);
        }
    }
}
