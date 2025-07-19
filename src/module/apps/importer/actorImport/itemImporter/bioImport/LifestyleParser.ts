import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions"
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { ActorSchema } from "../../ActorSchema";
import { SR5 } from "../../../../../config";
import { Unwrap } from "../ItemsParser";


export class LifestyleParser {
    async parseLifestyles(chummerChar: ActorSchema, assignIcons: boolean) {

        const chummerLifestyles = getArray(chummerChar.lifestyles?.lifestyle);
        const parsedLifestyle: Shadowrun.LifestyleItemData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerLifestyle of chummerLifestyles) {
            try {
                const itemData = this.parseLifestyle(chummerLifestyle);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedLifestyle.push(itemData);
            }
             catch (e) {
                console.error(e);
            }
        };

        return parsedLifestyle;
    }

    parseLifestyle(chummerLifestyle: Unwrap<NonNullable<ActorSchema['lifestyles']>['lifestyle']>) {
        const parserType = 'lifestyle';
        const system = {} as Shadowrun.LifestyleData;

        // Advanced lifestyles and lifestyle qualities are not supported at the moment
        // Map the chummer lifestyle type to our sr5 foundry type.
        const chummerLifestyleType = chummerLifestyle.baselifestyle.toLowerCase();
        if ((chummerLifestyleType in SR5.lifestyleTypes)) {
            system.type = chummerLifestyleType;
        }
        else {
            // This is necessary because of a typo in SR5 config.
            if (chummerLifestyleType === 'luxury') {
                system.type = 'luxory';
            }
            else {
                system.type = 'other';
            }
        }

        system.cost = Number(chummerLifestyle.totalmonthlycost) || 0;
        system.permanent = chummerLifestyle.purchased === 'True';
        system.description = parseDescription(chummerLifestyle);

        // The name of the lifestyle is optional, so we use a fallback here.
        const itemName = chummerLifestyle.name ? chummerLifestyle.name : chummerLifestyle.baselifestyle;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemName), parserType);

        const itemData = createItemData(itemName, parserType, system);
        return itemData;
    }
}
