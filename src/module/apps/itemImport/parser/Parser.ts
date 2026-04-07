import { ParseData } from "./Types";
import { CompendiumKey } from "../importer/Constants";
import { DataImporter } from "../importer/DataImporter";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { BonusHelper as BH } from "../helper/BonusHelper";
import * as IconAssign from "../../iconAssigner/iconAssign";
import { ImportHelper as IH } from "../helper/ImportHelper";
import { TechnologyType } from "src/module/types/template/Technology";
import { DataDefaults, SystemConstructorArgs, SystemEntityType } from "src/module/data/DataDefaults";

export type SystemType<T extends SystemEntityType> = ReturnType<Parser<T>["getBaseSystem"]>;

export abstract class Parser<SubType extends SystemEntityType> {
    protected abstract readonly parseType: SubType;

    private isActor(): this is Parser<SystemEntityType & Actor.SubType> {
        return Object.keys(CONFIG.Actor.dataModels).includes(this.parseType);
    }

    protected abstract getFolder(jsonData: ParseData, compendiumKey: CompendiumKey): Promise<Folder>;
    protected async getItems(jsonData: ParseData): Promise<Item.Source[]> { return []; }
    protected getSystem(jsonData: ParseData) { return this.getBaseSystem(); }

    private getSanitizedSystem(jsonData: ParseData) {
        const system = this.getSystem(jsonData);
        const schema = CONFIG[this.isActor() ? "Actor" : "Item"].dataModels[this.parseType].schema;
        const correctionLogs = Sanitizer.sanitize(schema, system);

        if (correctionLogs) {
            console.warn(
                `Document Sanitized on Import:\n` +
                `Name: ${jsonData.name._TEXT};\n` +
                `Type: ${this.isActor() ? "Actor" : "Item"}; SubType: ${this.parseType};\n`
            );
            console.table(correctionLogs);
        }

        return system;
    }

    public async Parse(jsonData: ParseData, compendiumKey: CompendiumKey): Promise<Actor.CreateData | Item.CreateData> {
        const itemPromise = this.getItems(jsonData);
        let bonusPromise: Promise<void> | undefined;

        const entity = {
            img: undefined as string | undefined | null,
            name: IH.getArray(jsonData.translate)[0]?._TEXT ?? jsonData.name._TEXT,
            type: this.parseType as any,
            system: this.getSanitizedSystem(jsonData),
            folder: (await this.getFolder(jsonData, compendiumKey)).id,
        } satisfies Actor.CreateData | Item.CreateData;

        const system = entity.system;

        // Add technology
        if ('technology' in system && system.technology)
            this.setTechnology(system.technology, jsonData);

        this.setImporterFlags(entity, jsonData);

        if (DataImporter.iconSet)
            entity.img = IconAssign.iconAssign(DataImporter.iconSet, entity);

        if ('bonus' in jsonData && jsonData.bonus)
            bonusPromise = BH.addBonus(entity as any, jsonData.bonus);

        if (jsonData.page && jsonData.source) {
            const page = IH.getArray(jsonData.altpage)[0]?._TEXT ?? jsonData.page._TEXT;
            const source = jsonData.source._TEXT;
            system.description.source = `${source} ${page}`;
        }

        // Runtime branching
        if (this.isActor())
            (entity as Actor.CreateData).items = await itemPromise;
        else
            (entity as Item.CreateData).flags = { shadowrun5e: { embeddedItems: await itemPromise } };

        await bonusPromise;

        return entity;
    }

    private setTechnology(technology: TechnologyType, jsonData: ParseData) {
        technology.availability = 'avail' in jsonData && jsonData.avail ? jsonData.avail._TEXT || '' : '';
        technology.cost = 'cost' in jsonData && jsonData.cost ? Number(jsonData.cost._TEXT) || 0 : 0;
        technology.rating = 'rating' in jsonData && jsonData.rating ? Number(jsonData.rating._TEXT) || 0 : 0;
        technology.conceal.base = 'conceal' in jsonData && jsonData.conceal ? Number(jsonData.conceal._TEXT) || 0 : 0;
    }

    protected setImporterFlags(entity: Actor.CreateData | Item.CreateData, jsonData: ParseData) {
        const category = 'category' in jsonData ? jsonData.category?._TEXT || '' : '';

        entity.system!.importFlags = {
            category,
            isFreshImport: true,
            name: jsonData.name._TEXT,
            sourceid: jsonData.id._TEXT,
        };
    }

    protected getBaseSystem(createData: SystemConstructorArgs<SubType> = {}) {
        return DataDefaults.baseSystemData<SubType>(this.parseType, createData);
    };
}
