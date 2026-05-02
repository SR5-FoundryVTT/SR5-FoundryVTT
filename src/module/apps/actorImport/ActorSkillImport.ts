import { ActorSchema } from './ActorSchema';
import { ImportHelper as IH } from '@/module/apps/itemImport/helper/ImportHelper';
import { DataDefaults } from '@/module/data/DataDefaults';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SkillItemFlow } from '@/module/item/flows/SkillItemFlow';
import { SR5Item } from '@/module/item/SR5Item';

const ATTRIBUTE_MAP = {
    bod: 'body',
    agi: 'agility',
    rea: 'reaction',
    str: 'strength',
    cha: 'charisma',
    int: 'intuition',
    log: 'logic',
    wil: 'willpower',
    edg: 'edge',
    mag: 'magic',
    res: 'resonance',
} as const;

const KNOWLEDGE_ATTRIBUTE_MAP = {
    academic: 'logic',
    interests: 'intuition',
    professional: 'logic',
    street: 'intuition',
} as const;

type ImportedActorWithSkills = Actor.CreateData & {
    type: string;
    items: Item.CreateData[];
    system: {
        skillset?: string;
    };
};

type ImportedSkillData = ActorSchema['skills']['skill'][number];
type ImportedKnowledgeType = keyof typeof KNOWLEDGE_ATTRIBUTE_MAP;
type ImportedSkillItem = Item.CreateData & {
    name: string;
    type: 'skill';
    system: ReturnType<typeof DataDefaults.baseSystemData<'skill'>>;
};

export class ActorSkillImport {
    static parseSkillName(skillName: string): string {
        return skillName.trim().toLowerCase().replace(/[\s-]/g, '_');
    }

    static parseAttName(attName: string): typeof ATTRIBUTE_MAP[keyof typeof ATTRIBUTE_MAP] | '' {
        const key = attName.trim().toLowerCase();
        if (!(key in ATTRIBUTE_MAP)) return '';
        return ATTRIBUTE_MAP[key as keyof typeof ATTRIBUTE_MAP];
    }

    static async importSkills(actor: ImportedActorWithSkills, chummerChar: ActorSchema) {
        const skills = IH.getArray(chummerChar.skills.skill);
        const languageSkills: typeof skills = [];
        const knowledgeSkills: typeof skills = [];
        const activeSkills: typeof skills = [];

        for (const skill of skills) {
            if (skill.islanguage === 'True') {
                languageSkills.push(skill);
            } else if (skill.knowledge === 'True') {
                knowledgeSkills.push(skill);
            } else {
                activeSkills.push(skill);
            }
        }

        const skillSet = await this.assignDefaultSkillset(actor);
        if (skillSet) {
            actor.items.push(...await PackItemFlow.prepareSkillsForSkillSet(skillSet));
            actor.items.push(...await PackItemFlow.prepareSkillGroupsForSkillSet(skillSet) as Item.CreateData[]);
        }

        const packSkillsByName = this.buildNameMap(await PackItemFlow.getPackSkills());

        this.handleLanguageSkills(actor.items, languageSkills, packSkillsByName, skillSet);
        this.handleKnowledgeSkills(actor.items, knowledgeSkills, packSkillsByName, skillSet);
        this.handleActiveSkills(actor.items, activeSkills, packSkillsByName, skillSet);
        await this.handleSkillGroups(actor.items, chummerChar, skillSet);
    }

    private static parseKnowledgeType(skillCategory?: string): ImportedKnowledgeType | undefined {
        const category = skillCategory?.trim().toLowerCase();
        if (!category) return undefined;
        if (category === 'interest') return 'interests';
        if (category in KNOWLEDGE_ATTRIBUTE_MAP) {
            return category as ImportedKnowledgeType;
        }

        return undefined;
    }

    private static createImportedSkillItem(skill: ImportedSkillData, options: {
        name: string;
        category: 'active' | 'language' | 'knowledge';
        rating: number;
        attribute?: ReturnType<typeof ActorSkillImport.parseAttName>;
        defaulting?: boolean;
        knowledgeType?: ImportedKnowledgeType;
        isNative?: boolean;
        group?: string;
        packSkill?: SR5Item<'skill'>;
        sourceUuid?: string;
    }): ImportedSkillItem {
        const skillItem: ImportedSkillItem = options.packSkill
            ? foundry.utils.deepClone(options.packSkill.toObject()) as ImportedSkillItem
            : {
                name: options.name,
                type: 'skill',
                system: DataDefaults.baseSystemData('skill', {
                    type: 'skill',
                    skill: {
                        category: options.category,
                        attribute: options.attribute ?? '',
                        defaulting: options.defaulting ?? false,
                        knowledgeType: options.knowledgeType ?? 'academic',
                        group: options.group ?? '',
                        language: {
                            isNative: options.isNative ?? false,
                        },
                    },
                }),
                effects: [],
            };

        delete (skillItem as Item.CreateData & { _id?: string })._id;

        this.applyImportedSkillData(skillItem, skill, options);

        return skillItem;
    }

    private static applyImportedSkillData(skillItem: ImportedSkillItem, skill: ImportedSkillData, options: {
        name: string;
        category: 'active' | 'language' | 'knowledge';
        rating: number;
        attribute?: ReturnType<typeof ActorSkillImport.parseAttName>;
        defaulting?: boolean;
        knowledgeType?: ImportedKnowledgeType;
        isNative?: boolean;
        group?: string;
        packSkill?: SR5Item<'skill'>;
        sourceUuid?: string;
    }) {
        const languageData = skillItem.system.skill.language ?? { isNative: false };

        skillItem.name = options.packSkill?.name ?? skillItem.name ?? options.name;
        skillItem.system.skill.category = options.category;
        skillItem.system.skill.attribute = options.attribute ?? skillItem.system.skill.attribute ?? '';
        skillItem.system.skill.defaulting = options.defaulting ?? skillItem.system.skill.defaulting ?? false;
        if (options.category === 'knowledge') {
            skillItem.system.skill.knowledgeType = options.knowledgeType ?? skillItem.system.skill.knowledgeType ?? 'academic';
        }
        skillItem.system.skill.group = options.group ?? '';
        skillItem.system.skill.language = languageData;
        skillItem.system.skill.language.isNative = options.isNative ?? false;
        skillItem.system.skill.rating = options.rating;
        skillItem.system.skill.specializations = IH.getArray(skill.skillspecializations?.skillspecialization).map(spec => ({
            name: spec.name,
        }));
        if (options.sourceUuid) {
            skillItem.system.source.uuid = options.sourceUuid;
        }
    }

    private static buildNameMap<T extends { name: string }>(entries: T[]) {
        return new Map(entries.map(entry => [entry.name.trim().toLowerCase(), entry]));
    }

    private static findSkillItem(
        items: ImportedActorWithSkills['items'],
        skillName: string,
        category: 'active' | 'language' | 'knowledge',
    ): ImportedSkillItem | undefined {
        const targetKey = SkillItemFlow.skillNameByCategoryKey(skillName, category);
        if (!targetKey) return undefined;

        return items.find(item => {
            if (item.type !== 'skill' || foundry.utils.getProperty(item, 'system.type') !== 'skill') return false;

            const itemCategory = foundry.utils.getProperty(item, 'system.skill.category') as string | undefined;
            return SkillItemFlow.skillNameByCategoryKey(item.name ?? '', itemCategory) === targetKey;
        }) as ImportedSkillItem | undefined;
    }

    private static findSkillGroupItem(
        items: ImportedActorWithSkills['items'],
        groupName: string,
    ): (Item.CreateData & { system: { group: { rating: number }; source: { uuid?: string } } }) | undefined {
        const normalizedName = groupName.trim().toLowerCase();
        return items.find(item => {
            return item.type === 'skill'
                && foundry.utils.getProperty(item, 'system.type') === 'group'
                && item.name?.trim().toLowerCase() === normalizedName;
        }) as (Item.CreateData & { system: { group: { rating: number }; source: { uuid?: string } } }) | undefined;
    }

    private static isSkillInSkillSet(skillSet: SR5Item<'skill'> | undefined, skillName: string): boolean {
        const normalizedName = skillName.trim().toLowerCase();
        return !!skillSet?.system.set.skills.some(skill => skill.name.trim().toLowerCase() === normalizedName);
    }

    private static isSkillGroupInSkillSet(skillSet: SR5Item<'skill'> | undefined, groupName: string): boolean {
        const normalizedName = groupName.trim().toLowerCase();
        return !!skillSet?.system.set.groups.some(group => group.name.trim().toLowerCase() === normalizedName);
    }

    private static async assignDefaultSkillset(actor: ImportedActorWithSkills): Promise<SR5Item<'skill'> | undefined> {
        const skillSets = await PackItemFlow.getAllPackSkillSets();
        const skillSet = skillSets.find(s => s.system.set.default.type === actor.type);
        if (!skillSet) {
            console.debug(`Shadowrun 5e | No default skill set found for actor type ${actor.type}, skipping skillset assignment on import`);
            return undefined;
        }

        actor.system.skillset = skillSet.uuid;
        console.debug(`Shadowrun 5e | Assigned skill set ${skillSet.name} (${skillSet.uuid}) to imported ${actor.type}`);
        return skillSet;
    }

    private static async handleSkillGroups(
        items: ImportedActorWithSkills['items'],
        chummerChar: ActorSchema,
        skillSet?: SR5Item<'skill'>,
    ) {
        const chummerGroups = IH.getArray(chummerChar.skills.skillgroup);
        if (!chummerGroups.length) return;

        const packGroups = await PackItemFlow.getPackSkillgroups();
        const packGroupsByName = this.buildNameMap(packGroups);

        for (const chummerGroup of chummerGroups) {
            if (chummerGroup.isbroken === 'True') continue;

            const rating = Number(chummerGroup.rating) || 0;
            const groupName = chummerGroup.name_english || chummerGroup.name;
            const existingGroup = this.findSkillGroupItem(items, groupName);
            if (existingGroup) {
                existingGroup.system.group.rating = rating;
                if (skillSet && this.isSkillGroupInSkillSet(skillSet, existingGroup.name ?? groupName)) {
                    existingGroup.system.source.uuid = skillSet.uuid;
                }
                continue;
            }

            const packGroup = packGroupsByName.get(groupName.trim().toLowerCase());
            if (!packGroup) {
                console.debug(`Shadowrun 5e | No pack skill group found for "${groupName}", skipping`);
                continue;
            }

            const groupItem = packGroup.toObject() as Item.CreateData & {
                system: { group: { rating: number }; source: { uuid: string } }
            };
            delete (groupItem as Item.CreateData & { _id?: string })._id;
            groupItem.system.group.rating = rating;
            if (skillSet && this.isSkillGroupInSkillSet(skillSet, packGroup.name)) {
                groupItem.system.source.uuid = skillSet.uuid;
            }

            items.push(groupItem);
        }
    }

    private static handleActiveSkills(
        items: ImportedActorWithSkills['items'],
        activeSkills: ActorSchema['skills']['skill'],
        packSkillsByName: Map<string, SR5Item<'skill'>>,
        skillSet?: SR5Item<'skill'>,
    ) {
        for (const skill of activeSkills) {
            const skillName = skill.name_english || skill.name;
            const normalizedSkillName = skillName.trim().toLowerCase();
            const packSkill = packSkillsByName.get(normalizedSkillName);
            const sourceUuid = skillSet && this.isSkillInSkillSet(skillSet, packSkill?.name ?? skillName) ? skillSet.uuid : undefined;
            const existingSkill = this.findSkillItem(items, packSkill?.name ?? skillName, 'active');
            if (existingSkill) {
                this.applyImportedSkillData(existingSkill, skill, {
                    name: skillName,
                    category: 'active',
                    rating: parseInt(skill.rating),
                    attribute: this.parseAttName(skill.attribute),
                    defaulting: skill.default === 'True',
                    group: skill.skillgroup_english || '',
                    packSkill,
                    sourceUuid,
                });
                continue;
            }

            const skillItem = this.createImportedSkillItem(skill, {
                name: skillName,
                category: 'active',
                rating: parseInt(skill.rating),
                attribute: this.parseAttName(skill.attribute),
                defaulting: skill.default === 'True',
                group: skill.skillgroup_english || '',
                packSkill,
                sourceUuid,
            });

            items.push(skillItem);
        }
    }

    private static handleLanguageSkills(
        items: ImportedActorWithSkills['items'],
        languageSkills: ActorSchema['skills']['skill'],
        packSkillsByName: Map<string, SR5Item<'skill'>>,
        skillSet?: SR5Item<'skill'>,
    ) {
        for (const skill of languageSkills) {
            const isNative = skill.isnativelanguage === 'True';
            const rating = isNative ? 12 : (Number(skill.rating) || 0);
            const skillName = skill.name || skill.name_english;
            const packSkill = packSkillsByName.get(skillName.trim().toLowerCase());
            const sourceUuid = skillSet && this.isSkillInSkillSet(skillSet, packSkill?.name ?? skillName) ? skillSet.uuid : undefined;
            const existingSkill = this.findSkillItem(items, packSkill?.name ?? skillName, 'language');
            if (existingSkill) {
                this.applyImportedSkillData(existingSkill, skill, {
                    name: skillName,
                    category: 'language',
                    rating,
                    isNative,
                    packSkill,
                    sourceUuid,
                });
                continue;
            }

            const skillItem = this.createImportedSkillItem(skill, {
                name: skillName,
                category: 'language',
                rating,
                isNative,
                packSkill,
                sourceUuid,
            });

            items.push(skillItem);
        }
    }

    private static handleKnowledgeSkills(
        items: ImportedActorWithSkills['items'],
        knowledgeSkills: ActorSchema['skills']['skill'],
        packSkillsByName: Map<string, SR5Item<'skill'>>,
        skillSet?: SR5Item<'skill'>,
    ) {
        for (const skill of knowledgeSkills) {
            const knowledgeType = this.parseKnowledgeType(skill.skillcategory_english);
            const parsedAttribute = this.parseAttName(skill.attribute);
            const attribute = parsedAttribute || (knowledgeType ? KNOWLEDGE_ATTRIBUTE_MAP[knowledgeType] : '');
            const skillName = skill.name || skill.name_english;
            const packSkill = packSkillsByName.get(skillName.trim().toLowerCase());
            const sourceUuid = skillSet && this.isSkillInSkillSet(skillSet, packSkill?.name ?? skillName) ? skillSet.uuid : undefined;
            const existingSkill = this.findSkillItem(items, packSkill?.name ?? skillName, 'knowledge');
            if (existingSkill) {
                this.applyImportedSkillData(existingSkill, skill, {
                    name: skillName,
                    category: 'knowledge',
                    rating: Number(skill.rating) || 0,
                    attribute,
                    knowledgeType,
                    packSkill,
                    sourceUuid,
                });
                continue;
            }

            const skillItem = this.createImportedSkillItem(skill, {
                name: skillName,
                category: 'knowledge',
                rating: Number(skill.rating) || 0,
                attribute,
                knowledgeType,
                packSkill,
                sourceUuid,
            });

            items.push(skillItem);
        }
    }
}