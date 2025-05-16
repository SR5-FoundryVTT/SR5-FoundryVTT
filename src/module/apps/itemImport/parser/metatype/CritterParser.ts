import { Metatype } from "../../schema/MetatypeSchema";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import { TranslationHelper as TH, TranslationType } from '../../helper/TranslationHelper';
import CharacterActorData = Shadowrun.CharacterActorData;

export class CritterParser extends MetatypeParserBase<CharacterActorData> {
    protected override parseType: string = 'character';

    private normalizeSkillName(rawName: string): string {
        let name = rawName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_');
    
        if (name.includes('exotic') && name.includes('_weapon'))
            name = name.replace('_weapon', '');
        if (name.includes('exotic') && name.includes('_ranged'))
            name = name.replace('_ranged', '_range');

        if (name === 'pilot_watercraft')
            name = 'pilot_water_craft';
    
        return name;
    }

    private setSkills(system: CharacterActorData['system'], jsonData: Metatype): void {
        const skills = jsonData.skills;
        if (!skills) return;

        for (const skill of skills.skill) {
            const name = this.normalizeSkillName(skill._TEXT);
            const skillValue = +(skill.$?.rating ?? 0);
    
            const parsedSkill = system.skills.active[name];
            if (parsedSkill) {
                parsedSkill.base = skillValue;
                if (skill?.$?.spec) parsedSkill.specs.push(skill.$.spec);
            } else if (name === 'flight') {
                system.skills.active[name] = (() => {
                    const skillField: any = { attribute: "agility", group: "Athletics", base: skillValue };
                    _mergeWithMissingSkillFields(skillField);
                    return skillField;
                })() as Shadowrun.SkillField;
            } else {
                console.log(`[Skill Missing] Actor: ${jsonData.name._TEXT}\nSkill: ${name}`);
            }
        };

        if (skills.group) {
            const groups = IH.getArray(skills.group).reduce((acc, item) => {
                acc[item._TEXT] = +(item.$?.rating ?? 0);
                return acc;
            }, {} as Record<string, number>);

            Object.entries(system.skills.active).forEach(([_, skill]) => {
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

                system.skills.knowledge[skillCategory].value[name] = (() => {
                    const skillField: any = { name: skill._TEXT, base: skillValue };
                    _mergeWithMissingSkillFields(skillField);
                    return skillField;
                })() as Shadowrun.SkillField;
            });
        }
    }

    protected override getSystem(jsonData: Metatype): CharacterActorData['system'] {
        const system = this.getBaseSystem();

        system.attributes["body"].base = Number(jsonData.bodmin._TEXT) || 0;
        system.attributes["agility"].base = Number(jsonData.agimin._TEXT) || 0;
        system.attributes["reaction"].base = Number(jsonData.reamin._TEXT) || 0;
        system.attributes["strength"].base = Number(jsonData.strmin._TEXT) || 0;
        system.attributes["charisma"].base = Number(jsonData.chamin._TEXT) || 0;
        system.attributes["intuition"].base = Number(jsonData.intmin._TEXT) || 0;
        system.attributes["logic"].base = Number(jsonData.logmin._TEXT) || 0;
        system.attributes["willpower"].base = Number(jsonData.wilmin._TEXT) || 0;
        system.attributes["edge"].base = Number(jsonData.edgmin._TEXT) || 0;
        system.attributes["magic"].base = Number(jsonData.magmin?._TEXT) || 0;
        system.attributes["resonance"].base = Number(jsonData.resmin?._TEXT) || 0;

        if (system.attributes['magic'].base)
            system.special = 'magic';
        else if (system.attributes['resonance'].base)
            system.special = 'resonance';

        // @ts-expect-error
        system.karma.value = +(jsonData.karma?._TEXT ?? 0);

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => Number(v) || 0);
            system.movement.run = { value, mult, base } as Shadowrun.Movement['run'];
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => Number(v) || 0);
            system.movement.walk = { value, mult, base } as Shadowrun.Movement['walk'];
        }
        system.movement.sprint = Number(jsonData.sprint?._TEXT.split('/')[0]) || 0;

        this.setSkills(system, jsonData);

        system.is_npc = true;
        system.is_critter = true;

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Shadowrun.ShadowrunItemData[]> {
        const optionalpowers = jsonData.optionalpowers || undefined;
        const qualities = jsonData.qualities || undefined;

        const spellsData = IH.getArray(jsonData.powers?.power)
            .filter(s => s._TEXT === "Innate Spell" && s.$?.select)
            .map(s => ({ _TEXT: s.$?.select })) as { _TEXT: string }[];

        const bioware = IH.getArray(jsonData.biowares?.bioware).map(v => v._TEXT);
        const complex = IH.getArray(jsonData.complexforms?.complexform).map(v => v._TEXT);
        const spells = spellsData.map(v => v._TEXT);
        const power = [
            ...IH.getArray(jsonData.powers?.power),
            ...IH.getArray(optionalpowers?.optionalpower)
        ].map(v => v._TEXT);
        const quality = [
            ...IH.getArray(qualities?.positive?.quality),
            ...IH.getArray(qualities?.negative?.quality)
        ].map(v => v._TEXT);

        const translationMap: Record<string, string> = {};
        const mapTranslation = (names: string[], type: TranslationType) =>
            names.forEach(name => translationMap[name] = TH.getTranslation(name, { type }));

        mapTranslation(bioware, 'bioware');
        mapTranslation(complex, 'complexform');
        mapTranslation(quality, 'quality');
        mapTranslation(spells, 'spell');
        mapTranslation(power, 'power');

        const [magicObj, traitsObj] = await Promise.all([
            IH.findItem('Magic', [...complex, ...spells].map(name => translationMap[name])),
            IH.findItem('Trait', [...bioware, ...quality, ...power].map(name => translationMap[name])),
        ]);

        const name = jsonData.name._TEXT;
        return [
            ...this.getMetatypeItems(magicObj, spellsData, { type: 'Spell', critter: name }, translationMap),
            ...this.getMetatypeItems(traitsObj, jsonData.powers?.power, { type: 'Power', critter: name }, translationMap),
            ...this.getMetatypeItems(traitsObj, jsonData.biowares?.bioware, { type: 'Bioware', critter: name }, translationMap),
            ...this.getMetatypeItems(traitsObj, optionalpowers?.optionalpower, { type: 'Power', critter: name }, translationMap),
            ...this.getMetatypeItems(traitsObj, qualities?.positive?.quality, { type: 'Quality', critter: name }, translationMap),
            ...this.getMetatypeItems(traitsObj, qualities?.negative?.quality, { type: 'Quality', critter: name }, translationMap),
            ...this.getMetatypeItems(magicObj, jsonData.complexforms?.complexform, { type: 'Complex Form', critter: name }, translationMap),
        ];
    }

    protected override async getFolder(jsonData: Metatype): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = TH.getTranslation("Critter", {type: 'category'});
        const folderName = TH.getTranslation(category, {type: 'category'});

        return IH.getFolder('Critter', rootFolder, folderName);
    }
}
