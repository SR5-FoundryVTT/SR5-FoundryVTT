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

import { TechnologyType } from "src/module/types/template/TechnologyModel";
import { DataDefaults, SystemEntityType } from "src/module/data/DataDefaults";
import { SystemActor } from "src/module/actor/SR5Actor";
import { SystemItem } from "src/module/item/SR5Item";

export type ParseData =
    Armor | ArmorMod | Bioware | CritterPower | Cyberware | Complexform | Echo | Gear | Metatype |
    Power | Enhancement | Quality | Spell | Vehicle | VehicleMod | Weaponmount | Weapon | Accessory;

type CombinedSystemOfType<T extends string> =
  T extends Actor.SubType ? Actor.SystemOfType<T> :
  T extends Item.SubType ? Item.SystemOfType<T> :
  never;

type EntityType = (Actor.CreateData & {system: Actor.SystemOfType<SystemActor>}) | (Item.CreateData & {system: Item.SystemOfType<SystemItem>});

export abstract class Parser<Type extends SystemEntityType> {
    protected abstract parseType: Type;
    protected folders: Record<string, Promise<Folder>> = {};

    private isActor(): boolean {
        return Object.keys(game.model.Actor).includes(this.parseType);
    }

    protected abstract getFolder(jsonData: ParseData): Promise<Folder>;
    protected async getItems(jsonData: ParseData): Promise<Item.Source[]> { return []; }
    protected getSystem(jsonData: ParseData): CombinedSystemOfType<Type> { return this.getBaseSystem(); }

    public async Parse(jsonData: ParseData): Promise<EntityType> {
        const itemPromise = this.getItems(jsonData);
        let bonusPromise: Promise<void> | undefined;

        const name = jsonData.name._TEXT;
        const typeOption = Constants.MAP_TRANSLATION_TYPE[this.parseType] as TranslationType;
        const options = {id: jsonData.id._TEXT, type: typeOption};

        const entity = {
            name: TH.getTranslation(name, options),
            type: this.parseType,
            system: this.getSystem(jsonData),
        } as unknown as EntityType;

        entity.folder = await this.getFolder(jsonData);

        // Add technology
        if (entity.system && 'technology' in entity.system && entity.system.technology)
            this.setTechnology(entity.system.technology, jsonData);

        // Add Icon
        if (DataImporter.setIcons)
            this.setIcons(entity, jsonData);

        if ('bonus' in jsonData && jsonData.bonus)
            bonusPromise = BH.addBonus(entity, jsonData.bonus);

        const page = jsonData.page._TEXT;
        const source = jsonData.source._TEXT;
        entity.system.description = DataDefaults.createData('description', {source: `${source} ${TH.getAltPage(name, page, options)}`});

        // Runtime branching
        if (this.isActor()) {
            (entity as Actor.CreateData).items = await itemPromise;
        } else {
            (entity as Item.CreateData).flags = { shadowrun5e: { embeddedItems: await itemPromise } };
        }

        await bonusPromise;

        return entity;
    }

    private setTechnology(technology: TechnologyType, jsonData: ParseData) {
        technology.availability = 'avail' in jsonData && jsonData.avail ? jsonData.avail._TEXT || '' : '';
        technology.cost = 'cost' in jsonData && jsonData.cost ? Number(jsonData.cost._TEXT) || 0 : 0;
        technology.rating = 'rating' in jsonData && jsonData.rating ? Number(jsonData.rating._TEXT) || 0 : 0;
        technology.conceal.base = 'conceal' in jsonData && jsonData.conceal ? Number(jsonData.conceal._TEXT) || 0 : 0;
    }

    protected setIcons(entity: EntityType, jsonData: ParseData) {
        // Why don't we have importFlags as base in actors?
        if ('importFlags' in entity.system && entity.system.importFlags) {
            entity.system.importFlags.name = IH.formatAsSlug(jsonData.name._TEXT);
            entity.system.importFlags.type = this.parseType;
            entity.system.importFlags.subType = '';
            entity.system.importFlags.isFreshImport = true;

            const subType = 'category' in jsonData ? IH.formatAsSlug(jsonData.category?._TEXT || '') : '';
            if (subType && Object.keys(DataImporter.SR5.itemSubTypeIconOverrides[this.parseType as string]).includes(subType))
                entity.system.importFlags.subType = subType;

            const entitySystem = entity.system as Shadowrun.ShadowrunItemDataData | Shadowrun.ShadowrunActorDataData;
            entity.img = IconAssign.iconAssign(entity.system.importFlags, DataImporter.iconList, entitySystem);
        }
    }

    protected getBaseSystem(systemData: Parameters<typeof DataDefaults.baseData<Type>>[1] = {}): CombinedSystemOfType<Type> {
        return DataDefaults.baseData<Type>(this.parseType, systemData) as unknown as CombinedSystemOfType<Type>;
    };
}
