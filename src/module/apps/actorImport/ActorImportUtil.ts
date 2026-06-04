import { ActorSchema } from "./ActorSchema";
import { ImportOptionsType } from "./characterImporter/CharacterImporter";
import { ItemsParser } from "./itemImporter/ItemsParser";
import { DataDefaults } from "@/module/data/DataDefaults";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { SR5Actor } from "@/module/actor/SR5Actor";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import CompendiumCollection = foundry.documents.collections.CompendiumCollection;

export type ImportActorType = 'spirit' | 'sprite';

export type BlankImportedActor<T extends ImportActorType> = Actor.CreateData & {
    type: T;
    name: string;
    items: Item.CreateData[];
    effects: ActiveEffect.CreateData[];
    system: ReturnType<typeof DataDefaults.baseSystemData<T>>;
};

export class ActorImportUtil {
    private static async findTemplateIdInPack<T extends ImportActorType>(
        pack: CompendiumCollection<'Actor'>,
        mappedId: string,
        metatypeGuid: string,
        actorType: T,
    ): Promise<string | null> {
        const index = await pack.getIndex({ fields: ['type', 'system.importFlags.sourceid'] });
        const entries = Array.from(index.values());

        const byId = entries.find((entry) => entry.type === actorType && entry._id === mappedId);
        if (byId) return byId._id;

        const bySourceId = entries.find((entry) => {
            if (entry.type !== actorType) return false;
            const sourceId = foundry.utils.getProperty(entry, 'system.importFlags.sourceid');
            return typeof sourceId === 'string' && sourceId.toLowerCase() === metatypeGuid.toLowerCase();
        });

        return bySourceId?._id ?? null;
    }

    static async findActorTemplateByGuid<T extends ImportActorType>(
        metatypeGuid: string,
        actorType: T,
    ): Promise<Actor.Stored<T> | null> {
        const guid = (metatypeGuid || '').trim();
        if (!guid) return null;

        const mappedId = IH.guidToId(guid);
        const compendiumList = game.settings.get(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder);

        for (const packId of compendiumList) {
            const pack = game.packs.get(packId) as CompendiumCollection<'Actor'> | undefined;
            if (pack?.metadata.type !== 'Actor') continue;

            const templateId = await this.findTemplateIdInPack(pack, mappedId, guid, actorType);
            if (!templateId) continue;

            const doc = await pack.getDocument(templateId);
            if (doc?.type !== actorType) continue;

            return doc as Actor.Stored<T>;
        }

        return null;
    }

    static getChummerAttributeTotal(chummerData: ActorSchema, attributeName: string): number | null {
        const attributes = chummerData.attributes?.[1]?.attribute ?? [];
        const raw = attributes.find(att => att.name_english?.toLowerCase() === attributeName.toLowerCase())?.total;
        const total = Number(raw);
        return Number.isFinite(total) ? total : null;
    }

    static buildToggleMap<T extends string>(
        defaults: Readonly<Record<T, boolean>>,
        disabled: readonly T[] | undefined,
    ): Record<T, boolean> {
        const toggles: Record<T, boolean> = { ...defaults };
        for (const key of disabled ?? [])
            toggles[key] = false;
        return toggles;
    }

    static async createBaseActor<T extends ImportActorType>(
        actorType: T,
        chummerData: ActorSchema,
        importOptions: ImportOptionsType,
    ): Promise<BlankImportedActor<T>> {
        return {
            effects: [],
            type: actorType,
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData(actorType),
            items: await new ItemsParser().parse(chummerData, importOptions),
            name: chummerData.alias ?? chummerData.name ?? '[Name not found]',
        } as BlankImportedActor<T>;
    }

    static async sanitizeAndCreateActor<T extends ImportActorType>(
        actorData: BlankImportedActor<T>,
        schema: any,
        chummerData: ActorSchema,
    ): Promise<SR5Actor<T> | null> {
        const consoleLogs = Sanitizer.sanitize(schema, actorData.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerData.name}\n`);
            console.table(consoleLogs);
        }

        return SR5Actor.create(actorData) as Promise<SR5Actor<T> | null>;
    }
}
