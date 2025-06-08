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

import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export type ParseData =
    Armor | ArmorMod | Bioware | CritterPower | Cyberware | Complexform | Echo | Gear | Metatype |
    Power | Enhancement | Quality | Spell | Vehicle | VehicleMod | Weaponmount | Weapon | Accessory

export abstract class Parser<TResult extends (ShadowrunActorData | ShadowrunItemData)> {
    protected abstract parseType: string;
    protected folders: Record<string, Promise<Folder>> = {};

    private isActor(): boolean {
        return Object.keys(game.model.Actor).includes(this.parseType);
    }

    protected abstract getFolder(jsonData: ParseData): Promise<Folder>;
    protected async getItems(jsonData: ParseData): Promise<ShadowrunItemData[]> { return []; }
    protected getSystem(jsonData: ParseData): TResult['system'] { return this.getBaseSystem(); }

    public async Parse(jsonData: ParseData): Promise<TResult> {
        const itemPromise = this.getItems(jsonData);
        let bonusPromise: Promise<void> | undefined;

        const name = jsonData.name._TEXT;
        const typeOption = Constants.MAP_TRANSLATION_TYPE[this.parseType] as TranslationType;
        const options = {id: jsonData.id._TEXT, type: typeOption};

        const entity = {
            name: TH.getTranslation(name, options),
            type: this.parseType,
            system: this.getSystem(jsonData),
        } as TResult;

        //@ts-expect-error TODO: foundry-vtt-types v9
        entity.folder = await this.getFolder(jsonData);

        // Add technology
        if ('technology' in entity.system)
            this.setTechnology(entity.system, jsonData);

        // Add Icon
        if (DataImporter.setIcons)
            this.setIcons(entity, jsonData);

        if ('bonus' in jsonData && jsonData.bonus)
            bonusPromise = BH.addBonus(entity, jsonData.bonus);

        const page = jsonData.page._TEXT;
        const source = jsonData.source._TEXT;
        entity.system.description.source = `${source} ${TH.getAltPage(name, page, options)}`;

        // Runtime branching
        if (this.isActor()) {
            //@ts-expect-error TODO: foundry-vtt-types v9
            entity.items = await itemPromise;
        } else {
            //@ts-expect-error TODO: foundry-vtt-types v9
            entity.flags ??= {};
            //@ts-expect-error TODO: foundry-vtt-types v9
            entity.flags.shadowrun5e ??= {};
            //@ts-expect-error TODO: foundry-vtt-types v9
            entity.flags.shadowrun5e.embeddedItems = await itemPromise;
        }

        await bonusPromise;

        return entity;
    }

    private setTechnology(system: Shadowrun.ShadowrunTechnologyItemData['system'], jsonData: ParseData) {
        system.technology.availability = 'avail' in jsonData && jsonData.avail ? jsonData.avail._TEXT || '' : '';
        system.technology.cost = 'cost' in jsonData && jsonData.cost ? Number(jsonData.cost._TEXT) || 0 : 0;
        system.technology.rating = 'rating' in jsonData && jsonData.rating ? Number(jsonData.rating._TEXT) || 0 : 0;
        system.technology.conceal.base = 'conceal' in jsonData && jsonData.conceal ? Number(jsonData.conceal._TEXT) || 0 : 0;
    }

    protected setIcons(entity: TResult, jsonData: ParseData) {
        // Why don't we have importFlags as base in actors?
        if ('importFlags' in entity.system || this.isActor()) {
            //@ts-expect-error TODO: fvtt-types v13
            entity.system.importFlags = {
                name: IH.formatAsSlug(jsonData.name._TEXT),
                type: this.parseType,
                subType: '',
                isFreshImport: true,
            } as Shadowrun.ImportFlagData;

            const subType = 'category' in jsonData ? IH.formatAsSlug(jsonData.category?._TEXT || '') : '';
            if (subType && Object.keys(DataImporter.SR5.itemSubTypeIconOverrides[this.parseType]).includes(subType))
                //@ts-expect-error TODO: fvtt-types v13
                entity.system.importFlags.subType = subType;

            const entitySystem = entity.system as Shadowrun.ShadowrunItemDataData | Shadowrun.ShadowrunActorDataData;
            //@ts-expect-error TODO: foundry-vtt-types v9
            entity.img = IconAssign.iconAssign(entity.system.importFlags, DataImporter.iconList, entitySystem);
        }
    }

    protected getBaseSystem(systemData: Partial<TResult['system']> = {}): TResult['system'] {
        const actor_item = this.isActor() ? 'Actor' : 'Item';

        try {
            // foundry.utils.duplicate source to avoid keeping reference to model data.
            const modelSystemData = foundry.utils.duplicate(game.model[actor_item][this.parseType]);
            return foundry.utils.mergeObject(modelSystemData, systemData) as TResult['system'];
        } catch (error) {
            throw new Error(`FoundryVTT doesn't have item type: ${this.parseType} registered in ${actor_item}`);
        }
    };
}
