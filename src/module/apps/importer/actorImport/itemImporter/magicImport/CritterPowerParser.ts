import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export class CritterPowerParser {

    async parseCritterPowers(chummerChar: ActorSchema, assignIcons: boolean) {
        const powers = getArray(chummerChar.critterpowers?.critterpower);
        const parsedItems: Shadowrun.CritterPowerItemData[] = [];
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
        const system = {} as Shadowrun.CritterPowerData;
        system.description = parseDescription(chummerCritterPower);


        system.rating = Number(chummerCritterPower.extra) || 0;
        system.powerType = chummerCritterPower.type === "P" ? 'physical' : 'mana';
        system.range = chummerCritterPower.range || 'Self';
        system.duration = chummerCritterPower.duration || 'Always';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerCritterPower.fullname), parserType);
        if (chummerCritterPower.name_english !== chummerCritterPower.fullname) {
            setSubType(system, parserType, formatAsSlug(chummerCritterPower.name_english));
            if (system.importFlags.subType && chummerCritterPower.extra) {
                system.importFlags.name = formatAsSlug(chummerCritterPower.extra);
            }
        }

        return createItemData(chummerCritterPower.fullname, parserType, system);
    }
}
