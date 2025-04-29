import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
// import { getArray } from '../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js';
import { DataDefaults } from '../../../../data/DataDefaults';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import SpiritActorData = Shadowrun.SpiritActorData;
import { SR5 } from '../../../../config';
import { Metatype } from "../../schema/MetatypeSchema";
import { json } from 'stream/consumers';
import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

export class SpiritParser extends ActorParserBase<SpiritActorData> {
    private formatAsSlug(name: string): string {
        return name.trim().toLowerCase().replace((/'|,|\[|\]|\(|\)/g), '').split((/-|\s|\//g)).join('-');
    }

    private genImportFlags(name: string, type: string, subType: string): Shadowrun.ImportFlagData {
        const flags = {
            name: this.formatAsSlug(name), // original english name
            type: type,
            subType: '',
            isFreshImport: true
        }
        if (subType && Object.keys(SR5.itemSubTypeIconOverrides[type]).includes(subType)) {
            flags.subType = subType;
        }
        return flags;
    }

    private createPower(item : any, jsonTranslation?: object | undefined) : any {
        const itemJson = DataDefaults.baseEntityData<Shadowrun.CritterPowerItemData, Shadowrun.CritterPowerData>(
            "Item", { type: "critter_power" }
        );

        const name = item._TEXT ?? item.name?._TEXT;

        itemJson.system.rating = item.rating?._TEXT ?? item.$?.rating ?? 0;
        itemJson.name = IH.MapNameToTranslation(jsonTranslation, name)
        itemJson.system.importFlags = this.genImportFlags(name, "critter_power", '');

        return itemJson;
    }

    private getItems(
        array: undefined
            | NotEmpty<Metatype['powers']>['power']
            | NotEmpty<Metatype['optionalpowers']>['optionalpower']
            | NotEmpty<NotEmpty<Metatype['qualities']>['positive']>['quality'],
        searchType: Parameters<typeof IH.findItem>[1],
        msg_field: {type: string; critter: string},
        jsonTranslation?: object
    ): ItemDataSource[] {
        const result: ItemDataSource[] = []

        for(const item of IH.getArray(array)) {
            let name = item._TEXT;

            if (name === 'Deezz') name = 'Derezz';
            else if (name === 'Shiva Arms') name += ' (Pair)';
            else if (name === 'Regenerate') name = 'Regeneration';

            if (name === 'Innate Spell' && item.$?.select) {
                let spellName = item.$.select;
                const translatedName = IH.MapNameToTranslation(jsonTranslation, spellName);
                const foundSpell = IH.findItem(translatedName, 'spell');

                if (foundSpell)
                    result.push(foundSpell.toObject());
                else
                    console.log(`[Spell Missing]\nCritter: ${msg_field.critter}\nSpell: ${spellName}`);
            }

            const translatedName = IH.MapNameToTranslation(jsonTranslation, name);
            const foundItem = IH.findItem(translatedName, searchType);

            if (!foundItem) {
                console.log(
                    `[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`
                );
                continue;
            }

            let itemBase = foundItem.toObject();

            if (item.$ && "rating" in item.$ && item.$.rating) {
                const rating = +item.$.rating;

                if ('rating' in itemBase.system) {
                    itemBase.system.rating = rating;
                } else if ('technology' in itemBase.system) {
                    itemBase.system.technology.rating = rating;
                }
            }

            if (item.$ && "select" in item.$ && item.$.select)
                itemBase.name += ` (${item.$.select})`

            if (msg_field.type === 'Optional Power' && 'optional' in itemBase.system)
                itemBase.system.optional = 'disabled_option';

            result.push(itemBase);
        }
        
        return result;
    }

    override Parse(
        jsonData: Metatype,
        spirit: SpiritActorData,
        jsonTranslation?: object | undefined,
    ): SpiritActorData {
        spirit.name = jsonData.name._TEXT;
        spirit.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        switch (jsonData.category?._TEXT) {
            case "Insect Spirits":
                spirit.system.spiritType = jsonData.name._TEXT.split(/[ /]/)[0].toLowerCase() as Shadowrun.SpiritType;
                break;

            case "Toxic Spirits": {
                const specialMapping = new Map<string, Shadowrun.SpiritType>([
                    ['Noxious Spirit', 'toxic_air'], ['Abomination Spirit', 'toxic_beasts'],
                    ['Barren Spirit', 'toxic_earth'], ['Nuclear Spirit', 'toxic_fire'],
                    ['Plague Spirit', 'toxic_man'], ['Sludge Spirit', 'toxic_water']
                ]);

                spirit.system.spiritType = specialMapping.get(jsonData.name._TEXT) ?? "";
                break;
            }

            case "Ritual":
                const attrMap = {
                    body: "bodmin",     agility: "agimin",  reaction: "reamin",
                    strength: "strmin", charisma: "chamin", intuition: "intmin",
                    logic: "logmin",    willpower: "wilmin"
                } as const;

                for (const [attr, key] of Object.entries(attrMap)) {
                    spirit.system.attributes[attr].base = +jsonData[key]._TEXT;
                }

                spirit.system.spiritType = ["Watcher", "Corps Cadavre"].includes(jsonData.name._TEXT)
                    ? jsonData.name._TEXT.replace(" ", "_").toLowerCase() : "homunculus";
                break;

            default:
                spirit.system.spiritType = jsonData.name._TEXT
                    .replace(" Spirit", "").replace("Spirit of ", "")
                    .replace(" (Demon)", "").replace(/[\s\-]/g, "_")
                    .split("/")[0].toLowerCase();
        }

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => +v || 0);
            spirit.system.movement.run = { value, mult, base } as Shadowrun.Movement['run'];
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => +v || 0);
            spirit.system.movement.walk = { value, mult, base } as Shadowrun.Movement['walk'];
        }
        spirit.system.movement.sprint = +(jsonData.sprint?._TEXT.split('/')[0] ?? 0);

        //@ts-expect-error
        spirit.items = [
            ...this.getItems(jsonData.powers?.power, ['critter_power', 'sprite_power'], {type: 'Power', critter: spirit.name}, jsonTranslation),
        ]

        if (jsonData.qualities) {
            //@ts-expect-error
            spirit.items.concat([
                ...this.getItems(jsonData.qualities?.positive?.quality, ['quality'], {type: 'Quality', critter: spirit.name}, jsonTranslation),
                ...this.getItems(jsonData.qualities?.negative?.quality, ['quality'], {type: 'Quality', critter: spirit.name}, jsonTranslation)
            ])
        }

        if (jsonData.optionalpowers) {
            const optionalPowers = jsonData.optionalpowers.optionalpower;
            //@ts-expect-error
            spirit.items = spirit.items.concat([
                ...this.getItems(optionalPowers, ['critter_power', 'sprite_power'], {type: 'Optional Power', critter: spirit.name}, jsonTranslation),
            ]);
        }

        if (jsonData.bonus?.optionalpowers?.optionalpower) {
            const optionalPowers = jsonData.bonus.optionalpowers.optionalpower;
            //@ts-expect-error
            spirit.items = spirit.items.concat([
                ...this.getItems(optionalPowers, ['critter_power', 'sprite_power'], {type: 'Optional Power', critter: spirit.name}, jsonTranslation),
            ]);
        }

        spirit.system.is_npc = true;

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, spirit.name);
            spirit.system.description.source = `${jsonData.source._TEXT} ${page}`;
            spirit.name = IH.MapNameToTranslation(jsonTranslation, spirit.name);
        }

        return spirit;
    }
}
