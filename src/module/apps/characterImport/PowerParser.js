import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "./BaseParserFunctions.js"
import * as IconAssign from '../../apps/iconAssigner/iconAssign';

export class PowerParser {

    async parsePowers(chummerChar, assignIcons) {
        const powers = getArray(chummerChar.powers.power);
        const parsedPowers = [];
        const iconList = await IconAssign.getIconFiles();

        powers.forEach(async (chummerPower) => {
            try {
                const itemData = this.parsePower(chummerPower);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsedPowers.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedPowers;
    }

    parsePower(chummerPower) {
        const parserType = 'adept_power';
        const system = {};
        system.description = parseDescription(chummerPower);

        system.level = parseInt(chummerPower.rating);
        system.pp = parseFloat(chummerPower.totalpoints);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerPower.fullname), parserType);
        if (chummerPower.name != chummerPower.fullname) {
            setSubType(system, parserType, formatAsSlug(chummerPower.name));
            if (system.importFlags.subType) {
                system.importFlags.name = formatAsSlug(chummerPower.extra);
            }
        }

        return createItemData(chummerPower.fullname, parserType, system);
    }
}