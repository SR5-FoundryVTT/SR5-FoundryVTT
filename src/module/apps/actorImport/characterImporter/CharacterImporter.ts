import { SR5Actor } from "src/module/actor/SR5Actor";
import { ImportHelper as IH } from "src/module/apps/itemImport/helper/ImportHelper";

import { DataDefaults } from "@/module/data/DataDefaults";
import { PackItemFlow } from "@/module/item/flows/PackItemFlow";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { SkillNamingFlow } from "@/module/flows/SkillNamingFlow";

import { ActorSchema } from "../ActorSchema";
import { ItemsParser } from "../itemImporter/ItemsParser";
import { VehicleParser } from "../itemImporter/vehicleImport/VehicleParser";

// Type Definitions
export type importOptionsType = Partial<{
    assignIcons: boolean;
    folderId: string | null;
    armor: boolean;
    contacts: boolean;
    cyberware: boolean;
    equipment: boolean;
    lifestyles: boolean;
    metamagics: boolean;
    powers: boolean;
    qualities: boolean;
    rituals: boolean;
    spells: boolean;
    vehicles: boolean;
    weapons: boolean;
}>;

export interface BlankCharacter extends Actor.CreateData {
    type: 'character',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'character'>>,
};

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class CharacterImporter {
    private static readonly ATTRIBUTE_MAP = {
        bod: "body",
        agi: "agility",
        rea: "reaction",
        str: "strength",
        cha: "charisma",
        int: "intuition",
        log: "logic",
        wil: "willpower",
        edg: "edge",
        mag: "magic",
        res: "resonance"
    } as const;

    private static readonly KNOWLEDGE_ATTRIBUTE_MAP = {
        academic: 'logic',
        interests: 'intuition',
        professional: 'logic',
        street: 'intuition',
    } as const;

    /**
     * Maps Chummer attribute abbreviations to SR5-Foundry attribute names.
     * @param attName The Chummer attribute abbreviation.
     * @returns The corresponding SR5-Foundry attribute name, or an empty string if not found.
     */
    static parseAttName(
        attName: string
    ): typeof CharacterImporter.ATTRIBUTE_MAP[keyof typeof CharacterImporter.ATTRIBUTE_MAP] | "" {
        const key = attName.trim().toLowerCase();
        return this.ATTRIBUTE_MAP[key] ?? "";
    }

    static parseSkillName(skillName: string): string {
        return skillName.trim().toLowerCase().replace(/[\s-]/g, '_');
    }

    private static parseKnowledgeType(skillCategory?: string): keyof typeof CharacterImporter.KNOWLEDGE_ATTRIBUTE_MAP | undefined {
        const category = skillCategory?.trim().toLowerCase();
        if (!category) return undefined;
        if (category === 'interest') return 'interests';
        if (category in this.KNOWLEDGE_ATTRIBUTE_MAP) {
            return category as keyof typeof CharacterImporter.KNOWLEDGE_ATTRIBUTE_MAP;
        }

        return undefined;
    }

    private static createImportedSkillItem(skill: ActorSchema['skills']['skill'][number], options: {
        name: string;
        category: 'active' | 'language' | 'knowledge';
        rating: number;
        attribute?: ReturnType<typeof CharacterImporter['parseAttName']>;
        defaulting?: boolean;
        knowledgeType?: keyof typeof CharacterImporter.KNOWLEDGE_ATTRIBUTE_MAP;
        isNative?: boolean;
        group?: string;
    }): Item.CreateData & {
        name: string;
        type: 'skill';
        system: ReturnType<typeof DataDefaults.baseSystemData<'skill'>>;
    } {
        const skillItem: Item.CreateData & {
            name: string;
            type: 'skill';
            system: ReturnType<typeof DataDefaults.baseSystemData<'skill'>>;
        } = {
            name: options.name,
            type: 'skill',
            system: DataDefaults.baseSystemData('skill', {
                type: 'skill',
                skill: {
                    category: options.category,
                    attribute: options.attribute ?? '',
                    defaulting: options.defaulting ?? false,
                    knowledgeType: options.knowledgeType ?? null,
                    group: options.group ?? '',
                    language: {
                        isNative: options.isNative ?? false,
                    },
                },
            }),
            effects: [],
        };

        skillItem.system.skill.rating = options.rating;
        skillItem.system.skill.specializations = IH.getArray(skill.skillspecializations?.skillspecialization).map(spec => ({
            name: spec.name,
        }));

        return skillItem;
    }

    // --------------------------------------------------------------------------
    // Public Methods
    // --------------------------------------------------------------------------

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param chummerCharacter The complete chummer file as json object. The first character will be selected for import.
     * @param importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    static async import(chummerCharacter: ActorSchema, importOptions: importOptionsType): Promise<[SR5Actor<'character'>, ...SR5Actor<'vehicle'>[]]> {
        const character: BlankCharacter = {
            effects: [],
            type: 'character',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('character'),
            items: await new ItemsParser().parse(chummerCharacter, importOptions),
            name: chummerCharacter.alias ?? chummerCharacter.name ?? '[Name not found]',
        };

        await this.update(character, chummerCharacter);

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.character.schema, character.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerCharacter.name}\n`);
            console.table(consoleLogs);
        }

        const actor = (await SR5Actor.create(character))! as SR5Actor<'character'>;

        await this.fixAttributes(actor, chummerCharacter);

        let createdVehicles: SR5Actor<'vehicle'>[] = [];
        if (importOptions.vehicles) {
            const chummerVehicles = IH.getArray(chummerCharacter.vehicles?.vehicle);
            const vehicleData = await new VehicleParser().parseVehicles(actor, chummerVehicles);
            const createdDocs = await SR5Actor.create(vehicleData) as SR5Actor<'vehicle'>[] | SR5Actor<'vehicle'>;
            createdVehicles = Array.isArray(createdDocs) ? createdDocs : [createdDocs];
        }

        return [actor, ...createdVehicles];
    }

    // --------------------------------------------------------------------------
    // Private Orchestration Methods
    // --------------------------------------------------------------------------

    /**
     * Parses the actor data from the chummer file and returns an updated clone of the actor data.
     * @param actor The actor data (actor not actor.system) that is used as the basis for the import. Will not be changed.
     * @param chummerChar The chummer character to parse.
     */
    private static async update(actor: BlankCharacter, chummerChar: ActorSchema) {
        // Name is required, so we need to always set something (even if the chummer field is empty)
        actor.name = chummerChar.alias ?? chummerChar.name ?? '[Name not found]';

        this.importBasicData(actor.system, chummerChar);
        await this.importBio(actor.system, chummerChar);
        this.importAttributes(actor.system, chummerChar);
        this.importInitiative(actor.system, chummerChar);
        await this.importSkills(actor, chummerChar);

        actor.system.is_critter = chummerChar.critter === 'True';
    }

    // --------------------------------------------------------------------------
    // Private Data Import Methods
    // --------------------------------------------------------------------------

    private static importBasicData(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        if (chummerChar.metatype) {
            // Avoid i18n metatype field issues. Chummer metatype aren't lowercase but foundry system metatypes are.
            system.metatype = chummerChar.metatype_english.toLowerCase() as any;
        }

        system.street_cred = Number(chummerChar.calculatedstreetcred) || 0;
        system.notoriety = Number(chummerChar.calculatednotoriety) || 0;
        system.public_awareness = Number(chummerChar.calculatedpublicawareness) || 0;
        system.karma.value = Number(chummerChar.karma) || 0;
        system.karma.max = Number(chummerChar.totalkarma) || 0;
        system.nuyen = parseInt(chummerChar.nuyen.replace(/[,.]/g, ''));

        if (chummerChar.technomancer === 'True') {
            system.special = 'resonance';
            const initiationGrades = IH.getArray(chummerChar.initiationgrade?.initiationgrade);
            const technoGrades = initiationGrades
                .filter(grade => grade.technomancer === 'True')
                .map(grade => Number(grade.grade) || 0);
            system.technomancer.submersion = Math.max(0, ...technoGrades);
        } else if (chummerChar.magician === 'True' || chummerChar.adept === 'True') {
            system.special = 'magic';

            let attr: string[] = [];
            // @ts-expect-error legacy chummer attribute
            if (chummerChar.tradition?.drainattribute?.attr) {
                // @ts-expect-error legacy chummer attribute
                attr = chummerChar.tradition.drainattribute.attr;
            } else if (chummerChar.tradition?.drainattributes) {
                attr = chummerChar.tradition.drainattributes
                    .split('+')
                    .map((item) => item.trim());
            }

            const filteredAttr = attr.find((att) => att !== 'willpower');
            if (filteredAttr) {
                system.magic.attribute = this.parseAttName(filteredAttr) as any;
            }

            const initiationGrades = IH.getArray(chummerChar.initiationgrade?.initiationgrade);
            const magicianGrades = initiationGrades
                .filter(grade => grade.technomancer === 'False')
                .map(grade => Number(grade.grade) || 0);
            system.magic.initiation = Math.max(0, ...magicianGrades);
        }
    }

    private static async importBio(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        let bioHtml = '';

        if (chummerChar.description) bioHtml += chummerChar.description + '<br/>';
        if (chummerChar.background) bioHtml += chummerChar.background + '<br/>';
        if (chummerChar.concept) bioHtml += chummerChar.concept + '<br/>';
        if (chummerChar.notes) bioHtml += chummerChar.notes + '<br/>';

        // Chummer outputs html and wraps every section in <p> tags.
        // Adding the option async.true is necessary for the pdf-pager module not to cause an error on import.
        system.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(bioHtml);
    }

    private static importAttributes(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        if (!chummerChar.attributes) return;

        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);
            if (!attName) continue;

            system.attributes[attName].base = parseInt(att.base);
        }
    }

    private static async fixAttributes(actor: SR5Actor, chummerChar: ActorSchema) {
        const fixes: Partial<Record<ReturnType<typeof CharacterImporter['parseAttName']>, number>> = {};
        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);
            if (!attName) continue;

            if (actor.system.attributes[attName].value !== parseInt(att.total))
                fixes[attName] = parseInt(att.total) - actor.system.attributes[attName].value;
        }

        if (Object.keys(fixes).length > 0) {
            const changes = Object.entries(fixes).map(([key, value]) => ({
                key: `system.attributes.${key}.value`, value: String(value)
            }));
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: `Attribute Fixes on Import`, changes
            }]);
        }
    }

    private static importInitiative(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        // TODO: These modifiers are very unclear in how they're used here and where they come from.
        system.modifiers.meat_initiative = Number(chummerChar.initbonus) || 0;

        // 'initdice' contains the total amount of initiative dice, not just the bonus.
        system.modifiers.meat_initiative_dice = (Number(chummerChar.initdice) || 1) - 1;
        system.modifiers.astral_initiative_dice = (Number(chummerChar.astralinitdice) || 2) - 2;
        system.modifiers.matrix_initiative_dice = (Number(chummerChar.matrixarinitdice) || 3) - 3;
    }

    // --------------------------------------------------------------------------
    // Private Skill Handling Methods
    // --------------------------------------------------------------------------

    private static async importSkills(actor: BlankCharacter, chummerChar: ActorSchema) {
        const skills = IH.getArray(chummerChar.skills.skill);
        const languageSkills: typeof skills = [];
        const knowledgeSkills: typeof skills = [];
        const activeSkills: typeof skills = [];

        for (const skill of skills) {
            const rating = Number(skill.rating) || 0;
            if (skill.islanguage === 'True') {
                languageSkills.push(skill);
            } else if (skill.knowledge === 'True' && rating > 0) {
                knowledgeSkills.push(skill);
            } else if (rating > 0) {
                activeSkills.push(skill);
            }
        }

        this.handleLanguageSkills(actor.items, languageSkills);
        this.handleKnowledgeSkills(actor.items, knowledgeSkills);
        await this.handleActiveSkills(actor.items, activeSkills);

        const skillsetUuid = await this.assignDefaultSkillset(actor);
        await this.handleSkillGroups(actor.items, chummerChar);
    }

    /**
     * Find and assign the default skillset for the character actor type.
     * Links all already-imported skill items to the skillset via source.uuid.
     *
     * @param actor The blank character being built for import.
     * @returns The UUID of the assigned skillset, or undefined if none found.
     */
    private static async assignDefaultSkillset(actor: BlankCharacter): Promise<string | undefined> {
        const skillSets = await PackItemFlow.getAllPackSkillSets();
        const skillSet = skillSets.find(s => s.system.set.default.type === actor.type);
        if (!skillSet) {
            console.debug(`Shadowrun 5e | No default skill set found for actor type ${actor.type}, skipping skillset assignment on import`);
            return undefined;
        }

        actor.system.skillset = skillSet.uuid;

        for (const item of actor.items) {
            if (item.type !== 'skill') continue;
            (item as Item.CreateData & { system: { source: { uuid: string } } }).system.source.uuid = skillSet.uuid;
        }

        console.debug(`Shadowrun 5e | Assigned skill set ${skillSet.name} (${skillSet.uuid}) to imported character`);
        return skillSet.uuid;
    }

    /**
     * Create skill group items from the Chummer XML skillgroup data.
     * Only non-broken groups with a rating are created.
     *
     * @param items The items list being built for the actor.
     * @param chummerChar The parsed Chummer character XML data.
     */
    private static async handleSkillGroups(
        items: BlankCharacter['items'],
        chummerChar: ActorSchema
    ) {
        const chummerGroups = IH.getArray(chummerChar.skills.skillgroup);
        if (!chummerGroups.length) return;

        const packGroups = await PackItemFlow.getPackSkillgroups();
        const packGroupsByName = new Map(packGroups.map(g => [g.name.trim().toLowerCase(), g]));

        for (const chummerGroup of chummerGroups) {
            if (chummerGroup.isbroken === 'True') continue;

            const rating = Number(chummerGroup.rating) || 0;
            if (rating <= 0) continue;

            const groupName = chummerGroup.name_english || chummerGroup.name;
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

            items.push(groupItem);
        }
    }

    private static async handleActiveSkills(items: BlankCharacter['items'], activeSkills: ActorSchema['skills']['skill']) {
        const packSkills = await PackItemFlow.getPackSkills();
        const packSkillsByName = new Map(packSkills.map(skill => [this.parseSkillName(skill.name), skill]));

        for (const skill of activeSkills) {
            const skillName = skill.name_english || skill.name;
            const skillKey = this.parseSkillName(skillName);
            const packSkill = packSkillsByName.get(skillKey);
            const skillItem: Item.CreateData & {
                name: string;
                type: 'skill';
                system: ReturnType<typeof DataDefaults.baseSystemData<'skill'>>;
            } = packSkill
                ? foundry.utils.deepClone(packSkill.toObject()) as Item.CreateData & {
                    name: string;
                    type: 'skill';
                    system: ReturnType<typeof DataDefaults.baseSystemData<'skill'>>;
                }
                : {
                    name: skillName,
                    type: 'skill',
                    system: DataDefaults.baseSystemData('skill', {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: this.parseAttName(skill.attribute),
                            defaulting: skill.default === 'True',
                        },
                    }),
                    effects: [],
                };

            delete (skillItem as Item.CreateData & { _id?: string })._id;
            skillItem.name = packSkill?.name ?? skillName;
            skillItem.system.skill.rating = parseInt(skill.rating);
            skillItem.system.skill.group = skill.skillgroup_english || '';
            skillItem.system.skill.specializations = IH.getArray(skill.skillspecializations?.skillspecialization).map(spec => ({
                name: spec.name,
            }));

            items.push(skillItem);
        }
    }

    private static handleLanguageSkills(items: BlankCharacter['items'], languageSkills: ActorSchema['skills']['skill']) {
        for (const skill of languageSkills) {
            const isNative = skill.isnativelanguage === 'True';
            const rating = isNative ? 12 : (Number(skill.rating) || 0);
            const skillItem = this.createImportedSkillItem(skill, {
                name: skill.name || skill.name_english,
                category: 'language',
                rating,
                isNative,
            });

            items.push(skillItem);
        }
    }

    private static handleKnowledgeSkills(items: BlankCharacter['items'], knowledgeSkills: ActorSchema['skills']['skill']) {
        for (const skill of knowledgeSkills) {
            const knowledgeType = this.parseKnowledgeType(skill.skillcategory_english);
            const parsedAttribute = this.parseAttName(skill.attribute);
            const attribute = parsedAttribute || (knowledgeType ? this.KNOWLEDGE_ATTRIBUTE_MAP[knowledgeType] : '');
            const skillItem = this.createImportedSkillItem(skill, {
                name: skill.name || skill.name_english,
                category: 'knowledge',
                rating: Number(skill.rating) || 0,
                attribute,
                knowledgeType,
            });

            items.push(skillItem);
        }
    }
}
