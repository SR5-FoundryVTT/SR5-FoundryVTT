import { importOptionsType } from "../characterImporter/CharacterImporter";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";

import { ArmorParser } from "./armorImport/ArmorParser";
import { WareParser } from "./wareImport/WareParser";
import { QualityParser } from "./bioImport/QualityParser";
import { PowerParser } from "./magicImport/PowerParser";
import { SpellParser } from "./magicImport/SpellParser";
import { WeaponParser } from "./weaponImport/WeaponParser";
import { LifestyleParser } from "./bioImport/LifestyleParser";
import { ContactParser } from "./bioImport/ContactParser";
import { SimpleParser } from "./importHelper/SimpleParser";
import { CritterPowerParser } from "./magicImport/CritterPowerParser";
import { RitualParser } from "./magicImport/RitualParser";
import { ActorSchema } from "../ActorSchema";
import { OtherArmorParser } from "./armorImport/OtherArmorParser";
import { GearsParser } from "./importHelper/GearsParser";

export type Unwrap<T> = T extends Array<infer U> ? U : T;

/**
 * Parses all items (qualities, weapons, gear, ...) from a chummer character.
 */
export class ItemsParser {

    /**
     * Parses all items from a chummer char and returns an array of the corresponding foundry items.
     * @param {*} chummerChar The chummer char holding the items
     * @param {*} importOptions Additional import option that specify what items will be imported.
     */
    async parse(chummerChar: ActorSchema, importOptions: importOptionsType) {
        const items: Item.CreateData[] = [];
        Object.freeze(chummerChar);

        if (importOptions.qualities)
            items.push(...await new QualityParser().parseItems(chummerChar.qualities?.quality));

        if (importOptions.weapons)
            items.push(...await new WeaponParser().parseWeapons(chummerChar));

        if (importOptions.armor) {
            items.push(...await new ArmorParser().parseItems(chummerChar.armors?.armor));
            const otherArmors = IH.getArray(chummerChar.otherarmors?.otherarmor).map(armor => ({
                ...armor,
                name: armor.objectname,
                name_english: armor.objectname_english,
                source: armor.sourcename,
            }));
            items.push(...await new OtherArmorParser().parseItems(otherArmors));
        }

        if (importOptions.cyberware) {
            const biowares = IH.getArray(chummerChar.cyberwares?.cyberware).filter(c => c.improvementsource === "Bioware");
            const cyberwares = IH.getArray(chummerChar.cyberwares?.cyberware).filter(c => c.improvementsource !== "Bioware");
            items.push(...await new WareParser('bioware').parseItems(biowares));
            items.push(...await new WareParser('cyberware').parseItems(cyberwares));
        }

        if (importOptions.powers)
            items.push(...await new PowerParser().parseItems(chummerChar.powers?.power));

        if (importOptions.spells && chummerChar.spells?.spell) {
            const rituals = IH.getArray(chummerChar.spells.spell).filter(s => s.category_english === "Rituals" && s.alchemy !== 'True');
            const spells = IH.getArray(chummerChar.spells.spell).filter(s => s.category_english !== "Rituals" && s.alchemy !== 'True');
            items.push(...await new SpellParser().parseItems(spells));
            items.push(...await new RitualParser().parseItems(rituals));
        }

        if (importOptions.contacts)
            items.push(...await new ContactParser().parseItems(chummerChar.contacts?.contact));

        if (importOptions.lifestyles)
            items.push(...await new LifestyleParser().parseItems(chummerChar.lifestyles?.lifestyle));

        if (importOptions.metamagics) {
            const metamagics = IH.getArray(chummerChar.metamagics?.metamagic).filter(meta => meta.improvementsource === "Metamagic");
            const echoes = IH.getArray(chummerChar.metamagics?.metamagic).filter(meta => meta.improvementsource === "Echo");
            items.push(...await new SimpleParser("metamagic").parseItems(metamagics));
            items.push(...await new SimpleParser("echo", "Spell").parseItems(echoes));
        }

        if (importOptions.powers)
            items.push(...await new CritterPowerParser().parseItems(chummerChar.critterpowers?.critterpower));

        if (importOptions.equipment)
            items.push(...await new GearsParser().parseItems(chummerChar.gears?.gear));

        return items;
    }
}
