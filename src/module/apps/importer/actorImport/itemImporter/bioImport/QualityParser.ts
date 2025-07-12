import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export class QualityParser {

    async parseQualities(chummerChar: ActorSchema, assignIcons: boolean) {
        const qualities = getArray(chummerChar.qualities?.quality);
        const parsedQualities: Shadowrun.QualityItemData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerQuality of qualities) {
            try {
                const itemData = this.parseQuality(chummerQuality);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedQualities.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsedQualities;
    }

    parseQuality(chummerQuality: Unwrap<NonNullable<ActorSchema['qualities']>['quality']>) {
        const parserType = 'quality';
        const system = {} as Shadowrun.QualityData;
        system.type = chummerQuality.qualitytype_english.toLowerCase() as any;
        system.rating = parseInt(chummerQuality.extra) || 0;
        system.karma = (parseInt(chummerQuality.bp) || 0) * Math.max(system.rating, 1);
        system.description = parseDescription(chummerQuality);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerQuality.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(system.type)); // positive or negative

        return createItemData(chummerQuality.name, parserType, system);
    }
}
