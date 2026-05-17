import { Constants } from '../../importer/Constants';
import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { DataDefaults } from '@/module/data/DataDefaults';
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { KnowledgeSkillCategory } from "src/module/types/template/Skills";

export class CritterParser extends MetatypeParserBase<'character'> {
    protected readonly parseType = 'character';

    private createKnowledgeSkillItems(jsonData: Metatype): Item.Source[] {
        const result: Item.Source[] = [];

        for (const skill of IH.getArray(jsonData.skills?.knowledge)) {
            const name = skill._TEXT.trim();
            const category = skill.$.category.toLowerCase() as KnowledgeSkillCategory | 'interest';
            const knowledgeType = category === 'interest' ? 'interests' : category;

            const item: Item.CreateData<'skill'> = {
                _id: foundry.utils.randomID(),
                name: name,
                type: 'skill',
                img: `systems/shadowrun5e/dist/icons/skills/knowledge-${knowledgeType}.svg`,
                system: DataDefaults.baseSystemData('skill', {
                    type: 'skill',
                    skill: {
                        category: 'knowledge',
                        knowledgeType,
                        attribute: Constants.attributeTable[skill.$.attribute],
                        rating: Number(skill.$.rating ?? 0) || 0,
                    }
                }),
                effects: [],
            };

            result.push(item as unknown as Item.Source);
        }

        return result;
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

        if (jsonData.walk)
            system.movement.walk.base = Number(jsonData.walk._TEXT.split('/')[0] ?? 0);

        if (jsonData.run)
            system.movement.run.base = Number(jsonData.run._TEXT.split('/')[0] ?? 0);

        system.movement.sprint = Number(jsonData.sprint?._TEXT.split('/')[0] ?? 0);

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
        const skills = [
            ...IH.getArray(jsonData.skills?.skill).map(v => v._TEXT),
            ...IH.getArray(jsonData.skills?.group).map(v => v._TEXT)
        ];

        const allComplexForm = await IH.findItems('Complex_Form', complex);
        const allSpells = await IH.findItems('Spell', spells);
        const allPowers = await IH.findItems('Critter_Power', power);
        const allQualities = await IH.findItems('Quality', [...quality, ...bioware]);
        const allBiowares = await IH.findItems('Ware', bioware);
        const allSkills = await IH.findItems('Skill', skills);
        const knowledgeSkillItems = this.createKnowledgeSkillItems(jsonData);

        const name = jsonData.name._TEXT;
        return [
            ...knowledgeSkillItems,
            ...this.getMetatypeItems(allSpells, spellsData, { type: 'Spell', critter: name }),
            ...this.getMetatypeItems(allPowers, jsonData.powers?.power, { type: 'Power', critter: name }),
            ...this.getMetatypeItems(allSkills, jsonData.skills?.skill, { type: 'Skill', critter: name }),
            ...this.getMetatypeItems(allSkills, jsonData.skills?.group, { type: 'Skill Group', critter: name }),
            ...this.getMetatypeItems(allBiowares, jsonData.biowares?.bioware, { type: 'Bioware', critter: name }),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Power', critter: name }),
            ...this.getMetatypeItems(allQualities, qualities?.positive?.quality, { type: 'Quality', critter: name }),
            ...this.getMetatypeItems(allQualities, qualities?.negative?.quality, { type: 'Quality', critter: name }),
            ...this.getMetatypeItems(allComplexForm, jsonData.complexforms?.complexform, { type: 'Complex Form', critter: name }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = "Critter";
        const folderName = IH.getTranslatedCategory('metatypes', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
