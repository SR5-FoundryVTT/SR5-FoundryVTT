import { ActorSchema } from "../ActorSchema";
import * as IconAssign from "../../iconAssigner/iconAssign";
import { DataDefaults, SystemEntityType } from "src/module/data/DataDefaults";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";

export type ItemSystems = SystemEntityType & Item.ConfiguredSubType;

export type BaseType = {
    suid?: string;
    sourceid?: string;
    name: string | null;
    name_english?: string;
    fullname?: string;
    fullname_english?: string;
    source?: string | null;
    page?: string | null;
    description?: string | null;
    notes?: string | null;
    rating?: string | null;
    avail?: string | null;
    qty?: string | null;
    owncost?: string | null;
    equipped?: "True"|"False"|null;
    conditionmonitor?: string | null;
    conceal?: string | null;
    rawconceal?: string | null;
    category_english?: string | null;
};

export type Unwrap<T> = T extends Array<infer U> ? U : T;
export type ExtractItemType<
    FieldKey extends keyof ActorSchema,
    InnerKey extends keyof NonNullable<ActorSchema[FieldKey]>
> = Unwrap<NonNullable<ActorSchema[FieldKey]>[InnerKey]>;

export type BlankItem<T extends ItemSystems> = ReturnType<Parser<T>["createItem"]>;

export abstract class Parser<T extends ItemSystems> {
    protected abstract readonly parseType: T;
    static readonly DEFAULT_NAME = "Unnamed";
    static iconSet: Set<string> | null = null;

    protected createItem(itemData: BaseType) {
        type FlagType = NonNullable<NonNullable<Item.CreateData['flags']>['shadowrun5e']>;
        return {
            name: itemData.fullname ?? itemData.name ?? Parser.DEFAULT_NAME,
            type: this.parseType,
            img: null as string | null,
            _id: foundry.utils.randomID(),
            flags: { shadowrun5e: {} as FlagType },
            system: DataDefaults.baseSystemData(this.parseType),
        } satisfies Item.CreateData;
    }

    /**
     * Attempts to retrieve an item from the compendium packs based on the provided item data.
     * Tries to match by suid/sourceid (guid) first, then by name or name_english.
     * Returns a blank item if not found.
     */
    protected async getItemFromCompendium(itemData: BaseType): Promise<BlankItem<T> | null> {
        const guid = itemData.suid ?? itemData.sourceid ?? null;
        const itemIdFromGuid = guid ? IH.guidToId(guid) : null;
        const compendiumList = game.settings.get(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder);

        // Iterate through each compendium pack in the preferred order
        for (const packId of compendiumList) {
            const pack = game.packs.get(packId) as CompendiumCollection<"Item"> | undefined;
            if (!pack || pack.metadata.type !== "Item") continue;
            
            let item: Item.Stored | undefined | null;

            if (itemIdFromGuid) {
                item = await pack.getDocument(itemIdFromGuid);

                if (item && item.type !== this.parseType) item = undefined;
            }

            if (!item) {
                const index = await pack.getIndex({fields: ["name", "type"]});
                const indexEntry = index.find(e => e.name === itemData.name && e.type === this.parseType)
                                ?? index.find(e => e.name === itemData.name_english && e.type === this.parseType);
                if (indexEntry)
                    item = await pack.getDocument(indexEntry._id);
            }

            if (item)
                return game.items.fromCompendium(item) as Item.CreateData as BlankItem<T>;
        }

        return null;
    }

    protected parseDescription(item: BlankItem<T>, itemData: BaseType) {
        const description = item.system.description;
        description.value = itemData.notes ?? itemData.description ?? description.value;

        if (itemData.source && itemData.page)
            description.source = `${itemData.source} ${itemData.page}`;
    }

    protected parseTechnology(item: BlankItem<T>, itemData: BaseType) {
        if (!('technology' in item.system)) return;
        const technology = item.system.technology;

        if (itemData.rating != null)
            technology.rating = Number(itemData.rating) || 0;

        if (itemData.avail != null)
            technology.availability = itemData.avail;

        if (itemData.qty != null)
            technology.quantity = Number(itemData.qty) || 0;

        if (itemData.owncost != null)
            technology.cost = Number(itemData.owncost.replace(/[^\d.-]/g, "")) || 0;

        if (itemData.equipped != null)
            technology.equipped = itemData.equipped === "True";

        if (itemData.conditionmonitor != null)
            technology.condition_monitor.max = Number(itemData.conditionmonitor) || 0;

        if (itemData.rawconceal != null || itemData.conceal != null)
            technology.conceal.base = Number(itemData.rawconceal ?? itemData.conceal) || 0;
    }

    protected parseCategoryFlags(item: BlankItem<T>, itemData: BaseType) {
        return itemData.category_english ?? '';
    }

    protected parseImportFlags(item: BlankItem<T>, itemData: BaseType) {
        item.system.importFlags = {
            isFreshImport: true,
            sourceid: itemData.sourceid ?? '',
            category: this.parseCategoryFlags(item, itemData),
            name: itemData.name_english ?? itemData.name ?? '',
        };
    }

    public async parseItems(itemsData: BaseType[] | BaseType | undefined) {
        if (!itemsData) return [];

        const parsedItems: BlankItem<T>[] = [];

        for (const itemData of IH.getArray(itemsData)) {
            try {
                const fetchedItem = await this.getItemFromCompendium(itemData);
                const item = fetchedItem ?? this.createItem(itemData);
                item._id = foundry.utils.randomID();

                item.name = itemData.fullname ?? itemData.name ?? Parser.DEFAULT_NAME;
                this.parseDescription(item, itemData);
                this.parseTechnology(item, itemData);
                this.parseItem(item, itemData);
                this.parseImportFlags(item, itemData);

                item.flags.shadowrun5e.embeddedItems = await this.getEmbeddedItems(itemData);

                if (Parser.iconSet && !item.img)
                    item.img = IconAssign.iconAssign(Parser.iconSet, item);

                const schema = CONFIG["Item"].dataModels[item.type].schema;
                const correctionLogs = Sanitizer.sanitize(schema, item.system);
        
                if (correctionLogs) {
                    console.warn(
                        `Document Sanitized on Actor Importer:\n` +
                        `Name: ${item.name}; Type: ${item.type};\n`
                    );
                    console.table(correctionLogs);
                }

                parsedItems.push(item);
            } catch (error) {
                console.error(`Error parsing item ${itemData.name}:`, error);
            }
        }

        return parsedItems;
    }

    protected abstract parseItem(item: BlankItem<T>, itemData: BaseType): void;
    protected async getEmbeddedItems(itemData: BaseType): Promise<Item.Source[]> {
        return [] as Item.Source[];
    }
}
