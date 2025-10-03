import { SystemType } from "../Parser";
import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { DataDefaults } from "src/module/data/DataDefaults";
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class CritterParser extends MetatypeParserBase<'character'> {
    protected readonly parseType = 'character';

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

    private setSkills(system: SystemType<'character'>, jsonData: Metatype): void {
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
                system.skills.active[name] = DataDefaults.createData('skill_field', { attribute: "agility", base: skillValue });
            } else {
                console.log(`[Skill Missing] Actor: ${jsonData.name._TEXT}\nSkill: ${name}`);
            }
        };

        if (skills.group) {
            const groups = IH.getArray(skills.group).reduce<Record<string, number>>((acc, item) => {
                acc[item._TEXT] = +(item.$?.rating ?? 0);
                return acc;
            }, {});

            Object.entries(system.skills.active).forEach(([_, skill]) => {
                if (Object.keys(groups).includes(skill.group)) {
                    skill.base = (skill.base ?? 0) + groups[skill.group];
                }
            });
        }

        if (skills.knowledge) {
            IH.getArray(skills.knowledge).forEach((skill) => {
                const name = this.normalizeSkillName(skill._TEXT);
                const skillValue = Number(skill.$.rating) || 0;
                const skillCategory = skill.$.category.toLowerCase();

                system.skills.knowledge[skillCategory].value[name] = DataDefaults.createData('skill_field', { name: skill._TEXT, base: skillValue });
            });
        }
    }

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        system.attributes.body.base = Number(jsonData.bodmin._TEXT) || 0;
        system.attributes.agility.base = Number(jsonData.agimin._TEXT) || 0;
        system.attributes.reaction.base = Number(jsonData.reamin._TEXT) || 0;
        system.attributes.strength.base = Number(jsonData.strmin._TEXT) || 0;
        system.attributes.charisma.base = Number(jsonData.chamin._TEXT) || 0;
        system.attributes.intuition.base = Number(jsonData.intmin._TEXT) || 0;
        system.attributes.logic.base = Number(jsonData.logmin._TEXT) || 0;
        system.attributes.willpower.base = Number(jsonData.wilmin._TEXT) || 0;
        system.attributes.edge.base = Number(jsonData.edgmin._TEXT) || 0;
        system.attributes.magic.base = Number(jsonData.magmin?._TEXT) || 0;
        system.attributes.resonance.base = Number(jsonData.resmin?._TEXT) || 0;

        if (system.attributes.magic.base)
            system.special = 'magic';
        else if (system.attributes.resonance.base)
            system.special = 'resonance';

        system.karma.value = Number(jsonData.karma?._TEXT || 0);

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => Number(v) || 0);
            system.movement.run = DataDefaults.createData('movement_field', { value, mult, base });
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => Number(v) || 0);
            system.movement.walk = DataDefaults.createData('movement_field', { value, mult, base });
        }
        system.movement.sprint = Number(jsonData.sprint?._TEXT.split('/')[0]) || 0;

        this.setSkills(system, jsonData);

        system.is_npc = true;
        system.is_critter = true;

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
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

        const allComplexForm = await IH.findItems('Complex_Form', complex);
        const allSpells = await IH.findItems('Spell', spells);
        const allPowers = await IH.findItems('Critter_Power', power);
        const allQualities = await IH.findItems('Quality', [...quality, ...bioware]);
        const allBiowares = await IH.findItems('Ware', bioware);

        const name = jsonData.name._TEXT;
        return [
            ...this.getMetatypeItems(allSpells, spellsData, { type: 'Spell', critter: name }),
            ...this.getMetatypeItems(allPowers, jsonData.powers?.power, { type: 'Power', critter: name }),
            ...this.getMetatypeItems(allBiowares, jsonData.biowares?.bioware, { type: 'Bioware', critter: name }),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Power', critter: name }),
            ...this.getMetatypeItems(allQualities, qualities?.positive?.quality, { type: 'Quality', critter: name }),
            ...this.getMetatypeItems(allQualities, qualities?.negative?.quality, { type: 'Quality', critter: name }),
            ...this.getMetatypeItems(allComplexForm, jsonData.complexforms?.complexform, { type: 'Complex Form', critter: name }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = game.i18n.localize("TYPES.Actor.critter");
        const folderName = IH.getTranslatedCategory('metatypes', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
