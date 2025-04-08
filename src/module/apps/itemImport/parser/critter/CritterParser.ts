import { ImportHelper } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
import { getArray } from '../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js';
import { DataDefaults } from '../../../../data/DataDefaults';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import CharacterActorData = Shadowrun.CharacterActorData;
import { SR5 } from '../../../../config';

export class CritterParser extends ActorParserBase<CharacterActorData> {
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
        itemJson.name = ImportHelper.MapNameToTranslation(jsonTranslation, name)
        itemJson.system.importFlags = this.genImportFlags(name, "critter_power", '');

        return itemJson;
    }

    private normalizeSkillName(rawName: string): string {
        let name = rawName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_');
    
        if (name.includes('exotic') && name.includes('_weapon')) {
            name = name.replace('_weapon', '');
        }
        if (name.includes('exotic') && name.includes('_ranged')) {
            name = name.replace('_ranged', '_range');
        }

        if (name === 'shadowing' || name === 'infiltration') {
            name = 'sneaking';
        }
        if (name === 'pilot_watercraft') {
            name = 'pilot_water_craft';
        }
        if (name === 'thrown_weapons') {
            name = 'throwing_weapons';
        }
    
        return name;
    }

    private getObjectByType(
        jsonData: object,
        settings: {basePath: string, subPaths: string[]; types: string[]},
        jsonTranslation?: object
    ): object[] {
        const rawData = ImportHelper.ObjectValue(jsonData, settings.basePath);
        if (!rawData) return [];

        let allItems: object[] = [];
        for (const path of settings.subPaths) {
            const pathParts = path.split('.');
            let current: any = rawData;
            for (const part of pathParts) {
                if (!current[part]) {
                    current = undefined;
                    break;
                }
                current = current[part];
            }

            allItems.push(...getArray(current));
        }

        return getArray(allItems)
            .map((item: { _TEXT: any; $?: { rating?: any; select?: any };}) => {
                let name = item._TEXT;

                if (name === 'Deezz') name = 'Derezz';
                else if (name === 'Shiva Arms') name += ' (Pair)';
                else if (name === 'Regenerate') name = 'Regeneration';

                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, name);
                const foundItem = ImportHelper.findItem((item) => {
                    return !!item?.name && settings.types.includes(item.type) && item.name === translatedName;
                });

                if (!foundItem) {
                    console.debug(
                        `[${settings.basePath} Missing] Critter: ${ImportHelper.StringValue(jsonData, 'name')}, ${settings.basePath}: ${name}`
                    );
                    return settings.basePath === 'powers' ? this.createPower(item, jsonTranslation) : null;
                }

                let itemBase = foundItem.toObject();

                if (item.$?.rating) {
                    const rating = +item.$.rating || 0;

                    if ('rating' in itemBase.system) {
                        itemBase.system.rating = rating;
                    } else if ('technology' in itemBase.system) {
                        itemBase.system.technology.rating = rating;
                    }
                }

                return itemBase;
            })
            .filter(Boolean);
    }

    private setSkills(actor: CharacterActorData, jsonData: object): undefined {
        const skills = ImportHelper.ObjectValue(jsonData, 'skills') as {
            skill?: object | object[];
            group?: object | object[];
            knowledge?: object | object[];
        };
        if (!skills) return;

        getArray(skills.skill).forEach((skill: {_TEXT: string; $: { rating: any; select?: any; spec?: any };}) => {
            const name = this.normalizeSkillName(skill._TEXT);
            const skillValue = +skill.$.rating;
    
            const parsedSkill = actor.system.skills.active[name];
            if (parsedSkill) {
                parsedSkill.base = skillValue;
                if (skill.$.spec) parsedSkill.specs += skill.$.spec;
            } else if (name === 'flight') {
                actor.system.skills.active[name] = (() => {
                    const skillField: any = { attribute: "agility", group: "Athletics", base: skillValue };
                    _mergeWithMissingSkillFields(skillField);
                    return skillField;
                })() as Shadowrun.SkillField;
            } else {
                console.debug(`[Skill Missing] Actor: ${actor.name}, Skill: ${name}`);
            }
        });

        if (skills.group) {
            const groups = getArray(skills.group).reduce((acc, item) => {
                acc[item._TEXT] = item.$.rating;
                return acc;
            }, {} as Record<string, number>);

            Object.entries(actor.system.skills.active).forEach(([_, skill]) => {
                if ('group' in skill && typeof skill.group === 'string' && Object.keys(groups).includes(skill.group)) {
                    skill.base = (skill.base ?? 0) + groups[skill.group];
                }
            });
        }

        if (skills.knowledge) {
            getArray(skills.knowledge).forEach((skill: {_TEXT: string; $: { category: any; rating: any; };}) => {
                const name = this.normalizeSkillName(skill._TEXT);
                const skillValue = +skill.$.rating;
                const skillCategory = skill.$.category.toLowerCase();
                
                actor.system.skills.knowledge[skillCategory].value[name] = (() => {
                    const skillField: any = { name: skill._TEXT, base: skillValue };
                    _mergeWithMissingSkillFields(skillField);
                    return skillField;
                })() as Shadowrun.SkillField;
            });
        }
    }

    override Parse(
        jsonData: object,
        actor: CharacterActorData,
        jsonTranslation?: object | undefined,
    ): CharacterActorData {
        actor.name = ImportHelper.StringValue(jsonData, 'name');
        actor.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')}
                                           ${ImportHelper.StringValue(jsonData,'page',)}`;

        const attributeKeys = {
            body: 'bodmin',
            agility: 'agimin',
            reaction: 'reamin',
            strength: 'strmin',
            charisma: 'chamin',
            intuition: 'intmin',
            logic: 'logmin',
            willpower: 'wilmin',
            edge: 'edgmin',
            magic: 'magmin',
            resonance: 'resmin',
        };

        for (const [key, jsonKey] of Object.entries(attributeKeys)) {
            actor.system.attributes[key].base = +ImportHelper.StringValue(jsonData, jsonKey, '0');
        }

        if (actor.system.attributes['magic'].base)
            actor.system.special = 'magic';

        if (actor.system.attributes['resonance'].base)
            actor.system.special = 'resonance';

        // @ts-expect-error
        actor.system.karma.value = +ImportHelper.StringValue(jsonData, 'karma', '0');

        ['run', 'walk'].forEach((key) => {
            const combinedValues = ImportHelper.StringValue(jsonData, key, '0');

            if (!combinedValues) return;

            const [value, mult, base] = combinedValues.split('/').map((v) => +v || 0);
            actor.system.movement[key] = { value, mult, base };
        });
        actor.system.movement.sprint = +ImportHelper.StringValue(jsonData, 'sprint', '0').split('/')[0];

        //@ts-expect-error
        actor.items = [
            ...this.getObjectByType(jsonData, {basePath: 'biowares', subPaths: ['bioware'], types: ['bioware']}, jsonTranslation),
            ...this.getObjectByType(jsonData, {basePath: 'powers', subPaths: ['power'], types: ['critter_power', 'sprite_power']}, jsonTranslation),
            ...this.getObjectByType(jsonData, {basePath: 'complexforms', subPaths: ['complexform'], types: ['complex_form', 'sprite_power']}, jsonTranslation),
            ...this.getObjectByType(jsonData, {basePath: 'qualities', subPaths: ['quality', 'positive.quality', 'negative.quality'], types: ['quality']}, jsonTranslation),
        ];

        this.setSkills(actor, jsonData);

        actor.system.is_npc = true;
        actor.system.is_critter = true;

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            actor.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            actor.system.description.source = `${ImportHelper.StringValue(jsonData, 'source',)}
                                               ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return actor;
    }
}
