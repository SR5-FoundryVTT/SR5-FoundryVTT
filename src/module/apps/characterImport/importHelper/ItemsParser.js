import { getArray } from "./BaseParserFunctions.js"
import { GearsParser } from "./GearsParser.js"
import { ArmorParser } from "../armorImport/ArmorParser";
import { WareParser } from "../wareImport/WareParser.js";
import { QualityParser } from "../bioImport/QualityParser";
import { PowerParser } from "../magicImport/PowerParser";
import { SpellParser } from "../magicImport/SpellParser.js";
import { WeaponParser } from "../weaponImport/WeaponParser.js";
import { LifestyleParser } from "../bioImport/LifestyleParser";
import { ContactParser } from "../bioImport/ContactParser";
import SimpleParser from "./SimpleParser.js";
import { CritterPowerParser } from "../magicImport/CritterPowerParser.js";
import { RitualParser } from "../magicImport/RitualParser.js";

/**
 * Parses all items (qualities, weapons, gear, ...) from a chummer character.
 */
export class ItemsParser {

    /**
     * Parses all items from a chummer char and returns an array of the corresponding foundry items.
     * @param {*} chummerChar The chummer char holding the items
     * @param {*} importOptions Additional import option that specify what items will be imported.
     */
    async parse(chummerChar, importOptions) {
        const promises = [];
        Object.freeze(chummerChar)

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

        if(chummerChar.metamagics?.metamagic) {
            let metamagics = getArray(chummerChar.metamagics.metamagic).filter(meta => meta.improvementsource.toLowerCase().includes("metamagic"))
            promises.push(new SimpleParser().parseCollection(metamagics, "metamagic", importOptions.assignIcons));
        }

        if(chummerChar.metamagics?.metamagic) {
            let echoes = getArray(chummerChar.metamagics.metamagic).filter(meta => meta.improvementsource.toLowerCase().includes("echo"))
            promises.push(new SimpleParser().parseCollection(echoes, "echo", importOptions.assignIcons));
        }

        promises.push(new CritterPowerParser().parseCritterPowers(chummerChar, importOptions.assignIcons))

        return  (await Promise.all(promises)).flat();
    }
}
