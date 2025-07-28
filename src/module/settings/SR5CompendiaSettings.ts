import { SR5 } from "../config";
import { FLAGS, SYSTEM_NAME } from "../constants";

/**
 * Render a list of selects for different use case compendia, allowing users to select which compendia they want to use
 * for each use case.
 */
export default class SR5CompendiaSettings extends foundry.appv1.api.FormApplication {
    static override get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'sr5-compendia-settings',
            title: game.i18n.localize('SR5.CompendiaSettings.Title'),
            template: `systems/shadowrun5e/dist/templates/apps/settings/compendia-settings.hbs`,
            classes: [],
            width: 400,
            height: 'auto',
            closeOnSubmit: true,
        });
    }

    override async getData(options) {
        // Provide user with list of all compendium packs to be set for system packs.
        const generalActionsPackName = game.settings.get(SYSTEM_NAME, FLAGS.GeneralActionsPack);
        const matrixActionsPackName = game.settings.get(SYSTEM_NAME, FLAGS.MatrixActionsPack);
        const generalActionPack = game.packs.find(p => p.metadata.name === SR5.packNames.generalActions);
        const matrixActionPack = game.packs.find(p => p.metadata.name === SR5.packNames.matrixActions);

        if (!generalActionPack || !matrixActionPack) {
            console.error(`SR5CompendiaSettings: Could not find all systsem default compendium packs. Please reinstall the system.`);
            return;
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

        return {
            generalActionsPackName,
            matrixActionsPackName,
            generalActionsPackChoices,
            matrixActionsPackChoices
        };
    }

    async _updateObject(event, formData) {
        // Directly store selection in settings.
        await game.settings.set(SYSTEM_NAME, FLAGS.GeneralActionsPack, formData.generalActionsPack);
        await game.settings.set(SYSTEM_NAME, FLAGS.MatrixActionsPack, formData.matrixActionsPack);
    }
}
