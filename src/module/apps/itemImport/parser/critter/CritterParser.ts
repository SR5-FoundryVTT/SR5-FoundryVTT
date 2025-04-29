import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
import { DataDefaults } from '../../../../data/DataDefaults';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import CharacterActorData = Shadowrun.CharacterActorData;
import { SR5 } from '../../../../config';
import { Metatype } from "../../schema/MetatypeSchema";
import { OneOrMany } from "../../schema/Types";
import { json } from 'stream/consumers';
import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

export class CritterParser extends ActorParserBase<CharacterActorData> {

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

    private getItems(
        array: undefined | OneOrMany<{$?: { select?: string; rating?: string; removable?: string; }; _TEXT: string }>,
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

    private setSkills(actor: CharacterActorData, jsonData: Metatype): void {
        const skills = jsonData.skills;
        if (!skills) return;

        for (const skill of skills.skill) {
            const name = this.normalizeSkillName(skill._TEXT);
            const skillValue = +(skill.$?.rating ?? 0);
    
            const parsedSkill = actor.system.skills.active[name];
            if (parsedSkill) {
                parsedSkill.base = skillValue;
                if (skill?.$?.spec) parsedSkill.specs.push(skill.$.spec);
            } else if (name === 'flight') {
                actor.system.skills.active[name] = (() => {
                    const skillField: any = { attribute: "agility", group: "Athletics", base: skillValue };
                    _mergeWithMissingSkillFields(skillField);
                    return skillField;
                })() as Shadowrun.SkillField;
            } else {
                console.log(`[Skill Missing] Actor: ${actor.name}\nSkill: ${name}`);
            }
        };

        if (skills.group) {
            const groups = IH.getArray(skills.group).reduce((acc, item) => {
                acc[item._TEXT] = +(item.$?.rating ?? 0);
                return acc;
            }, {} as Record<string, number>);

            Object.entries(actor.system.skills.active).forEach(([_, skill]) => {
                if ('group' in skill && typeof skill.group === 'string' && Object.keys(groups).includes(skill.group)) {
                    skill.base = (skill.base ?? 0) + groups[skill.group];
                }
            });
        }

        if (skills.knowledge) {
            IH.getArray(skills.knowledge).forEach((skill) => {
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
        jsonData: Metatype,
        actor: CharacterActorData,
        jsonTranslation?: object | undefined,
    ): CharacterActorData {
        actor.name = jsonData.name._TEXT;
        actor.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        actor.system.attributes["body"].base = +jsonData.bodmin._TEXT;
        actor.system.attributes["agility"].base = +jsonData.agimin._TEXT;
        actor.system.attributes["reaction"].base = +jsonData.reamin._TEXT;
        actor.system.attributes["strength"].base = +jsonData.strmin._TEXT;
        actor.system.attributes["charisma"].base = +jsonData.chamin._TEXT;
        actor.system.attributes["intuition"].base = +jsonData.intmin._TEXT;
        actor.system.attributes["logic"].base = +jsonData.logmin._TEXT;
        actor.system.attributes["willpower"].base = +jsonData.wilmin._TEXT;
        actor.system.attributes["edge"].base = +jsonData.edgmin._TEXT;
        actor.system.attributes["magic"].base = +(jsonData.magmin?._TEXT ?? 0);
        actor.system.attributes["resonance"].base = +(jsonData.resmin?._TEXT ?? 0);

        if (actor.system.attributes['magic'].base)
            actor.system.special = 'magic';
        else if (actor.system.attributes['resonance'].base)
            actor.system.special = 'resonance';

        // @ts-expect-error
        actor.system.karma.value = +(jsonData.karma?._TEXT ?? 0);

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => +v || 0);
            actor.system.movement.run = { value, mult, base } as Shadowrun.Movement['run'];
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => +v || 0);
            actor.system.movement.walk = { value, mult, base } as Shadowrun.Movement['walk'];
        }
        actor.system.movement.sprint = +(jsonData.sprint?._TEXT.split('/')[0] ?? 0);

        //TODO optionalpowers
        //@ts-expect-error
        actor.items = [
            ...this.getItems(jsonData.biowares?.bioware, ['bioware'], {type: 'Bioware', critter: actor.name}, jsonTranslation),
            ...this.getItems(jsonData.powers?.power, ['critter_power', 'sprite_power'], {type: 'Power', critter: actor.name}, jsonTranslation),
            ...this.getItems(jsonData.complexforms?.complexform, ['complex_form'], {type: 'Complex Form', critter: actor.name}, jsonTranslation),
        ]
        
        if (jsonData.qualities) {
            //@ts-expect-error
            actor.items = actor.items.concat([
                ...this.getItems(jsonData.qualities.positive?.quality, ['quality'], {type: 'Quality', critter: actor.name}, jsonTranslation),
                ...this.getItems(jsonData.qualities.negative?.quality, ['quality'], {type: 'Quality', critter: actor.name}, jsonTranslation)
            ])
        }

        if (jsonData.optionalpowers) {
            const optionalPowers = jsonData.optionalpowers.optionalpower;
            //@ts-expect-error
            actor.items = actor.items.concat([
                ...this.getItems(optionalPowers, ['critter_power', 'sprite_power'], {type: 'Optional Power', critter: actor.name}, jsonTranslation),
            ]);
        }

        this.setSkills(actor, jsonData);

        actor.system.is_npc = true;
        actor.system.is_critter = true;

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, actor.name);
            actor.system.description.source = `${jsonData.source._TEXT} ${page}`;
            actor.name = IH.MapNameToTranslation(jsonTranslation, actor.name);
        }

        return actor;
    }
}
