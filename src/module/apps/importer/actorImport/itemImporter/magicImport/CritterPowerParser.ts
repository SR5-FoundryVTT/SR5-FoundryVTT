import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';
import { ActorSchema } from "../../ActorSchema.js";
import { Unwrap } from "../ItemsParser.js";
import { DataDefaults } from "src/module/data/DataDefaults.js";

export class CritterPowerParser {

    async parseCritterPowers(chummerChar: ActorSchema, assignIcons: boolean = false) {
        const powers = getArray(chummerChar.critterpowers?.critterpower);
        const parsedItems: Item.CreateData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerPower of powers) {
            try {
                const itemData = this.parseCritterPower(chummerPower);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedItems.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsedItems;
    }

    parseCritterPower(chummerCritterPower: Unwrap<NonNullable<ActorSchema['critterpowers']>['critterpower']>) {
        const parserType = 'critter_power';
        const system = DataDefaults.baseSystemData(parserType);
        system.description = parseDescription(chummerCritterPower);

        system.rating = parseFloat(chummerCritterPower.extra);
        system.powerType = chummerCritterPower.type === "P" ? 'physical' : 'mana';
        system.range = chummerCritterPower.range;
        system.duration = chummerCritterPower.duration;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerCritterPower.fullname), parserType);
        if (chummerCritterPower.name_english !== chummerCritterPower.fullname) {
            setSubType(system, parserType, formatAsSlug(chummerCritterPower.name_english));
            if (system.importFlags.subType) {
                system.importFlags.name = formatAsSlug(chummerCritterPower.extra);
            }
        }

        return createItemData(chummerCritterPower.fullname, parserType, system);
    }
}
