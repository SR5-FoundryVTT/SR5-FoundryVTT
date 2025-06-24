import { ModifiableValue, KeyValuePair } from "./Base";
const { SchemaField, BooleanField, ArrayField, StringField, TypedObjectField } = foundry.data.fields;

export type SkillCategories = 'active' | 'language' | 'knowledge';

export const SkillField = () => ({
    ...ModifiableValue(),
    name: new StringField({ required: true }),
    hidden: new BooleanField(),
    label: new StringField({ required: true }),
    bonus: new ArrayField(new SchemaField(KeyValuePair())),
    attribute: new StringField({ required: true }),
    _delete: new BooleanField(), // Does it use it?
    specs: new ArrayField(new StringField({ required: true })),
    canDefault: new BooleanField({ initial: true }),
    id: new StringField({ required: true }),
    link: new StringField({ required: true }),
    group: new StringField({ required: true }),
});

function skill(createData: foundry.data.fields.SchemaField.CreateData<ReturnType<typeof SkillField>> = {}): SkillFieldType {
    const initialValue = new SchemaField(SkillField()).getInitialValue(createData);
    return foundry.utils.mergeObject(initialValue, createData) as SkillFieldType;
}

export const Skills = () => new TypedObjectField(
    new SchemaField(SkillField()),
    {
        required: true,
        initial: {
            // Combat Skills
            archery: skill({ name: 'archery', attribute: 'agility' }),
            automatics: skill({ name: 'automatics', attribute: 'agility', group: 'Firearms' }),
            blades: skill({ name: 'blades', attribute: 'agility', group: 'Close Combat' }),
            clubs: skill({ name: 'clubs', attribute: 'agility', group: 'Close Combat' }),
            exotic_melee: skill({ name: 'exotic_melee', attribute: 'agility', canDefault: false }), // how to deal with exotic melee weapons?
            exotic_range: skill({ name: 'exotic_range', attribute: 'agility', canDefault: false }), // how to deal with exotic ranged weapons?
            heavy_weapons: skill({ name: 'heavy_weapons', attribute: 'agility', group: 'Firearms' }),
            longarms: skill({ name: 'longarms', attribute: 'agility', group: 'Firearms' }),
            pistols: skill({ name: 'pistols', attribute: 'agility', group: 'Firearms' }),
            throwing_weapons: skill({ name: 'throwing_weapons', attribute: 'agility', group: 'Close Combat' }),
            unarmed_combat: skill({ name: 'unarmed_combat', attribute: 'agility', group: 'Close Combat' }),

            // Physical Skills
            disguise: skill({ name: 'disguise', attribute: 'intuition', group: 'Stealth' }),
            diving: skill({ name: 'diving', attribute: 'body' }),
            escape_artist: skill({ name: 'escape_artist', attribute: 'agility' }),
            flight: skill({ name: 'flight', attribute: 'agility', canDefault: false, hidden: true }),
            free_fall: skill({ name: 'free_fall', attribute: 'body' }),
            gymnastics: skill({ name: 'gymnastics', attribute: 'agility', group: 'Athletics' }),
            palming: skill({ name: 'palming', attribute: 'agility', group: 'Stealth', canDefault: false }),
            perception: skill({ name: 'perception', attribute: 'intuition' }),
            running: skill({ name: 'running', attribute: 'strength', group: 'Athletics' }),
            sneaking: skill({ name: 'sneaking', attribute: 'agility', group: 'Stealth' }),
            survival: skill({ name: 'survival', attribute: 'willpower', group: 'Outdoors' }),
            swimming: skill({ name: 'swimming', attribute: 'strength', group: 'Athletics' }),
            tracking: skill({ name: 'tracking', attribute: 'intuition', group: 'Outdoors' }),

            // Social Skills
            con: skill({ name: 'con', attribute: 'charisma', group: 'Acting' }),
            etiquette: skill({ name: 'etiquette', attribute: 'charisma', group: 'Influence' }),
            impersonation: skill({ name: 'impersonation', attribute: 'charisma', group: 'Acting' }),
            instruction: skill({ name: 'instruction', attribute: 'charisma' }),
            intimidation: skill({ name: 'intimidation', attribute: 'charisma' }),
            leadership: skill({ name: 'leadership', attribute: 'charisma', group: 'Influence' }),
            negotiation: skill({ name: 'negotiation', attribute: 'charisma', group: 'Influence' }),
            performance: skill({ name: 'performance', attribute: 'charisma', group: 'Acting' }),

            // Magic Skills
            alchemy: skill({ name: 'alchemy', attribute: 'magic', group: 'Enchanting', canDefault: false }),
            arcana: skill({ name: 'arcana', attribute: 'logic', canDefault: false }),
            artificing: skill({ name: 'artificing', attribute: 'magic', group: 'Enchanting', canDefault: false }),
            assensing: skill({ name: 'assensing', attribute: 'intuition', canDefault: false }),
            astral_combat: skill({ name: 'astral_combat', attribute: 'willpower', canDefault: false }),
            banishing: skill({ name: 'banishing', attribute: 'magic', group: 'Conjuring', canDefault: false }),
            binding: skill({ name: 'binding', attribute: 'magic', group: 'Conjuring', canDefault: false }),
            counterspelling: skill({ name: 'counterspelling', attribute: 'magic', group: 'Sorcery', canDefault: false }),
            disenchanting: skill({ name: 'disenchanting', attribute: 'magic', group: 'Enchanting', canDefault: false }),
            ritual_spellcasting: skill({ name: 'ritual_spellcasting', attribute: 'magic', group: 'Sorcery', canDefault: false }),
            spellcasting: skill({ name: 'spellcasting', attribute: 'magic', group: 'Sorcery', canDefault: false }),
            summoning: skill({ name: 'summoning', attribute: 'magic', group: 'Conjuring', canDefault: false }),

            // Resonance Skills
            compiling: skill({ name: 'compiling', attribute: 'resonance', group: 'Tasking', canDefault: false }),
            decompiling: skill({ name: 'decompiling', attribute: 'resonance', group: 'Tasking', canDefault: false }),
            registering: skill({ name: 'registering', attribute: 'resonance', group: 'Tasking', canDefault: false }),

            // Technical Skills
            aeronautics_mechanic: skill({ name: 'aeronautics_mechanic', attribute: 'logic', group: 'Engineering', canDefault: false }),
            automotive_mechanic: skill({ name: 'automotive_mechanic', attribute: 'logic', group: 'Engineering', canDefault: false }),
            industrial_mechanic: skill({ name: 'industrial_mechanic', attribute: 'logic', group: 'Engineering', canDefault: false }),
            nautical_mechanic: skill({ name: 'nautical_mechanic', attribute: 'logic', group: 'Engineering', canDefault: false }),
            animal_handling: skill({ name: 'animal_handling', attribute: 'charisma' }),
            armorer: skill({ name: 'armorer', attribute: 'logic' }),
            artisan: skill({ name: 'artisan', attribute: 'intuition', canDefault: false }),
            biotechnology: skill({ name: 'biotechnology', attribute: 'logic', group: 'Biotech', canDefault: false }),
            chemistry: skill({ name: 'chemistry', attribute: 'logic', canDefault: false }),
            computer: skill({ name: 'computer', attribute: 'logic', group: 'Electronics' }),
            cybercombat: skill({ name: 'cybercombat', attribute: 'logic', group: 'Cracking' }),
            cybertechnology: skill({ name: 'cybertechnology', attribute: 'logic', group: 'Biotech', canDefault: false }),
            demolitions: skill({ name: 'demolitions', attribute: 'logic' }),
            electronic_warfare: skill({ name: 'electronic_warfare', attribute: 'logic', group: 'Cracking', canDefault: false }),
            first_aid: skill({ name: 'first_aid', attribute: 'logic', group: 'Biotech' }),
            forgery: skill({ name: 'forgery', attribute: 'logic' }),
            hacking: skill({ name: 'hacking', attribute: 'logic', group: 'Cracking' }),
            hardware: skill({ name: 'hardware', attribute: 'logic', group: 'Electronics', canDefault: false }),
            locksmith: skill({ name: 'locksmith', attribute: 'logic', canDefault: false }),
            medicine: skill({ name: 'medicine', attribute: 'logic', group: 'Biotech', canDefault: false }),
            navigation: skill({ name: 'navigation', attribute: 'intuition', group: 'Outdoors' }),
            software: skill({ name: 'software', attribute: 'logic', group: 'Electronics', canDefault: false }),

            // Vehicle Skills
            gunnery: skill({ name: 'gunnery', attribute: 'agility' }),
            pilot_aerospace: skill({ name: 'pilot_aerospace', attribute: 'reaction', canDefault: false }),
            pilot_aircraft: skill({ name: 'pilot_aircraft', attribute: 'reaction', canDefault: false }),
            pilot_walker: skill({ name: 'pilot_walker', attribute: 'reaction', canDefault: false }),
            pilot_ground_craft: skill({ name: 'pilot_ground_craft', attribute: 'reaction' }),
            pilot_water_craft: skill({ name: 'pilot_water_craft', attribute: 'reaction' }),
            pilot_exotic_vehicle: skill({ name: 'pilot_exotic_vehicle', attribute: 'reaction', canDefault: false }), // how to deal with exotic vehicles?
        }
    }
);

console.log(Skills().getInitialValue());

export const KnowledgeSkillList = (initialAttribute: string) => ({
    attribute: new StringField({
        required: true,
        initial: initialAttribute,
        choices: ["willpower", "logic", "intuition", "charisma"]
    }),
    value: new TypedObjectField(new SchemaField(SkillField()), {required: true, initial: {}}),
});

export const KnowledgeSkills = () => ({
    street: new SchemaField(KnowledgeSkillList('intuition')),
    academic: new SchemaField(KnowledgeSkillList('logic')),
    professional: new SchemaField(KnowledgeSkillList('logic')),
    interests: new SchemaField(KnowledgeSkillList('intuition')),
});

// Not yet implemented in fvtt-types curently
export type SkillsType = Record<string, SkillFieldType>;
export type SkillFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof SkillField>>;
export type KnowledgeSkillsType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof KnowledgeSkills>>;

export type KnowledgeSkillCategory = keyof ReturnType<typeof KnowledgeSkills>;
