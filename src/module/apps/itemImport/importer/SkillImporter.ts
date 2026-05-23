import { SkillGroup } from '../parser/Types';
import { DataImporter } from './DataImporter';
import { SkillParser } from '../parser/misc/SkillParser';
import { Skill, SkillsSchema } from '../schema/SkillsSchema';
import { SkillGroupParser } from '../parser/misc/SkillGroupParser';

const formatGroupName = (name: string) => name.trim().toLowerCase();

const generateHash = (value: string): number => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++)
        hash = Math.imul(hash ^ value.charCodeAt(i), 0x01000193);
    return hash >>> 0;
};

const formatAsGuid = (hex: string) => `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

export const generateGroupGuid = (groupName: string): string => formatAsGuid(
    ['sr5-skill-group', formatGroupName(groupName), 'id', 'source']
        .map(seed => generateHash(seed).toString(16).padStart(8, '0')).join('')
);

export const mapSkillsToGroups = (skills: Skill[]): Map<string, string[]> => {
    const byGroup = new Map<string, Set<string>>();
    for (const { name, skillgroup } of skills) {
        const groupName = skillgroup?._TEXT?.trim();
        if (groupName) {
            const key = formatGroupName(groupName);
            byGroup.set(key, (byGroup.get(key) || new Set()).add(name._TEXT));
        }
    }
    return new Map([...byGroup].map(([k, v]) => [k, [...v]]));
};

export class SkillImporter extends DataImporter {
    public readonly files = ['skills.xml'] as const;

    async _parse(jsonObject: SkillsSchema): Promise<void> {
        const parsedSkills = [...jsonObject.skills.skill, ...jsonObject.knowledgeskills.skill];
        const skills = await game.packs.get('shadowrun5e.sr5e-skills')?.getDocuments() ?? [];
        const skillGroups = await game.packs.get('shadowrun5e.sr5e-skill-groups')?.getDocuments() ?? [];
        const skillsToGroups = mapSkillsToGroups(parsedSkills);

        // Since names are unique, we just filter out empties and map directly
        const parsedGroups: SkillGroup[] = jsonObject.skillgroups.name.flatMap(g => {
            const name = g._TEXT?.trim();
            if (!name) return [];

            return [{
                id: { _TEXT: generateGroupGuid(name) },
                name: { _TEXT: name },
                ...(g.$?.translate && { translate: { _TEXT: g.$.translate } })
            }];
        });

        await SkillImporter.ParseItems<SkillGroup>(parsedGroups, {
            compendiumKey: () => "Skill",
            parser: new SkillGroupParser(skillsToGroups, skillGroups as Item.Stored<'skill'>[]),
            documentType: "Skill Group"
        });

        return SkillImporter.ParseItems<Skill>(parsedSkills, {
            compendiumKey: () => "Skill",
            parser: new SkillParser(skills as Item.Stored<'skill'>[]),
            documentType: "Skill"
        });
    }
}
