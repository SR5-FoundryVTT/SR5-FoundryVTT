import { SYSTEM_NAME } from '@/module/constants';
import { SR5 } from '@/module/config';
import { Translation } from '@/module/utils/strings';

export type PackType = 'GeneralActionsPack' | 'MatrixActionsPack' | 'ICActionsPack' | 'SkillsPack' | 'SkillGroupsPack' | 'SkillSetsPack';

export type PackSelectionConfig = {
    id: PackType;
    field: {
        label: Translation;
        hint: Translation;
    }
    value: string;
    choices: Record<string, string>;
}

export type PackSeparator = {
    separator: true;
    label: Translation;
}

export type PackConfigOrSeparator = PackSelectionConfig | PackSeparator;

export const CompendiaSettingFlow = {
    /**
     * Generate the required object for choosing a Compendium pack for actions/items.
     * This version robustly finds all available packs for choices, but keeps the
     * original logic for determining the value.
     * Even if the system pack is not found, which can happen on multi foundry instances running at the same time, 
     * we still provide a selection of otherwise available packs.
     *
     * @param id - the FLAG to use to get the pack data, this should also be defined in SR5.packNames
     */
    getPackSettingConfiguration(id: PackType): PackSelectionConfig {
        // get the active pack name
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const packName = (game.settings.get(SYSTEM_NAME, id) as string) || SR5.packNames[id];

        // Find all other compatible item packs
        const itemPacks = game.packs.filter(p => p.metadata.type === 'Item' && p.metadata.packageType !== 'system' && p.metadata.system === SYSTEM_NAME);

        // Find the system's default pack
        const defaultPack = game.packs.find(p => p.metadata.name === SR5.packNames[id]);

        // Create an object for name/label pairs, starting empty.
        const packChoices: Record<string, string> = {};

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
                label: `SR5.CompendiaSettings.${id}.label` as Translation,
                hint: `SR5.CompendiaSettings.${id}.hint` as Translation,
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: packName,
            choices: packChoices,
        }
    },
}