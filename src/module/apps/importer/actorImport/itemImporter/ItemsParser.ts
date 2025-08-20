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
        const promises: Promise<any>[] = [];
        Object.freeze(chummerChar);

        if (importOptions.qualities)
            promises.push(new QualityParser().parseItems(chummerChar.qualities?.quality, importOptions.assignIcons));

        if (importOptions.weapons)
            promises.push(new WeaponParser().parseWeapons(chummerChar, importOptions.assignIcons));

        if (importOptions.armor) {
            promises.push(new ArmorParser().parseItems(chummerChar.armors?.armor, importOptions.assignIcons));
            const otherArmors = IH.getArray(chummerChar.otherarmors?.otherarmor).map(armor => ({
                ...armor,
                name: armor.objectname,
                name_english: armor.objectname_english,
                source: armor.sourcename,
            }));
            promises.push(new OtherArmorParser().parseItems(otherArmors, importOptions.assignIcons));
        }

        if (importOptions.cyberware) {
            const biowares = IH.getArray(chummerChar.cyberwares?.cyberware).filter(c => c.improvementsource === "Bioware");
            const cyberwares = IH.getArray(chummerChar.cyberwares?.cyberware).filter(c => c.improvementsource !== "Bioware");
            promises.push(new WareParser('bioware').parseItems(biowares, importOptions.assignIcons));
            promises.push(new WareParser('cyberware').parseItems(cyberwares, importOptions.assignIcons));
        }

        if (importOptions.powers)
            promises.push(new PowerParser().parseItems(chummerChar.powers?.power, importOptions.assignIcons))

        if (importOptions.spells && chummerChar.spells?.spell) {
            const rituals = IH.getArray(chummerChar.spells.spell).filter(s => s.category_english === "Rituals" && s.alchemy !== 'True');
            const spells = IH.getArray(chummerChar.spells.spell).filter(s => s.category_english !== "Rituals" && s.alchemy !== 'True');
            promises.push(new SpellParser().parseItems(spells, importOptions.assignIcons));
            promises.push(new RitualParser().parseItems(rituals, importOptions.assignIcons));
        }

        if (importOptions.contacts)
            promises.push(new ContactParser().parseItems(chummerChar.contacts?.contact, importOptions.assignIcons));

        if (importOptions.lifestyles)
            promises.push(new LifestyleParser().parseItems(chummerChar.lifestyles?.lifestyle, importOptions.assignIcons));

        if (importOptions.metamagics) {
            const metamagics = IH.getArray(chummerChar.metamagics?.metamagic).filter(meta => meta.improvementsource === "Metamagic");
            const echoes = IH.getArray(chummerChar.metamagics?.metamagic).filter(meta => meta.improvementsource === "Echo");
            promises.push(new SimpleParser("metamagic").parseItems(metamagics, importOptions.assignIcons));
            promises.push(new SimpleParser("echo", "Spell").parseItems(echoes, importOptions.assignIcons));
        }

        if (importOptions.powers)
            promises.push(new CritterPowerParser().parseItems(chummerChar.critterpowers?.critterpower, importOptions.assignIcons));

        if (importOptions.equipment)
            promises.push(new GearsParser().parseItems(chummerChar.gears?.gear, importOptions.assignIcons));

        return (await Promise.all(promises)).flat();
    }
}
