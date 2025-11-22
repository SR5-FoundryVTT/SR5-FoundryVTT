import { ItemsParser } from "../itemImporter/ItemsParser";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../ActorSchema";
import { importOptionsType } from "../characterImporter/CharacterImporter";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { DataDefaults } from "@/module/data/DataDefaults";

export interface BlankSpirit extends Actor.CreateData {
    type: 'spirit',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'spirit'>>,
};

export class SpiritImporter {
    static async import(
        chummerData: ActorSchema,
        type: string,
        importOptions: importOptionsType
    ): Promise<SR5Actor<'spirit'> | null> {
        const spirit = {
            effects: [],
            type: 'spirit',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('spirit'),
            items: await new ItemsParser().parse(chummerData, importOptions),
            name: chummerData.alias ?? chummerData.name ?? '[Name not found]',
        } satisfies BlankSpirit;

        spirit.system.spiritType = type as any;

        const edgeAttribute = chummerData.attributes[1]?.attribute.find(
            att => att.name_english.toLowerCase() === 'edg'
        );
        spirit.system.attributes.edge.base = Number(edgeAttribute?.total) || 0;
        const magic = Number(chummerData.attributes[1]?.attribute.find(att => att.name_english.toLowerCase() === 'mag')!.total);
        spirit.system.force = magic;

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.spirit.schema, spirit.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerData.name}\n`);
            console.table(consoleLogs);
        }

        return SR5Actor.create(spirit) as Promise<SR5Actor<'spirit'> | null>;
    }
}
