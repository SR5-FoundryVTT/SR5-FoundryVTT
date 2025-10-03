import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class ArmorParser extends Parser<'armor'> {
    protected readonly parseType = 'armor';
    protected readonly compKey = 'Armor';

    protected parseItem(item: BlankItem<'armor'>, itemData: ExtractItemType<'armors', 'armor'>) {
        const system = item.system;
        const armor = system.armor;

        armor.mod = itemData.armor.includes('+');
        armor.value = parseInt(itemData.armor);

        if (itemData.armormods?.armormod) {
            armor.fire = 0;
            armor.electricity = 0;
            armor.cold = 0;
            armor.acid = 0;
            armor.radiation = 0;

            const mods = IH.getArray(itemData.armormods.armormod);
            for (const mod of mods) {
                const name = mod.name_english.toLowerCase();

                if (name.includes('fire resistance'))
                    armor.fire += parseInt(mod.rating);
                else if (name.includes('nonconductivity'))
                    armor.electricity += parseInt(mod.rating);
                else if (name.includes('insulation'))
                    armor.cold += parseInt(mod.rating);
                else if (name.includes('radiation shielding'))
                    armor.radiation += parseInt(mod.rating);
            }
        }

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(itemData.category_english));
    }
}
