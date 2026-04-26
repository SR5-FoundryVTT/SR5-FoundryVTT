import { SR5 } from '@/module/config';
import { DataDefaults } from '@/module/data/DataDefaults';
import { SYSTEM_NAME } from '@/module/constants';
import { VersionMigration } from "../VersionMigration";
import { SR5Item } from '@/module/item/SR5Item';


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
type NecessaryOwnedSkillItemData = {
    type?: string;
    name?: string;
    system?: {
        type?: string;
        skill?: {
            category?: string;
        };
    };
};
type NecessaryActorData = {
    type: string
    items?: NecessaryOwnedSkillItemData[];
    system: {
        skills?: {
            active?: Record<string, LegacySkillData>;
            language?: LegacySkillContainer;
            knowledge?: Partial<Record<LegacyKnowledgeType, LegacySkillContainer>> & Record<string, unknown>;
        };
        skillset: string | undefined
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
 * Make sure that readonly fields are set to their correct values.
 * Migrate actors from the pre-skill-item storage model where skills only lived in system.skills.
 */
export class Version0_33_0 extends VersionMigration {
    readonly TargetVersion = "0.33.0";

    override handlesActiveEffect(_effect: Readonly<any>) {
        return _effect.changes.filter(change => change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM).length > 0;
    }

    override migrateActiveEffect(effect: any) {
        for (const change of effect.changes)
            if (change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM)
                change.mode = CONST.ACTIVE_EFFECT_MODES.ADD;
    }

    override handlesItem(item: Readonly<any>): boolean {
        return item.type === 'weapon'
            && item.system?.range?.ranges
            && item.system.range.ranges.category !== 'manual'
            && item.system.range.ranges.attribute === 'agility';
    }

    override migrateItem(item: any): void {
        const strengthSet = new Set([
            "thrownKnife",
            "net",
            "shuriken",
            "standardThrownGrenade",
            "aerodynamicThrownGrenade",
            "bow"
        ] as const);

        const category = item.system.range.ranges.category;
        const attribute = strengthSet.has(category) ? "strength" : "";

        item.system.range.ranges.attribute = attribute;
    }

    /**
     * Only migrate if an actor actually has skills.
     */
    override handlesActor(actor: Readonly<unknown>) {
        return this.collectLegacySkills(actor as NecessaryActorData).length > 0;
    }

    override migrateActor(actor: unknown) {
        const migratingActor = actor as NecessaryActorData;
        const legacySkills = this.collectLegacySkills(migratingActor);

        if (legacySkills.length === 0) return;

        migratingActor.items ??= [];
        const skillSetUuid = this.defaultSkillSet(migratingActor.type);
        migratingActor.system.skillset = skillSetUuid;

        for (const entry of legacySkills) {
            migratingActor.items.push(this.createSkillItem(entry, skillSetUuid) as NecessaryOwnedSkillItemData);
        }

        if (migratingActor.system) {
            migratingActor.system.skills = {};
        }

    }

    /** SKILL ITEM MIGRATION */
    private skillPackIcons?: ReadonlyMap<string, string>;

    private collectLegacySkills(actor: Readonly<NecessaryActorData>): LegacySkillEntry[] {
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

    private collectOwnedSkillKeys(actor: Readonly<NecessaryActorData>) {
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

    private createSkillItem(entry: LegacySkillEntry, skillSetUuid: string|undefined): Item.CreateData {
        const name = this.getSkillName(entry);
        if (!name) {
            throw new Error(`Shadowrun5e | Failed to migrate legacy ${entry.category} skill due to missing name`);
        }

        return {
            _id: foundry.utils.randomID(16),
            name,
            type: 'skill',
            img: this.getSkillImage(name, entry.skill),
            system: DataDefaults.baseSystemData('skill', {
                type: 'skill',
                description: {
                    value: this.readString(entry.skill.description),
                    source: this.readString(entry.skill.link),
                },
                skill: {
                    category: entry.category,
                    knowledgeType: entry.knowledgeType ?? 'academic',
                    attribute: this.getSkillAttribute(entry),
                    defaulting: this.getSkillDefaulting(entry),
                    rating: this.getSkillRating(entry.skill),
                    limit: {
                        attribute: this.getSkillLimit(entry.skill.limit),
                    },
                    specializations: this.getSpecializations(entry.skill.specs),
                    requirement: this.getSkillRequirement(entry.skill.requirement),
                    language: {
                        isNative: Boolean(entry.skill.isNative),
                    },
                },
                source: {
                    uuid: skillSetUuid,
                }
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

    private getSkillImage(name: string, skill: LegacySkillData) {
        const packIcon = this.getSkillPackIcons().get(this.readString(name));
        return packIcon || this.readString(skill.img) || 'icons/svg/item-bag.svg';
    }

    private getSkillPackIcons(): ReadonlyMap<string, string> {
        if (this.skillPackIcons) return this.skillPackIcons;

        const packName = SR5.packNames.SkillsPack;
        const pack = game.packs.find(pack => pack.metadata.system === SYSTEM_NAME && pack.metadata.name === packName) as foundry.documents.collections.CompendiumCollection<'Item'> | undefined;
        if (!pack) {
            this.skillPackIcons = new Map();
            return this.skillPackIcons;
        }

        this.skillPackIcons = new Map(
            pack.index
                .filter(data => data.type === 'skill')
                .flatMap(data => {
                    const name = this.readString(data.name);
                    const img = this.readString(data.img);
                    if (!name || !img) return [];
                    return [[name, img] as const];
                })
        );

        return this.skillPackIcons;
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

    /**
     * Return the uuid of the default skillset connected to this actors type.
     * NOTE: We can't retrieve the pack to actually check which is the default skillset, as the migration is synchronous and pulling
     *       a pack document is asynchronous.
     * @param type Actor type, used to determine the default skillset.  
     */
    private defaultSkillSet(type: string) {
        const defaultIds: Record<string, string> = {
            character: 'mp2xUdgp6v096fgT',
            sprite: 'vnFEKFHgN1v4Mt94',
            vehicle: 'yXtGE7KP6Apttmz5',
            spirit: 'L6Hw1YI8nC4OSbkG',
            ic: 'hQPdmc2dOU9ihDoN',
        };
        const defaultId = defaultIds[type];
        if (!defaultId) return;
        // NOTE: We don't use the setting as this will possibly fail in the future, if the user imports an actor.
        const pack = game.packs.find(pack => pack.metadata.system === SYSTEM_NAME && pack.metadata.name === 'sr5e-skill-sets') as foundry.documents.collections.CompendiumCollection<'Item'> | undefined;
        if (!pack) return;
        // NOTE: double assert assumption by using both fixed id and naming convetion.
        const skillSetExists = pack.index.some(data => data.type === 'skill' && data._id === defaultId && data.name === type.charAt(0).toUpperCase() + type.slice(1));
        if (!skillSetExists) return;

        return `Compendium.shadowrun5e.sr5e-skill-sets.Item.${defaultId}`;
    }
}
