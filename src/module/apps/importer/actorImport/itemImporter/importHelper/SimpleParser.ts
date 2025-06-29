import { parseDescription, createItemData, genImportFlags, formatAsSlug } from "./BaseParserFunctions";
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';
import { Unwrap } from "../ItemsParser";
import { ActorSchema } from "../../ActorSchema";
import { DataDefaults } from "src/module/data/DataDefaults";

export default class SimpleParser {
    async parseCollection(parsingCollection: Unwrap<NonNullable<ActorSchema['metamagics']>['metamagic']>[], parserType: 'echo' | 'metamagic', assignIcons: boolean = false) {
        const parsed: Item.CreateData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const toParse of parsingCollection) {
            try {
                const itemData = this.parseItem(toParse, parserType);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsed.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsed;
    }

    parseItem(toParse: Unwrap<NonNullable<ActorSchema['metamagics']>['metamagic']>, parserType: 'echo' | 'metamagic') {
        const system = DataDefaults.baseSystemData(parserType);
        system.description = parseDescription(toParse);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(toParse.name_english), parserType);

        return createItemData(toParse.fullname, parserType, system);
    }
}
