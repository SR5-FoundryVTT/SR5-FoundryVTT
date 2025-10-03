import { ItemsParser } from "../itemImporter/ItemsParser";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../ActorSchema";
import { importOptionsType } from "../characterImporter/CharacterImporter";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { DataDefaults } from "@/module/data/DataDefaults";

export interface BlankSprite extends Actor.CreateData {
    type: 'sprite',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'sprite'>>,
};

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class SpriteImporter {

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param {*} chummerFile The complete chummer file as json object. The first character will be selected for import.
     * @param {*} importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    async import(chummerData: ActorSchema, importOptions: importOptionsType) {
        const sprite = {
            effects: [],
            type: 'sprite',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('sprite'),
            items: await new ItemsParser().parse(chummerData, importOptions),
            name: chummerData.alias ?? chummerData.name ?? '[Name not found]',
        } satisfies BlankSprite;

        sprite.system.spriteType = chummerData.metatype_english.split(" ")[0].toLowerCase() as any;
        const level = Number(chummerData.attributes[1]?.attribute.filter(att => att.name_english.toLowerCase() === 'int')[0].total);
        sprite.system.level = level;

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.sprite.schema, sprite.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerData.name}\n`);
            console.table(consoleLogs);
        }

        await SR5Actor.create(sprite);
    }
}
