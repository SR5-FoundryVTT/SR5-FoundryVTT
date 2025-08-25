import { ActorSchema } from '../ActorSchema';
import * as IconAssign from '../../../iconAssigner/iconAssign';
import { DataDefaults, SystemEntityType } from "src/module/data/DataDefaults";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { CompendiumKey } from '@/module/apps/itemImport/importer/Constants';
import { Sanitizer } from '@/module/sanitizer/Sanitizer';

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
    cost?: string | null;
    equipped?: "True"|"False"|null;
    conditionmonitor?: string | null;
    conceal?: string | null;
};

type Unwrap<T> = T extends Array<infer U> ? U : T;
export type ExtractItemType<
    FieldKey extends keyof ActorSchema,
    InnerKey extends keyof NonNullable<ActorSchema[FieldKey]>
> = Unwrap<NonNullable<ActorSchema[FieldKey]>[InnerKey]>;

export type BlankItem<T extends ItemSystems> = ReturnType<Parser<T>["createItem"]>;

export abstract class Parser<T extends ItemSystems> {
    protected abstract readonly parseType: T;
    protected abstract readonly compKey: CompendiumKey | null;
    static iconList: string[] | undefined;
    static readonly DEFAULT_NAME = "Unnamed";

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

    protected async getItem(itemData: BaseType) {
        const info = {
            name: itemData.name,
            name_english: itemData.name_english,
            chummerId: itemData.suid ?? itemData.sourceid ?? null,
        }
        return IH.getItem(this.compKey, info) as Promise<BlankItem<T> | null>;
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

        if (itemData.cost != null)
            technology.cost = Number(itemData.cost.replace(/[^\d.-]/g, "")) || 0;

        if (itemData.equipped != null)
            technology.equipped = itemData.equipped === "True";

        if (itemData.conditionmonitor != null)
            technology.condition_monitor.max = Number(itemData.conditionmonitor) || 0;

        if (itemData.conceal != null)
            technology.conceal.base = Number(itemData.conceal) || 0;
    }

    public async parseItems(itemsData: BaseType[] | BaseType | undefined) {
        if (!itemsData) return [];

        const parsedItems: BlankItem<T>[] = [];

        for (const itemData of IH.getArray(itemsData)) {
            try {
                const fetchedItem = await this.getItem(itemData);
                const item = fetchedItem ?? this.createItem(itemData);
                item._id = foundry.utils.randomID();

                item.name = itemData.fullname ?? itemData.name ?? Parser.DEFAULT_NAME;
                this.parseDescription(item, itemData);
                this.parseTechnology(item, itemData);
                this.parseItem(item, itemData);

                item.flags.shadowrun5e.embeddedItems = await this.getEmbeddedItems(itemData);

                if (Parser.iconList && !item.img)
                    item.img = IconAssign.iconAssign(item.system.importFlags, Parser.iconList, item.system);

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
