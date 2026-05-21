import { Constants } from '../../importer/Constants';
import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { DataDefaults } from '@/module/data/DataDefaults';
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { KnowledgeSkillCategory } from "src/module/types/template/Skills";

export class CritterParser extends MetatypeParserBase<'character'> {
    protected readonly parseType = 'character';

    private createKnowledgeSkillItems(knowledgeList: NonNullable<Metatype['skills']>['knowledge']): Item.Source[] {
        const result: Item.Source[] = [];

        for (const skill of IH.getArray(knowledgeList)) {
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

            result.push(item as Item.Source);
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
        this.applyMovement(system, jsonData);
        this.parseInitiative(system, jsonData, { mode: 'meatspace' });

        system.is_npc = true;
        system.is_critter = true;

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const { name, powers, skills, biowares, complexforms } = jsonData;

        const qualities = this.mergeLists(
            jsonData.qualities?.positive?.quality,
            jsonData.qualities?.negative?.quality
        );
        const optionalPowers = this.mergeLists(
            jsonData.optionalpowers?.optionalpower,
            jsonData.bonus?.optionalpowers?.optionalpower
        );

        const spellsData = IH.getArray(jsonData.powers?.power)
            .filter(s => s._TEXT === "Innate Spell" && s.$?.select)
            .map(s => ({ _TEXT: s.$?.select })) as { _TEXT: string }[];

        const spellList = this.getNamedList(spellsData);
        const qualitiesList = this.getNamedList(qualities);
        const biowareList = this.getNamedList(biowares?.bioware);
        const complexList = this.getNamedList(complexforms?.complexform);
        const powerList = this.getNamedList(powers?.power, optionalPowers);
        const skillList = this.getNamedList(skills?.skill, skills?.group);

        const allSpells = await IH.findItems('Spell', spellList);
        const allSkills = await IH.findItems('Skill', skillList);
        const allBiowares = await IH.findItems('Ware', biowareList);
        const allPowers = await IH.findItems('Critter_Power', powerList);
        const allComplexForm = await IH.findItems('Complex_Form', complexList);
        const knowledgeSkillItems = this.createKnowledgeSkillItems(skills?.knowledge);
        const allQualities = await IH.findItems('Quality', [...qualitiesList, ...biowareList]);

        const critterName = name._TEXT;
        const naturalWeapons = this.getNaturalWeapons(
            this.mergeLists(powers?.power, optionalPowers), { actorName: critterName }
        );

        return [
            ...naturalWeapons,
            ...knowledgeSkillItems,
            ...this.getMetatypeItems(allSpells, spellsData, { type: 'Spell', critter: critterName }),
            ...this.getMetatypeItems(allPowers, optionalPowers, { type: 'Power', critter: critterName }),
            ...this.getMetatypeItems(allQualities, qualities, { type: 'Quality', critter: critterName }),
            ...this.getMetatypeItems(allPowers, powers?.power, { type: 'Power', critter: critterName }),
            ...this.getMetatypeItems(allSkills, skills?.skill, { type: 'Skill', critter: critterName }),
            ...this.getMetatypeItems(allSkills, skills?.group, { type: 'Skill Group', critter: critterName }),
            ...this.getMetatypeItems(allBiowares, biowares?.bioware, { type: 'Bioware', critter: critterName }),
            ...this.getMetatypeItems(allComplexForm, complexforms?.complexform, { type: 'Complex Form', critter: critterName }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = "Critter";
        const folderName = IH.getTranslatedCategory('metatypes', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
