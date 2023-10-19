import { getArray } from "./BaseParserFunctions.js"
import { GearsParser } from "./gearImport/GearsParser"
import { ArmorParser } from "./ArmorParser";
import { WareParser } from "./WareParser";
import { QualityParser } from "./QualityParser";
import { PowerParser } from "./PowerParser";
import { SpellParser } from "./magicImport/SpellParser";
import { WeaponParser } from "./WeaponParser";
import { LifestyleParser } from "./LifestyleParser";
import { ContactParser } from "./ContactParser";

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

        if (importOptions.qualities && chummerChar.qualities && chummerChar.qualities.quality) {
            promises.push(new QualityParser().parseQualities(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.weapons && chummerChar.weapons != null && chummerChar.weapons.weapon != null) {
            promises.push(new WeaponParser().parseWeapons(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.armor && chummerChar.armors && chummerChar.armors.armor) {
            promises.push(new ArmorParser().parseArmors(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.cyberware && chummerChar.cyberwares && chummerChar.cyberwares.cyberware) {
            promises.push(new WareParser().parseWares(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.powers && chummerChar.powers && chummerChar.powers.power) {
            promises.push(new PowerParser().parsePowers(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.equipment && chummerChar.gears && chummerChar.gears.gear) {
            const gears = getArray(chummerChar.gears.gear);
            promises.push(new GearsParser().parseGears(gears, importOptions.assignIcons));
        }

        if (importOptions.spells && chummerChar.spells && chummerChar.spells.spell) {
            promises.push(new SpellParser().parseSpells(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.contacts && chummerChar.contacts && chummerChar.contacts.contact) {
            promises.push(new ContactParser().parseContacts(chummerChar, importOptions.assignIcons));
        }

        if (importOptions.lifestyles && chummerChar.lifestyles && chummerChar.lifestyles.lifestyle) {
            promises.push( new LifestyleParser().parseLifestyles(chummerChar, importOptions.assignIcons));
        }

        return  (await Promise.all(promises)).flat();
    }
}
