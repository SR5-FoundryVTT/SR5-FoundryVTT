import { SR5 } from '@/module/config';
import { DataDefaults } from '@/module/data/DataDefaults';
import { VersionMigration } from '../VersionMigration';

type LegacySkillCategory = 'active' | 'language' | 'knowledge';
type LegacyKnowledgeType = 'academic' | 'interests' | 'professional' | 'street';
type SkillAttribute = keyof typeof SR5.attributes | '';
type SkillLimit = keyof typeof SR5.limits | '';
type SkillRequirement = keyof typeof SR5.specialTypes;
type LegacySkillData = Record<string, unknown>;
type LegacySkillContainer = LegacySkillData | {
    attribute?: string;
    value?: Record<string, LegacySkillData>;
};
type OwnedSkillItemData = {
    type?: string;
    name?: string;
    system?: {
        type?: string;
        skill?: {
            category?: string;
        };
    };
};
type MigratingActorData = {
    items?: OwnedSkillItemData[];
    system?: {
        skills?: {
            active?: Record<string, LegacySkillData>;
            language?: LegacySkillContainer;
            knowledge?: Partial<Record<LegacyKnowledgeType, LegacySkillContainer>> & Record<string, unknown>;
        };
    };
};

type LegacySkillEntry = {
    key: string;
    skill: LegacySkillData;
    category: LegacySkillCategory;
    knowledgeType?: LegacyKnowledgeType;
    listAttribute?: string;
};

const LEGACY_KNOWLEDGE_TYPES = ['academic', 'interests', 'professional', 'street'] as const;
const LEGACY_KNOWLEDGE_ATTRIBUTES: Record<LegacyKnowledgeType, string> = {
    academic: 'logic',
    interests: 'intuition',
    professional: 'logic',
    street: 'intuition',
};

/**
 * Migrate actors from the pre-skill-item storage model where skills only lived in system.skills.
 */
export class Version0_33_0 extends VersionMigration {
    readonly TargetVersion = '0.33.0';

    override handlesActor(actor: Readonly<unknown>) {
        return this.collectLegacySkills(actor as MigratingActorData).length > 0;
    }

    override migrateActor(actor: unknown) {
        const migratingActor = actor as MigratingActorData;
        const legacySkills = this.collectLegacySkills(migratingActor);

        if (legacySkills.length === 0) return;

        migratingActor.items ??= [];

        for (const entry of legacySkills) {
            migratingActor.items.push(this.createSkillItem(entry) as OwnedSkillItemData);
        }

        if (migratingActor.system) {
            migratingActor.system.skills = {};
        }
    }

    private collectLegacySkills(actor: Readonly<MigratingActorData>): LegacySkillEntry[] {
        const legacySkills: LegacySkillEntry[] = [];
        const skills = actor.system?.skills;
        if (!skills || typeof skills !== 'object') return legacySkills;
        const existingSkills = this.collectOwnedSkillKeys(actor);

        legacySkills.push(...this.collectSkillEntries(skills.active, { category: 'active' }, existingSkills));
        legacySkills.push(...this.collectSkillEntries(skills.language, { category: 'language' }, existingSkills));

        if (skills.knowledge && typeof skills.knowledge === 'object') {
            for (const [knowledgeType, knowledgeSkills] of Object.entries(skills.knowledge)) {
                if (!this.isLegacyKnowledgeType(knowledgeType)) continue;

                legacySkills.push(...this.collectSkillEntries(knowledgeSkills as LegacySkillContainer | undefined, {
                    category: 'knowledge',
                    knowledgeType,
                }, existingSkills));
            }
        }

        return legacySkills;
    }

    private collectOwnedSkillKeys(actor: Readonly<MigratingActorData>) {
        const keys = new Set<string>();

        for (const item of actor.items ?? []) {
            if (item?.type !== 'skill') continue;
            if (item.system?.type !== 'skill') continue;

            const name = this.readString(item.name);
            const category = this.readString(item.system?.skill?.category) as LegacySkillCategory | '';
            if (!name || !category) continue;

            keys.add(this.buildSkillKey(name, category));
        }

        return keys;
    }

    private collectSkillEntries(
        skillContainer: LegacySkillContainer | undefined,
        meta: { category: LegacySkillCategory; knowledgeType?: LegacyKnowledgeType },
        existingSkills: Set<string>,
    ): LegacySkillEntry[] {
        if (!skillContainer || typeof skillContainer !== 'object') return [];

        const entries: Record<string, unknown> =
            'value' in skillContainer && skillContainer.value && typeof skillContainer.value === 'object'
                ? skillContainer.value as Record<string, unknown>
            : skillContainer as Record<string, unknown>;
        const listAttribute = typeof skillContainer.attribute === 'string' ? skillContainer.attribute : '';

        return Object.entries(entries).flatMap(([key, skill]) => {
            if (!this.isLegacySkillField(skill)) return [];

            const entry = {
                key,
                skill,
                category: meta.category,
                knowledgeType: meta.knowledgeType,
                listAttribute,
            };
            const skillName = this.getSkillName(entry);
            if (!skillName) return [];

            const skillKey = this.buildSkillKey(skillName, meta.category);
            if (existingSkills.has(skillKey)) return [];

            return [entry];
        });
    }

    private isLegacySkillField(skill: unknown): skill is Record<string, unknown> {
        if (!skill || typeof skill !== 'object') return false;

        return ['attribute', 'base', 'canDefault', 'description', 'group', 'id', 'img', 'isNative', 'limit', 'link', 'name', 'requirement', 'specs', 'value']
            .some(key => key in skill);
    }

    private isLegacyKnowledgeType(value: string): value is LegacyKnowledgeType {
        return (LEGACY_KNOWLEDGE_TYPES as readonly string[]).includes(value);
    }

    private createSkillItem(entry: LegacySkillEntry): Item.CreateData {
        const name = this.getSkillName(entry);
        if (!name) {
            throw new Error(`Shadowrun5e | Failed to migrate legacy ${entry.category} skill due to missing name`);
        }

        return {
            _id: foundry.utils.randomID(16),
            name,
            type: 'skill',
            img: this.getSkillImage(entry.skill),
            system: DataDefaults.baseSystemData('skill', {
                type: 'skill',
                description: {
                    value: this.readString(entry.skill.description),
                    source: this.readString(entry.skill.link),
                },
                skill: {
                    category: entry.category,
                    attribute: this.getSkillAttribute(entry),
                    defaulting: this.getSkillDefaulting(entry),
                    rating: this.getSkillRating(entry.skill),
                    ...(entry.category === 'knowledge' ? { knowledgeType: entry.knowledgeType ?? 'academic' } : {}),
                    limit: {
                        attribute: this.getSkillLimit(entry.skill.limit),
                    },
                    specializations: this.getSpecializations(entry.skill.specs),
                    requirement: this.getSkillRequirement(entry.skill.requirement),
                    language: {
                        isNative: Boolean(entry.skill.isNative),
                    },
                },
            }),
            effects: [],
        } as Item.CreateData;
    }

    private getSkillName(entry: LegacySkillEntry) {
        const explicitName = this.readString(entry.skill.name);
        if (explicitName) return explicitName;

        if (entry.category !== 'active') return '';

        return this.readString(entry.key)
            .split(/[_\-\s]+/)
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private getSkillAttribute(entry: LegacySkillEntry): SkillAttribute {
        const attribute = this.readString(entry.skill.attribute);
        if (attribute && this.isSkillAttribute(attribute)) return attribute;
        if (entry.listAttribute && this.isSkillAttribute(entry.listAttribute)) return entry.listAttribute;

        const knowledgeAttribute = entry.category === 'knowledge' && entry.knowledgeType
            ? LEGACY_KNOWLEDGE_ATTRIBUTES[entry.knowledgeType]
            : '';
        if (knowledgeAttribute && this.isSkillAttribute(knowledgeAttribute)) return knowledgeAttribute;

        return '';
    }

    private getSkillDefaulting(entry: LegacySkillEntry) {
        if (entry.category !== 'active') return false;

        return Boolean(entry.skill.canDefault);
    }

    private getSkillRating(skill: LegacySkillData) {
        const base = this.readNumber(skill.base);
        const value = this.readNumber(skill.value);

        if (Boolean(skill.isNative) && value > 0) return value;
        if (Number.isFinite(base)) return base;
        if (Number.isFinite(value)) return value;

        return 0;
    }

    private getSpecializations(specs: unknown) {
        if (!Array.isArray(specs)) return [];

        return specs
            .map(spec => this.readString(spec))
            .filter(Boolean)
            .map(name => ({ name }));
    }

    private getSkillLimit(limit: unknown): SkillLimit {
        const value = this.readString(limit);
        return this.isSkillLimit(value) ? value : '';
    }

    private getSkillRequirement(requirement: unknown): SkillRequirement {
        const value = this.readString(requirement);
        return this.isSkillRequirement(value) ? value : 'mundane';
    }

    private getSkillImage(skill: LegacySkillData) {
        return this.readString(skill.img) || 'icons/svg/item-bag.svg';
    }

    private buildSkillKey(name: string, category: LegacySkillCategory) {
        return `${name.trim().toLowerCase()}:${category}`;
    }

    private isSkillAttribute(value: string | undefined): value is SkillAttribute {
        return value === '' || (!!value && value in SR5.attributes);
    }

    private isSkillLimit(value: string | undefined): value is SkillLimit {
        return value === '' || (!!value && value in SR5.limits);
    }

    private isSkillRequirement(value: string | undefined): value is SkillRequirement {
        return !!value && value in SR5.specialTypes;
    }

    private readNumber(value: unknown) {
        const number = Number(value);
        return Number.isFinite(number) ? number : Number.NaN;
    }

    private readString(value: unknown) {
        return typeof value === 'string' ? value.trim() : '';
    }
}