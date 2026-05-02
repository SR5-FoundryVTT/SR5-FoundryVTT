import { DataImporter } from './DataImporter';
import { SkillParser } from '../parser/misc/SkillParser';
import { Skill, SkillsSchema } from '../schema/SkillsSchema';

export class SkillImporter extends DataImporter {
    public readonly files = ['skills.xml'] as const;

    async _parse(jsonObject: SkillsSchema): Promise<void> {
        const skills = await game.packs.get('shadowrun5e.sr5e-skills')?.getDocuments() ?? [];

        return SkillImporter.ParseItems<Skill>(
            [...jsonObject.skills.skill, ...jsonObject.knowledgeskills.skill],
            {
                compendiumKey: () => "Skill",
                parser: new SkillParser(skills as Item.Stored<'skill'>[]),
                documentType: "Skill"
            }
        );
    }
}
