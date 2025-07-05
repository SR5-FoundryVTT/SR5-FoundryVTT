import { getArray } from "./importHelper/BaseParserFunctions.js"
import { GearsParser } from "./importHelper/GearsParser.js"
import { ArmorParser } from "./armorImport/ArmorParser.js";
import { WareParser } from "./wareImport/WareParser.js";
import { QualityParser } from "./bioImport/QualityParser.js";
import { PowerParser } from "./magicImport/PowerParser.js";
import { SpellParser } from "./magicImport/SpellParser.js";
import { WeaponParser } from "./weaponImport/WeaponParser.js";
import { LifestyleParser } from "./bioImport/LifestyleParser.js";
import { ContactParser } from "./bioImport/ContactParser.js";
import SimpleParser from "./importHelper/SimpleParser.js";
import { CritterPowerParser } from "./magicImport/CritterPowerParser.js";
import { RitualParser } from "./magicImport/RitualParser.js";
import { ActorSchema } from "../ActorSchema.js";

import { ImportHelper as IH } from "src/module/apps/itemImport/helper/ImportHelper.js";
import { importOptionsType } from "../characterImporter/CharacterImporter.js";

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

        if (importOptions.qualities && chummerChar.qualities?.quality) {
            promises.push(new QualityParser().parseQualities(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.weapons && chummerChar.weapons?.weapon) {
            promises.push(new WeaponParser().parseWeapons(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.armor && (chummerChar.armors?.armor || chummerChar.otherarmors?.otherarmor)) {
            promises.push(new ArmorParser().parseArmors(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.cyberware && chummerChar.cyberwares?.cyberware) {
            promises.push(new WareParser().parseWares(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.powers && chummerChar.powers?.power) {
            promises.push(new PowerParser().parsePowers(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.equipment && chummerChar.gears?.gear) {
            const gears = getArray(chummerChar.gears.gear);
            promises.push(new GearsParser().parseGears(gears, importOptions.assignIcons));
        }

        if (importOptions.spells && chummerChar.spells?.spell) {
            promises.push(new SpellParser().parseSpells(chummerChar, importOptions.assignIcons));
            promises.push(new RitualParser().parseRituals(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.contacts && chummerChar.contacts?.contact) {
            promises.push(new ContactParser().parseContacts(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.lifestyles && chummerChar.lifestyles?.lifestyle) {
            promises.push( new LifestyleParser().parseLifestyles(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.metamagics && chummerChar.metamagics?.metamagic) {
            const metamagics = getArray(chummerChar.metamagics.metamagic).filter(meta => meta.improvementsource.toLowerCase().includes("metamagic"))
            promises.push(new SimpleParser().parseCollection(metamagics, "metamagic", importOptions.assignIcons));
        }

        if (importOptions.metamagics && chummerChar.metamagics?.metamagic) {
            const echoes = getArray(chummerChar.metamagics.metamagic).filter(meta => meta.improvementsource.toLowerCase().includes("echo"))
            promises.push(new SimpleParser().parseCollection(echoes, "echo", importOptions.assignIcons));
        }

        promises.push(new CritterPowerParser().parseCritterPowers(chummerChar, importOptions.assignIcons))

        return (await Promise.all(promises)).flat();
    }
}
