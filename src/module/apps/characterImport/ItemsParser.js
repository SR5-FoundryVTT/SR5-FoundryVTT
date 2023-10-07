import { getArray } from "./BaseParserFunctions.js"
import { GearsParser } from "./gearImport/GearsParser"
import { ArmorParser } from "./ArmorParser";
import { CyberwareParser } from "./CyberwareParser";
import { QualityParser } from "./QualityParser";
import { PowerParser } from "./PowerParser";
import { SpellParser } from "./SpellParser";
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
        const parsedItems = [];

        if (importOptions.qualities && chummerChar.qualities && chummerChar.qualities.quality) {
            const parsedQualities = await new QualityParser().parseQualities(chummerChar, importOptions.assignIcons);
            Array.prototype.push.apply(parsedItems, parsedQualities);
        }

        if (importOptions.weapons && chummerChar.weapons != null && chummerChar.weapons.weapon != null) {
            const parsedWeapons = await new WeaponParser().parseWeapons(chummerChar, importOptions.assignIcons);
            Array.prototype.push.apply(parsedItems, parsedWeapons);
        }

        if (importOptions.armor && chummerChar.armors && chummerChar.armors.armor) {
            const parsedArmors = await new ArmorParser().parseArmors(chummerChar, importOptions.assignIcons);
            Array.prototype.push.apply(parsedItems, parsedArmors);
        }

        if (importOptions.cyberware && chummerChar.cyberwares && chummerChar.cyberwares.cyberware) {
            const parsedCyberware = await new CyberwareParser().parseCyberwares(chummerChar, importOptions.assignIcons);
            Array.prototype.push.apply(parsedItems, parsedCyberware);
        }

        if (importOptions.powers && chummerChar.powers && chummerChar.powers.power) {
            const parsedPowers = await new PowerParser().parsePowers(chummerChar, importOptions.assignIcons);
            Array.prototype.push.apply(parsedItems, parsedPowers);
        }

        if (importOptions.equipment && chummerChar.gears && chummerChar.gears.gear) {
            const gears = getArray(chummerChar.gears.gear);
            const allGearData = new GearsParser().parseGears(gears);
            Array.prototype.push.apply(parsedItems, allGearData);
        }

        if (importOptions.spells && chummerChar.spells && chummerChar.spells.spell) {
            const parsedSpells = new SpellParser().parseSpells(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedSpells);
        }

        if (importOptions.contacts && chummerChar.contacts && chummerChar.contacts.contact) {
            const parsedContacts = new ContactParser().parseContacts(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedContacts);
        }

        if (importOptions.lifestyles && chummerChar.lifestyles && chummerChar.lifestyles.lifestyle) {
            const parsedLifestyles = new LifestyleParser().parseLifestyles(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedLifestyles);
        }

        return parsedItems;
    }
}
