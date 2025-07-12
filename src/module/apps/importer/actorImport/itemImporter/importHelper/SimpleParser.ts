import { parseDescription, createItemData, genImportFlags, formatAsSlug } from "./BaseParserFunctions";
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export default class SimpleParser {
    async parseCollection(parsingCollection: Unwrap<NonNullable<ActorSchema['metamagics']>['metamagic']>[], parserType: 'echo' | 'metamagic', assignIcons: boolean) {
        const parsed: (Shadowrun.ShadowrunItemData & {type: 'echo' | 'metatype'})[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const toParse of parsingCollection) {
            try {
                const itemData = this.parseItem(toParse, parserType);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsed.push(itemData as Shadowrun.ShadowrunItemData & {type: 'echo' | 'metatype'});
            } catch (e) {
                console.error(e);
            }
        };

        return parsed;
    }

    parseItem(toParse: Unwrap<NonNullable<ActorSchema['metamagics']>['metamagic']>, parserType: 'echo' | 'metamagic') {
        const system = {} as (Shadowrun.ShadowrunItemData & {type: 'echo' | 'metatype'})['system'];
        system.description = parseDescription(toParse);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(toParse.name_english), parserType);

        return createItemData(toParse.fullname, parserType, system);
    }
}