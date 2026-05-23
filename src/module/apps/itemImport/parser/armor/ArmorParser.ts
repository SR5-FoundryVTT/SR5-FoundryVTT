import { Parser, SystemType } from '../Parser';
import { Armor } from '../../schema/ArmorSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class ArmorParser extends Parser<'armor'> {
    protected readonly parseType = 'armor';

    protected override async getItems(jsonData: Armor): Promise<Item.Source[]> {
        if (!jsonData.mods?.name) return [];

        const mods = IH.getArray(jsonData.mods.name);
        const names = mods.map(mod => mod._TEXT);
        const foundItems = await IH.findItems('Armor_Mod', names);
        const itemMap = new Map(foundItems.map(({ name_english, ...item }) => [name_english, item]));

        const result: Item.Source[] = [];
        for (const modRef of mods) {
            const item = itemMap.get(modRef._TEXT);
            if (!item) {
                console.warn(`[Armor Mod Missing]\nArmor: ${jsonData.name._TEXT}\nMod: ${modRef._TEXT}`);
                continue;
            }

            item._id = foundry.utils.randomID();
            const system = item.system as SystemType<'modification'>;
            system.technology.equipped = true;

            const rating = Number(modRef.$?.rating) || 0;
            if (rating > 0) {
                system.technology.rating = rating;
            }

            result.push(item);
        }

        return result;
    }

    protected override getSystem(jsonData: Armor) {
        const system = this.getBaseSystem();

        const armorValue = Number(jsonData.armor._TEXT) || 0;
        system.armor.base = armorValue;
        system.armor.value = armorValue;
        system.armor.accessory = jsonData.armor._TEXT.includes('+');
        system.capacity.total = Number(jsonData.armorcapacity._TEXT) || 0;

        if (jsonData.name._TEXT.includes("Hardened")) {
            system.armor.is_hardened = true;
        }

        return system;
    }

    protected override async getFolder(jsonData: Armor, compendiumKey: CompendiumKey): Promise<Folder> {
        const rootFolder = game.i18n.localize('TYPES.Item.armor');
        const category = IH.getTranslatedCategory("armor", jsonData.category._TEXT);

        return IH.getFolder(compendiumKey, rootFolder, category);
    }
}
