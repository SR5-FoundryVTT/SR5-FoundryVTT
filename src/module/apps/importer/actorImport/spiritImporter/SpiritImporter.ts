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

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class SpiritImporter {

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param {*} chummerFile The complete chummer file as json object. The first character will be selected for import.
     * @param {*} importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    async import(chummerData: ActorSchema, type: Actor.SystemOfType<'spirit'>['spiritType'], importOptions: importOptionsType) {
        const spirit = {
            effects: [],
            type: 'spirit',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('spirit'),
            items: await new ItemsParser().parse(chummerData, importOptions),
            name: chummerData.alias ?? chummerData.name ?? '[Name not found]',
        } satisfies BlankSpirit;

        spirit.system.spiritType = type;
        const magic = Number(chummerData.attributes[1]?.attribute.filter(att => att.name_english.toLowerCase() === 'mag')[0].total);
        spirit.system.force = magic;

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.spirit.schema, spirit.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerData.name}\n`);
            console.table(consoleLogs);
        }

        await SR5Actor.create(spirit);
    }
}
