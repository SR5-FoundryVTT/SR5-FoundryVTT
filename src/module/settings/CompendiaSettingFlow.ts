import { SYSTEM_NAME } from '@/module/constants';
import { SR5 } from '@/module/config';
import { Translation } from '@/module/utils/strings';

export type PackType = 'GeneralActionsPack' | 'MatrixActionsPack' | 'ICActionsPack';

export type PackSelectionConfig = {
    id: PackType;
    field: {
        label: Translation;
        hint: Translation;
    }
    value: string;
    choices: Record<string, any>;
}

export const CompendiaSettingFlow = {
    /**
     * Generate the required object for choosing a Compendium pack for actions/items.
     * This version robustly finds all available packs for choices, but keeps the
     * original logic for determining the value.
     * @param id - the FLAG to use to get the pack data, this should also be defined in SR5.packNames
     */
    getPackSettingConfiguration(id: PackType): PackSelectionConfig {
        // get the active pack name
        const packName = game.settings.get(SYSTEM_NAME, id) || SR5.packNames[id];

        // Find all other compatible item packs
        const itemPacks = game.packs.filter(p => p.metadata.type === 'Item' && p.metadata.packageType !== 'system' && p.metadata.system === SYSTEM_NAME);

        // Find the system's default pack
        const defaultPack = game.packs.find(p => p.metadata.name === SR5.packNames[id]);

        // Create an object for name/label pairs, starting empty.
        const packChoices = {};

        // If the default pack exists, add it to our choices.
        if (defaultPack) {
            packChoices[defaultPack.metadata.name] = defaultPack.metadata.label;
        } else {
            // If it doesn't exist, simply log a warning instead of stopping execution.
            console.warn(`The default compendium pack '${SR5.packNames[id]}' was not found looking for other packs.`);
        }

        // Add all the other item packs to the options.
        for (const pack of itemPacks) {
            packChoices[pack.metadata.name] = pack.metadata.label;
        }

        // If, after all checks, no packs were found, add a final warning.
        if (Object.keys(packChoices).length === 0) {
            console.warn(`Could not find any compatible compendium packs for '${id}'. The setting will be empty. Please reinstall the System.`);
        }
        
        return {
            id,
            field: {
                label: `SR5.CompendiaSettings.${id}.label`,
                hint: `SR5.CompendiaSettings.${id}.hint`,
            },
            value: packName,
            choices: packChoices,
        }
    },
}