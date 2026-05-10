import { ItemsParser } from "../itemImporter/ItemsParser";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../ActorSchema";
import { ImportOptionsType } from "../characterImporter/CharacterImporter";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { DataDefaults } from "@/module/data/DataDefaults";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { ActorSkillImport } from "../ActorSkillImport";
import CompendiumCollection = foundry.documents.collections.CompendiumCollection;

export interface BlankSpirit extends Actor.CreateData {
    type: 'spirit',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'spirit'>>,
};

export class SpiritImporter {
    private static async _findTemplateIdInPack(
        pack: CompendiumCollection<'Actor'>,
        mappedId: string,
        metatypeGuid: string,
    ): Promise<string | null> {
        const index = await pack.getIndex({ fields: ['type', 'system.importFlags.sourceid'] });
        const entries = Array.from(index.values());

        const byId = entries.find((entry) => entry.type === 'spirit' && entry._id === mappedId);
        if (byId) return byId._id;

        const bySourceId = entries.find((entry) => {
            if (entry.type !== 'spirit') return false;
            const sourceId = foundry.utils.getProperty(entry, 'system.importFlags.sourceid');
            return typeof sourceId === 'string' && sourceId.toLowerCase() === metatypeGuid.toLowerCase();
        });

        return bySourceId?._id ?? null;
    }

    static async findSpiritByGuid(metatypeGuid: string) {
        const guid = (metatypeGuid || '').trim();
        if (!guid) return null;

        const mappedId = IH.guidToId(guid);

        const compendiumList = game.settings.get(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder);
        for (const packId of compendiumList) {
            const pack = game.packs.get(packId) as CompendiumCollection<"Actor"> | undefined;
            if (pack?.metadata.type !== "Actor") continue;

            const templateId = await this._findTemplateIdInPack(pack, mappedId, guid);
            if (!templateId) continue;

            const doc = await pack.getDocument(templateId);
            if (doc?.type !== 'spirit') continue;

            return doc;
        }

        return null;
    }

    static async import(
        chummerData: ActorSchema,
        spiritTemplate: Actor.Stored<'spirit'>,
        importOptions: ImportOptionsType,
    ): Promise<SR5Actor<'spirit'> | null> {
        const spirit = {
            effects: [],
            type: 'spirit',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('spirit'),
            items: await new ItemsParser().parse(chummerData, importOptions),
            name: chummerData.alias ?? chummerData.name ?? '[Name not found]',
        } satisfies BlankSpirit;

        for (const attributeId of Object.keys(spiritTemplate.system.attributes)) {
            spirit.system.attributes[attributeId].base = spiritTemplate.system.attributes[attributeId].base;
            if (attributeId in spiritTemplate.system.force_applies) {
                spirit.system.force_applies[attributeId] = !!spiritTemplate.system.force_applies[attributeId];
            }
        }

        spirit.system.spiritType = spiritTemplate.system.spiritType;
        spirit.system.skillset = spiritTemplate.system.skillset;
        spirit.system.half_value_skill = spiritTemplate.system.half_value_skill;
        await ActorSkillImport.importSkills(spirit, chummerData);

        const edgeAttribute = chummerData.attributes[1]?.attribute.find(
            att => att.name_english.toLowerCase() === 'edg'
        );
        spirit.system.attributes.edge.base = Number(edgeAttribute?.total) || 0;
        const magic = Number(chummerData.attributes[1]?.attribute.find(att => att.name_english.toLowerCase() === 'mag')?.total) || 1;
        spirit.system.attributes.force.base = magic;

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.spirit.schema, spirit.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerData.name}\n`);
            console.table(consoleLogs);
        }

        return SR5Actor.create(spirit) as Promise<SR5Actor<'spirit'> | null>;
    }
}
