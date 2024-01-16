import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';

export class CritterPowerParser {

    async parseCritterPowers(chummerChar, assignIcons) {
        const powers = getArray(chummerChar.critterpowers?.critterpower);
        const parsedItems = [];
        const iconList = await IconAssign.getIconFiles();

        powers.forEach(async (chummerPower) => {
            try {
                const itemData = this.parseCritterPower(chummerPower);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsedItems.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedItems;
    }

    parseCritterPower(chummerCritterPower) {
        const parserType = 'critter_power';
        const system = {};
        system.description = parseDescription(chummerCritterPower);


        system.rating = parseFloat(chummerCritterPower.extra);
        system.powerType = chummerCritterPower.type === "P" ? 'physical' : 'mana';
        system.range = chummerCritterPower.range;
        system.duration = chummerCritterPower.duration;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerCritterPower.fullname), parserType);
        if (chummerCritterPower.name_english != chummerCritterPower.fullname) {
            setSubType(system, parserType, formatAsSlug(chummerCritterPower.name_english));
            if (system.importFlags.subType) {
                system.importFlags.name = formatAsSlug(chummerCritterPower.extra);
            }
        }

        return createItemData(chummerCritterPower.fullname, parserType, system);
    }
}