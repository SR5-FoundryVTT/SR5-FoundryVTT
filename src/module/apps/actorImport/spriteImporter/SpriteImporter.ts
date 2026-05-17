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
    private static async _findTemplateIdInPack(
        pack: CompendiumCollection<'Actor'>,
        mappedId: string,
        metatypeGuid: string,
    ): Promise<string | null> {
        const index = await pack.getIndex({ fields: ['type', 'system.importFlags.sourceid'] });
        const entries = Array.from(index.values());

        const byId = entries.find((entry) => entry.type === 'sprite' && entry._id === mappedId);
        if (byId) return byId._id;

        const bySourceId = entries.find((entry) => {
            if (entry.type !== 'sprite') return false;
            const sourceId = foundry.utils.getProperty(entry, 'system.importFlags.sourceid');
            return typeof sourceId === 'string' && sourceId.toLowerCase() === metatypeGuid.toLowerCase();
        });

        return bySourceId?._id ?? null;
    }

    static async findSpriteByGuid(metatypeGuid: string) {
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
            if (doc?.type !== 'sprite') continue;

            return doc;
        }

        return null;
    }

    private static getChummerAttributeTotal(chummerData: ActorSchema, attributeName: string): number | null {
        const attributes = chummerData.attributes?.[1]?.attribute ?? [];
        const raw = attributes.find(att => att.name_english?.toLowerCase() === attributeName.toLowerCase())?.total;
        const total = Number(raw);
        return Number.isFinite(total) ? total : null;
    }

    private static inferLevel(chummerData: ActorSchema, spriteTemplate: Actor.Stored<'sprite'>): number {
        const intTotal = this.getChummerAttributeTotal(chummerData, 'int');
        const sleazeBase = Number(spriteTemplate.system.matrix.sleaze.base) || 0;
        const level = spriteTemplate.system.level_applies.sleaze ? (intTotal ?? 0) - sleazeBase : (intTotal ?? 0);

        return Math.max(0, level);
    }

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     */
    static async import(
        chummerData: ActorSchema,
        spriteTemplate: Actor.Stored<'sprite'>,
        importOptions: ImportOptionsType
    ): Promise<SR5Actor<'sprite'> | null> {
        const sprite = {
            effects: [],
            type: 'sprite',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('sprite'),
            items: await new ItemsParser().parse(chummerData, importOptions),
            name: chummerData.alias ?? chummerData.name ?? '[Name not found]',
        } satisfies BlankSprite;

        sprite.system.spriteType = spriteTemplate.system.spriteType;
        sprite.system.skillset = spriteTemplate.system.skillset;
        sprite.system.level_applies = foundry.utils.deepClone(spriteTemplate.system.level_applies);
        sprite.system.attributes.resonance.base = Number(spriteTemplate.system.attributes.resonance.base) || 0;
        sprite.system.matrix.attack.base = Number(spriteTemplate.system.matrix.attack.base) || 0;
        sprite.system.matrix.sleaze.base = Number(spriteTemplate.system.matrix.sleaze.base) || 0;
        sprite.system.matrix.data_processing.base = Number(spriteTemplate.system.matrix.data_processing.base) || 0;
        sprite.system.matrix.firewall.base = Number(spriteTemplate.system.matrix.firewall.base) || 0;

        await ActorSkillImport.importSkills(sprite, chummerData);
        sprite.system.level = this.inferLevel(chummerData, spriteTemplate);
        sprite.system.attributes.edge.base = this.getChummerAttributeTotal(chummerData, 'edg') ?? 0;

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.sprite.schema, sprite.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerData.name}\n`);
            console.table(consoleLogs);
        }

        return SR5Actor.create(sprite) as Promise<SR5Actor<'sprite'> | null>;
    }
}
