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
     * Generate the required object for choosing a Compendium pack for actions/items
     * @param id - the FLAG to use to get the pack data, this should also be defined in SR5.packNames
     */
    getPackSettingConfiguration(id: PackType): PackSelectionConfig {
        // get the active pack name
        const packName = game.settings.get(SYSTEM_NAME, id) || SR5.packNames[id];
        const itemPacks = game.packs.filter(p => p.metadata.type === 'Item' && p.metadata.packageType !== 'system' && p.metadata.system === SYSTEM_NAME);
        // get the default pack the system ships with
        const defaultPack = game.packs.find(p => p.metadata.name === SR5.packNames[id]);
        // if we can't find the default pack, error and send a basic data without any choices
        if (!defaultPack) {
            console.error(`SR5CompendiaSettings: Could not find default compendium pack ${id}. Please reinstall the system.`);
            return {
                id,
                field: {
                    label: `SR5.CompendiaSettings.${id}.label`,
                    hint: `SR5.CompendiaSettings.${id}.hint`,
                },
                value: '',
                choices: {},
            };
        }
        // create an object for name/label pairs, starting with the default pack name
        const packChoices = {
            [defaultPack.metadata.name]: defaultPack.metadata.label,
        }
        // add all the item packs to the options
        for (const pack of itemPacks) {
            packChoices[pack.metadata.name] = pack.metadata.label;
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
