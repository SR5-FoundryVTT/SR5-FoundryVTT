import { ImportHelper as IH } from '../../helper/ImportHelper';
import { MetatypeParserBase } from './MetatypeParserBase';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import CharacterActorData = Shadowrun.CharacterActorData;
import { Metatype } from "../../schema/MetatypeSchema";

export class CritterParser extends MetatypeParserBase<CharacterActorData> {

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

    override async Parse(jsonData: Metatype, actor: CharacterActorData, jsonTranslation?: object): Promise<CharacterActorData> {
        const qualities = jsonData.qualities || undefined;
        const optionalpowers = jsonData.optionalpowers || undefined;

        const spells = IH.getArray(jsonData.powers?.power)
                            .filter(spell => spell._TEXT === "Innate Spell" && spell.$?.select)
                            .map(item => ({ _TEXT: IH.MapNameToTranslation(jsonTranslation, item.$?.select)}));

        const allItemsName = [
            ...IH.getArray(jsonData.biowares?.bioware).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
        ];
        const allTraitsName = [
            ...IH.getArray(jsonData.powers?.power).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(qualities?.positive?.quality).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(qualities?.negative?.quality).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(optionalpowers?.optionalpower).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
        ];
        const allMagicName = [
            ...IH.getArray(jsonData.complexforms?.complexform).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(spells).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
        ];

        // Give it time to search
        const allPromises = [
            IH.findItem('Item', allItemsName),
            IH.findItem('Trait', allTraitsName),
            IH.findItem('Magic', allMagicName),
        ];

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

        this.setSkills(actor, jsonData);

        actor.system.is_npc = true;
        actor.system.is_critter = true;

        const [itemsObj, traitsObj, magicObj] = await Promise.all(allPromises);

        //@ts-expect-error
        actor.items = [
            ...this.getItems(magicObj,  spells, {type: 'Spell', critter: actor.name}, jsonTranslation),
            ...this.getItems(traitsObj, jsonData.powers?.power, {type: 'Power', critter: actor.name}, jsonTranslation),
            ...this.getItems(itemsObj,  jsonData.biowares?.bioware, {type: 'Bioware', critter: actor.name}, jsonTranslation),
            ...this.getItems(traitsObj, optionalpowers?.optionalpower, {type: 'Power', critter: actor.name}, jsonTranslation),
            ...this.getItems(traitsObj, qualities?.positive?.quality, {type: 'Quality', critter: actor.name}, jsonTranslation),
            ...this.getItems(traitsObj, qualities?.negative?.quality, {type: 'Quality', critter: actor.name}, jsonTranslation),
            ...this.getItems(magicObj,  jsonData.complexforms?.complexform, {type: 'Complex Form', critter: actor.name}, jsonTranslation),
        ];

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, actor.name);
            actor.system.description.source = `${jsonData.source._TEXT} ${page}`;
            actor.name = IH.MapNameToTranslation(jsonTranslation, actor.name);
        }

        return actor;
    }
}
