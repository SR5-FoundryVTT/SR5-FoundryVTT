import { ImportHelper } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
import { getArray } from '../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js';
import { DataDefaults } from '../../../../data/DataDefaults';
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

    private getBioware(jsonData: object, jsonTranslation?: object | undefined): any {
        const biowareData = (ImportHelper.ObjectValue(jsonData, 'biowares') as { bioware: object | object[] })?.bioware;

        if (!biowareData) return [];

        return getArray(biowareData)
            .map((item: { _TEXT: any; name: { _TEXT: any }; $?: { rating?: any };}) => {
                let name = item._TEXT ?? item.name?._TEXT;

                if (name === 'Deezz') {
                    name = 'Derezz';
                }

                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, name);
                const foundItem = ImportHelper.findItem((item) => {
                    if (!item || !item.name) return false;
                    return (item.type === 'bioware') && item.name === translatedName;
                });

                if (!foundItem) {
                    console.log(
                        `[Bioware Missing] Critter: ${ImportHelper.StringValue(jsonData, 'name')}, Bioware: ${name}`
                    );
                    return null;
                }

                let itemBase = foundItem.toObject();

                if (item.$?.rating && 'technology' in itemBase.system) {
                    itemBase.system.technology.rating = +item.$.rating || 0;
                }

                return itemBase;
            })
            .filter(Boolean);
    }

    private getComplexForm(jsonData: object, jsonTranslation?: object | undefined): any {
        const complexFormData = (ImportHelper.ObjectValue(jsonData, 'complexforms') as { complexform: object | object[] })?.complexform;

        if (!complexFormData) return [];

        return getArray(complexFormData)
            .map((item: { _TEXT: any; name: { _TEXT: any }; $?: { rating?: any };}) => {
                let name = item._TEXT ?? item.name?._TEXT;

                if (name === 'Deezz') {
                    name = 'Derezz';
                }

                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, name);
                const foundItem = ImportHelper.findItem((item) => {
                    if (!item || !item.name) return false;
                    return (item.type === 'complex_form' || item.type === 'sprite_power') && item.name === translatedName;
                });

                if (!foundItem) {
                    console.log(
                        `[Complex Form Missing] Critter: ${ImportHelper.StringValue(jsonData, 'name')}, Complex Form: ${name}`
                    );
                    return null;
                }

                return foundItem.toObject();
            })
            .filter(Boolean);
    }

    private getQualities(jsonData: object, jsonTranslation?: object | undefined): any {
        const qualityData = ImportHelper.ObjectValue(jsonData, 'qualities') as {
            positive?: { quality: object | object[] };
            negative?: { quality: object | object[] };
            quality?:  { quality: object | object[] };
        };

        if (!qualityData) return [];

        const getArray = (value?: object | object[]): object[] => {
            if (!value) return [];
            return Array.isArray(value) ? value : [value];
        };

        return [...getArray(qualityData.positive?.quality),
                ...getArray(qualityData.negative?.quality),
                ...getArray(qualityData.quality?.quality)]
            .map((item: { _TEXT: any; name: { _TEXT: any } }) => {
                let itemName = item._TEXT ?? item.name?._TEXT;

                if (itemName === 'Shiva Arms') {
                    itemName += ' (Pair)';
                }

                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, itemName);
                const foundItem = ImportHelper.findItem((item) => {
                    if (!item || !item.name) return false;
                    return item.type === 'quality' && item.name === translatedName;
                });

                if (!foundItem) {
                    console.log(
                        `[Quality Missing] Critter: ${ImportHelper.StringValue(jsonData, 'name')}, Quality: ${itemName}`
                    );

                    return null;
                }

                return foundItem.toObject();
            })
            .filter(Boolean);
    }

    private getPowers(jsonData: object, jsonTranslation?: object | undefined): any {
        const powerData = (ImportHelper.ObjectValue(jsonData, 'powers') as { power: object | object[] })?.power;

        if (!powerData) return [];

        return getArray(powerData)
            .map((item: { _TEXT: any; name: { _TEXT: any }; $?: { rating?: any };}) => {
                let name = item._TEXT ?? item.name?._TEXT;

                if (name === 'Regenerate') {
                    name = 'Regeneration';
                }

                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, name);
                const foundItem = ImportHelper.findItem((item) => {
                    if (!item || !item.name) return false;
                    return (item.type === 'critter_power' || item.type === 'sprite_power') && item.name === translatedName;
                });

                if (!foundItem) {
                    console.debug(
                        `[Power Missing] Critter: ${ImportHelper.StringValue(jsonData, 'name')}, Power: ${name}`
                    );
                    return this.createPower(item, jsonTranslation);
                }

                let itemBase = foundItem.toObject();

                if (item.$?.rating && 'rating' in itemBase.system) {
                    itemBase.system.rating = +item.$.rating || 0;
                }

                return itemBase;
            })
            .filter(Boolean);
    }

    private setSkills(actor: CharacterActorData, jsonData: object): undefined {
        const skills = ImportHelper.ObjectValue(jsonData, 'skills') as {
            skill: object | object[];
            group: object | object[];
            knowledge: object | object[];
        };
        if (!skills) return;

        let flight = actor.system.skills.active.running;
        flight.attribute = 'agility';
        flight.name = 'flight';

        getArray(skills.skill).forEach((skill) => {
            const rawName = skill._TEXT ?? skill.name?._TEXT;
            if (!rawName) return;
    
            let name = rawName
                .toLowerCase()
                .trim()
                .replace(/\s/g, '_')
                .replace(/-/g, '_');
    
            // Normalize special cases
            if (name.includes('exotic') && name.includes('_weapon')) {
                name = name.replace('_weapon', '');
            }
            if (name.includes('exotic') && name.includes('_ranged')) {
                name = name.replace('_ranged', '_range');
            }
            if (name === 'pilot_watercraft') {
                name = 'pilot_water_craft';
            }
            if (name === 'thrown_weapons') {
                name = 'throwing_weapons';
            }
            if (name === 'shadowing' || name === 'infiltration') {
                name = 'sneaking';
            }
    
            const skillValue = +(skill.$?.rating ?? 0);
    
            const parsedSkill = actor.system.skills.active[name];
            if (parsedSkill) {
                parsedSkill.base = skillValue;
            } else if (name === 'flight') {
                actor.system.skills.active[name] = flight;
                flight.base = skillValue;
            } else {
                console.log(`[Skill Missing] Actor: ${actor.name}, Skill: ${name}`);
            }
        });
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
        actor.items = [...this.getPowers(jsonData, jsonTranslation),
                       ...this.getQualities(jsonData, jsonTranslation),
                       ...this.getComplexForm(jsonData, jsonTranslation),
                       ...this.getBioware(jsonData, jsonTranslation),];

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
