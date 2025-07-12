import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export class PowerParser {

    async parsePowers(chummerChar: ActorSchema, assignIcons: boolean) {
        const powers = getArray(chummerChar.powers?.power);
        const parsedPowers: Shadowrun.AdeptPowerItemData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerPower of powers) {
            try {
                const itemData = this.parsePower(chummerPower);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedPowers.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsedPowers;
    }

    parsePower(chummerPower: Unwrap<NonNullable<ActorSchema['powers']>['power']>) {
        const parserType = 'adept_power';
        const system = {} as Shadowrun.AdeptPowerData;
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