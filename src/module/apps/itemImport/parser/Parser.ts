import { DataImporter } from "../importer/DataImporter";
import { TranslationHelper as TH, TranslationType } from "../helper/TranslationHelper";
import * as IconAssign from "../../iconAssigner/iconAssign";
import { ImportHelper as IH } from "../helper/ImportHelper";
import { BonusHelper as BH } from "../helper/BonusHelper";
import { Constants } from "../importer/Constants";

import { Armor, Mod as ArmorMod } from "../schema/ArmorSchema";
import { Bioware } from "../schema/BiowareSchema";
import { Power as CritterPower } from "../schema/CritterpowersSchema";
import { Cyberware } from "../schema/CyberwareSchema";
import { Complexform } from "../schema/ComplexformsSchema";
import { Echo } from "../schema/EchoesSchema";
import { Gear } from "../schema/GearSchema";
import { Metatype } from "../schema/MetatypeSchema";
import { Power, Enhancement } from "../schema/PowersSchema";
import { Quality } from "../schema/QualitiesSchema";
import { Spell } from "../schema/SpellsSchema";
import { Vehicle, Mod as VehicleMod, Weaponmount } from "../schema/VehiclesSchema";
import { Accessory, Weapon } from "../schema/WeaponsSchema";

import { TechnologyType } from "src/module/types/template/Technology";
import { DataDefaults, SystemEntityType } from "src/module/data/DataDefaults";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { SR5Item } from "src/module/item/SR5Item";

export type ParseData =
    Armor | ArmorMod | Bioware | CritterPower | Cyberware | Complexform | Echo | Gear | Metatype |
    Power | Enhancement | Quality | Spell | Vehicle | VehicleMod | Weaponmount | Weapon | Accessory;

type CombinedSystemOfType<T extends string> =
    T extends Actor.SubType ? Actor.SystemOfType<T> :
    T extends Item.SubType ? Item.SystemOfType<T> :
    never;

export abstract class Parser<Type extends SystemEntityType> {
    protected abstract parseType: Type;
    protected folders: Record<string, Promise<Folder>> = {};

    private isActor(): boolean {
        return Object.keys(game.model.Actor).includes(this.parseType);
    }

    protected abstract getFolder(jsonData: ParseData): Promise<Folder>;
    protected async getItems(jsonData: ParseData): Promise<Item.Source[]> { return []; }
    protected getSystem(jsonData: ParseData): CombinedSystemOfType<Type> { return this.getBaseSystem(); }

    public async Parse(jsonData: ParseData): Promise<Actor.CreateData | Item.CreateData> {
        const itemPromise = this.getItems(jsonData);
        let bonusPromise: Promise<void> | undefined;

        const name = jsonData.name._TEXT;
        const typeOption = Constants.MAP_TRANSLATION_TYPE[this.parseType] as TranslationType;
        const options = {id: jsonData.id._TEXT, type: typeOption};

        const entity = {
            name: TH.getTranslation(name, options),
            type: this.parseType,
            folder: await this.getFolder(jsonData),
        } as Actor.CreateData | Item.CreateData;

        entity.system = this.getSystem(jsonData);
        const system = entity.system as CombinedSystemOfType<Type>;

        // Add technology
        if (system && 'technology' in system && system.technology)
            this.setTechnology(system.technology, jsonData);

        // Add Icon
        if (DataImporter.setIcons)
            this.setIcons(entity, system, jsonData);

        if ('bonus' in jsonData && jsonData.bonus)
            bonusPromise = BH.addBonus(entity as any, jsonData.bonus);

        const page = jsonData.page._TEXT;
        const source = jsonData.source._TEXT;
        entity.system.description = DataDefaults.createData('description', {source: `${source} ${TH.getAltPage(name, page, options)}`});

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

    protected setIcons(entity: Actor.CreateData | Item.CreateData, system: CombinedSystemOfType<Type>, jsonData: ParseData) {
        // Why don't we have importFlags as base in actors?
        if ('importFlags' in system && system.importFlags) {
            system.importFlags.name = IH.formatAsSlug(jsonData.name._TEXT);
            system.importFlags.type = this.parseType;
            system.importFlags.subType = '';
            system.importFlags.isFreshImport = true;

            const subType = 'category' in jsonData ? IH.formatAsSlug(jsonData.category?._TEXT || '') : '';
            if (subType && Object.keys(DataImporter.SR5.itemSubTypeIconOverrides[this.parseType as string]).includes(subType))
                system.importFlags.subType = subType;

            entity.img = IconAssign.iconAssign(system.importFlags, DataImporter.iconList, entity.system as SR5Item['system'] | SR5Actor['system']);
        }
    }

    protected getBaseSystem(systemData: Parameters<typeof DataDefaults.baseSystemData<Type>>[1] = {}): CombinedSystemOfType<Type> {
        return DataDefaults.baseSystemData<Type>(this.parseType, systemData);
    };
}
