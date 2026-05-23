import { SkillGroup } from '../parser/Types';
import { DataImporter } from './DataImporter';
import { SkillParser } from '../parser/misc/SkillParser';
import { Skill, SkillsSchema } from '../schema/SkillsSchema';
import { SkillGroupParser } from '../parser/misc/SkillGroupParser';

/**
 * Stable normalization used by mapping and GUID generation.
 * Changing this changes generated GUIDs, which changes Foundry `_id` values.
 */
const formatGroupName = (name: string) => name.trim().toLowerCase();

/** Deterministic 32-bit FNV-1a-style hash for ID seeding (non-cryptographic). */
const generateHash = (value: string): number => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++)
        hash = Math.imul(hash ^ value.charCodeAt(i), 0x01000193);
    return hash >>> 0;
};

/** Format 32 hex chars as GUID text (8-4-4-4-12). */
const formatAsGuid = (hex: string) => `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

/**
 * Deterministic GUID for Chummer skill groups without source GUIDs.
 * Seeds: `sr5-skill-group`, normalized name, `id`, `source`.
 * Converted to Foundry `_id` later via `DataImporter.ParseItems` -> `ImportHelper.guidToId`.
 * Same normalized group name always maps to same Foundry `_id` across imports;
 * renaming a group creates a different ID (new document path).
 */
export const generateGroupGuid = (groupName: string): string => formatAsGuid(
    ['sr5-skill-group', formatGroupName(groupName), 'id', 'source']
        .map(seed => generateHash(seed).toString(16).padStart(8, '0')).join('')
);

/** Build a normalized group-name -> member skill names map from parsed skills. */
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

        // skills.xml skill groups are name-only. Create deterministic GUIDs so
        // ParseItems/guidToId generates stable `_id` values across re-imports.
        // If the group name/normalization changes, the resulting `_id` changes too.
        const parsedGroups = jsonObject.skillgroups.name.flatMap(g => {
            const name = g._TEXT?.trim();
            if (!name) return [];

            return [{
                id: { _TEXT: generateGroupGuid(name) },
                name: { _TEXT: name },
                ...(g.$?.translate && { translate: { _TEXT: g.$.translate } })
            } satisfies SkillGroup as SkillGroup];
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
