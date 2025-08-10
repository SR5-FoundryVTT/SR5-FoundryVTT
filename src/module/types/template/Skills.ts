import { ModifiableValue } from "./Base";
import { ModifiableField } from "../fields/ModifiableField";
import { FixedTypeObjectField } from "../fields/FixedTypeObjectField";
const { SchemaField, BooleanField, ArrayField, NumberField, StringField, TypedObjectField } = foundry.data.fields;

export type SkillCategories = 'active' | 'language' | 'knowledge';

export const SkillField = () => ({
    ...ModifiableValue(),
    name: new StringField({ required: true }),
    hidden: new BooleanField(),
    label: new StringField({ required: true }),
    attribute: new StringField({ required: true }),
    _delete: new BooleanField(), // Does it use it?
    specs: new ArrayField(new StringField({ required: true })),
    canDefault: new BooleanField({ initial: true }),
    id: new StringField({ required: true }),
    link: new StringField({ required: true }),
    group: new StringField({ required: true }),
    bonus: new ArrayField(new SchemaField({
        key: new StringField({ required: true }),
        value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    })),
});

function skill(createData: foundry.data.fields.SchemaField.CreateData<ReturnType<typeof SkillField>> = {}) {
    const initialValue = new ModifiableField(SkillField()).getInitialValue(createData);
    return foundry.utils.mergeObject(initialValue, createData);
}

// Use FixedTypeObjectField to allow for DataField.applyChange to work on skills.
// See class documentation for more information.
export const Skills = () => new FixedTypeObjectField(
    new ModifiableField(SkillField()),
    {
        required: true,
        initial: {
            // Combat Skills
            archery: skill({ attribute: 'agility' }),
            automatics: skill({ attribute: 'agility', group: 'Firearms' }),
            blades: skill({ attribute: 'agility', group: 'Close Combat' }),
            clubs: skill({ attribute: 'agility', group: 'Close Combat' }),
            exotic_melee: skill({ attribute: 'agility', canDefault: false }), // how to deal with exotic melee weapons?
            exotic_range: skill({ attribute: 'agility', canDefault: false }), // how to deal with exotic ranged weapons?
            heavy_weapons: skill({ attribute: 'agility', group: 'Firearms' }),
            longarms: skill({ attribute: 'agility', group: 'Firearms' }),
            pistols: skill({ attribute: 'agility', group: 'Firearms' }),
            throwing_weapons: skill({ attribute: 'agility', group: 'Close Combat' }),
            unarmed_combat: skill({ attribute: 'agility', group: 'Close Combat' }),

            // Physical Skills
            disguise: skill({ attribute: 'intuition', group: 'Stealth' }),
            diving: skill({ attribute: 'body' }),
            escape_artist: skill({ attribute: 'agility' }),
            flight: skill({ attribute: 'agility', canDefault: false, hidden: true }),
            free_fall: skill({ attribute: 'body' }),
            gymnastics: skill({ attribute: 'agility', group: 'Athletics' }),
            palming: skill({ attribute: 'agility', group: 'Stealth', canDefault: false }),
            perception: skill({ attribute: 'intuition' }),
            running: skill({ attribute: 'strength', group: 'Athletics' }),
            sneaking: skill({ attribute: 'agility', group: 'Stealth' }),
            survival: skill({ attribute: 'willpower', group: 'Outdoors' }),
            swimming: skill({ attribute: 'strength', group: 'Athletics' }),
            tracking: skill({ attribute: 'intuition', group: 'Outdoors' }),

            // Social Skills
            con: skill({ attribute: 'charisma', group: 'Acting' }),
            etiquette: skill({ attribute: 'charisma', group: 'Influence' }),
            impersonation: skill({ attribute: 'charisma', group: 'Acting' }),
            instruction: skill({ attribute: 'charisma' }),
            intimidation: skill({ attribute: 'charisma' }),
            leadership: skill({ attribute: 'charisma', group: 'Influence' }),
            negotiation: skill({ attribute: 'charisma', group: 'Influence' }),
            performance: skill({ attribute: 'charisma', group: 'Acting' }),

            // Magic Skills
            alchemy: skill({ attribute: 'magic', group: 'Enchanting', canDefault: false }),
            arcana: skill({ attribute: 'logic', canDefault: false }),
            artificing: skill({ attribute: 'magic', group: 'Enchanting', canDefault: false }),
            assensing: skill({ attribute: 'intuition', canDefault: false }),
            astral_combat: skill({ attribute: 'willpower', canDefault: false }),
            banishing: skill({ attribute: 'magic', group: 'Conjuring', canDefault: false }),
            binding: skill({ attribute: 'magic', group: 'Conjuring', canDefault: false }),
            counterspelling: skill({ attribute: 'magic', group: 'Sorcery', canDefault: false }),
            disenchanting: skill({ attribute: 'magic', group: 'Enchanting', canDefault: false }),
            ritual_spellcasting: skill({ attribute: 'magic', group: 'Sorcery', canDefault: false }),
            spellcasting: skill({ attribute: 'magic', group: 'Sorcery', canDefault: false }),
            summoning: skill({ attribute: 'magic', group: 'Conjuring', canDefault: false }),

            // Resonance Skills
            compiling: skill({ attribute: 'resonance', group: 'Tasking', canDefault: false }),
            decompiling: skill({ attribute: 'resonance', group: 'Tasking', canDefault: false }),
            registering: skill({ attribute: 'resonance', group: 'Tasking', canDefault: false }),

            // Technical Skills
            aeronautics_mechanic: skill({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            automotive_mechanic: skill({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            industrial_mechanic: skill({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            nautical_mechanic: skill({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            animal_handling: skill({ attribute: 'charisma' }),
            armorer: skill({ attribute: 'logic' }),
            artisan: skill({ attribute: 'intuition', canDefault: false }),
            biotechnology: skill({ attribute: 'logic', group: 'Biotech', canDefault: false }),
            chemistry: skill({ attribute: 'logic', canDefault: false }),
            computer: skill({ attribute: 'logic', group: 'Electronics' }),
            cybercombat: skill({ attribute: 'logic', group: 'Cracking' }),
            cybertechnology: skill({ attribute: 'logic', group: 'Biotech', canDefault: false }),
            demolitions: skill({ attribute: 'logic' }),
            electronic_warfare: skill({ attribute: 'logic', group: 'Cracking', canDefault: false }),
            first_aid: skill({ attribute: 'logic', group: 'Biotech' }),
            forgery: skill({ attribute: 'logic' }),
            hacking: skill({ attribute: 'logic', group: 'Cracking' }),
            hardware: skill({ attribute: 'logic', group: 'Electronics', canDefault: false }),
            locksmith: skill({ attribute: 'logic', canDefault: false }),
            medicine: skill({ attribute: 'logic', group: 'Biotech', canDefault: false }),
            navigation: skill({ attribute: 'intuition', group: 'Outdoors' }),
            software: skill({ attribute: 'logic', group: 'Electronics', canDefault: false }),

            // Vehicle Skills
            gunnery: skill({ attribute: 'agility' }),
            pilot_aerospace: skill({ attribute: 'reaction', canDefault: false }),
            pilot_aircraft: skill({ attribute: 'reaction', canDefault: false }),
            pilot_walker: skill({ attribute: 'reaction', canDefault: false }),
            pilot_ground_craft: skill({ attribute: 'reaction' }),
            pilot_water_craft: skill({ attribute: 'reaction' }),
            pilot_exotic_vehicle: skill({ attribute: 'reaction', canDefault: false }), // how to deal with exotic vehicles?
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
    value: new TypedObjectField(new ModifiableField(SkillField()), {required: true, initial: {}}),
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
