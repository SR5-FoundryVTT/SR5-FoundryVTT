import { group } from "console";
import { ModifiableValue, KeyValuePair } from "./Base";
import { track } from "node_modules/fvtt-types/src/foundry/common/prosemirror/schema/other.mjs";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField, TypedObjectField } = foundry.data.fields;

export type SkillCategories = 'active' | 'language' | 'knowledge';

export const SkillField = () => ({
    ...ModifiableValue(),
    name: new StringField({ required: true, initial: '' }),
    hidden: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
    bonus: new ArrayField(new SchemaField(KeyValuePair())),
    attribute: new StringField({ required: true, initial: '' }),
    _delete: new BooleanField({ required: true, initial: false }), // Does it use it?
    specs: new ArrayField(new StringField({ required: true, initial: '' })),
    canDefault: new BooleanField({ required: true, initial: false }),
    id: new StringField({ required: true, initial: '' }),
    link: new StringField({ required: true, initial: '' }),
    group: new StringField({ required: true, initial: '' }),
});

function createSkillField(createData: foundry.data.fields.SchemaField.CreateData<ReturnType<typeof SkillField>> = {}): SkillFieldType {
    const initialValue = new SchemaField(SkillField()).getInitialValue();
    return foundry.utils.mergeObject(initialValue, createData) as SkillFieldType;
}

export const Skills = () => new TypedObjectField(
    new SchemaField(SkillField()),
    {
        required: true,
        initial: {
            archery: createSkillField({ attribute: 'agility' }),
            automatics: createSkillField({ attribute: 'agility', group: 'Firearms' }),
            blades: createSkillField({ attribute: 'agility', group: 'Close Combat' }),
            clubs: createSkillField({ attribute: 'agility', group: 'Close Combat' }),
            exotic_melee: createSkillField({ attribute: 'agility', group: 'Close Combat', canDefault: false }),
            exotic_range: createSkillField({ attribute: 'agility', group: 'Firearms', canDefault: false }),
            heavy_weapons: createSkillField({ attribute: 'agility', group: 'Firearms' }),
            longarms: createSkillField({ attribute: 'agility', group: 'Firearms' }),
            pistols: createSkillField({ attribute: 'agility', group: 'Firearms' }),
            throwing_weapons: createSkillField({ attribute: 'agility', group: 'Close Combat' }),
            unarmed_combat: createSkillField({ attribute: 'agility', group: 'Close Combat' }),
            disguise: createSkillField({ attribute: 'intuition', group: 'Stealth' }),
            diving: createSkillField({ attribute: 'body' }),
            escape_artist: createSkillField({ attribute: 'agility' }),
            flight: createSkillField({ attribute: 'agility', canDefault: false, hidden: true }),
            free_fall: createSkillField({ attribute: 'body' }),
            gymnastics: createSkillField({ attribute: 'agility', group: 'Athletics' }),
            palming: createSkillField({ attribute: 'agility', group: 'Stealth', canDefault: false }),
            perception: createSkillField({ attribute: 'intuition' }),
            running: createSkillField({ attribute: 'strength', group: 'Athletics' }),
            sneaking: createSkillField({ attribute: 'agility', group: 'Stealth' }),
            survival: createSkillField({ attribute: 'willpower', group: 'Outdoors' }),
            swimming: createSkillField({ attribute: 'strength', group: 'Athletics' }),
            tracking: createSkillField({ attribute: 'intuition', group: 'Outdoors' }),
            con: createSkillField({ attribute: 'charisma', group: 'Acting' }),
            etiquette: createSkillField({ attribute: 'charisma', group: 'Influence' }),
            impersonation: createSkillField({ attribute: 'charisma', group: 'Acting' }),
            instruction: createSkillField({ attribute: 'charisma' }),
            intimidation: createSkillField({ attribute: 'charisma' }),
            leadership: createSkillField({ attribute: 'charisma', group: 'Influence' }),
            negotiation: createSkillField({ attribute: 'charisma', group: 'Influence' }),
            performance: createSkillField({ attribute: 'charisma', group: 'Acting' }),
            alchemy: createSkillField({ attribute: 'magic', group: 'Enchanting', canDefault: false }),
            arcana: createSkillField({ attribute: 'logic', canDefault: false }),
            artificing: createSkillField({ attribute: 'magic', group: 'Enchanting', canDefault: false }),
            assensing: createSkillField({ attribute: 'intuition', canDefault: false }),
            astral_combat: createSkillField({ attribute: 'willpower', canDefault: false }),
            banishing: createSkillField({ attribute: 'magic', group: 'Conjuring', canDefault: false }),
            binding: createSkillField({ attribute: 'magic', group: 'Conjuring', canDefault: false }),
            counterspelling: createSkillField({ attribute: 'magic', group: 'Sorcery', canDefault: false }),
            disenchanting: createSkillField({ attribute: 'magic', group: 'Enchanting', canDefault: false }),
            ritual_spellcasting: createSkillField({ attribute: 'magic', group: 'Sorcery', canDefault: false }),
            spellcasting: createSkillField({ attribute: 'magic', group: 'Sorcery', canDefault: false }),
            summoning: createSkillField({ attribute: 'magic', group: 'Conjuring', canDefault: false }),
            compiling: createSkillField({ attribute: 'resonance', group: 'Tasking', canDefault: false }),
            decompiling: createSkillField({ attribute: 'resonance', group: 'Tasking', canDefault: false }),
            registering: createSkillField({ attribute: 'resonance', group: 'Tasking', canDefault: false }),
            aeronautics_mechanic: createSkillField({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            automotive_mechanic: createSkillField({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            industrial_mechanic: createSkillField({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            nautical_mechanic: createSkillField({ attribute: 'logic', group: 'Engineering', canDefault: false }),
            animal_handling: createSkillField({ attribute: 'charisma' }),
            armorer: createSkillField({ attribute: 'logic' }),
            artisan: createSkillField({ attribute: 'intuition', canDefault: false }),
            biotechnology: createSkillField({ attribute: 'logic', group: 'Biotech', canDefault: false }),
            chemistry: createSkillField({ attribute: 'logic', canDefault: false }),
            computer: createSkillField({ attribute: 'logic', group: 'Electronics' }),
            cybercombat: createSkillField({ attribute: 'logic', group: 'Cracking' }),
            cybertechnology: createSkillField({ attribute: 'logic', group: 'Biotech', canDefault: false }),
            demolitions: createSkillField({ attribute: 'logic' }),
            electronic_warfare: createSkillField({ attribute: 'logic', group: 'Cracking', canDefault: false }),
            first_aid: createSkillField({ attribute: 'logic', group: 'Biotech' }),
            forgery: createSkillField({ attribute: 'logic' }),
            hacking: createSkillField({ attribute: 'logic', group: 'Cracking' }),
            hardware: createSkillField({ attribute: 'logic', group: 'Electronics', canDefault: false }),
            locksmith: createSkillField({ attribute: 'logic', canDefault: false }),
            medicine: createSkillField({ attribute: 'logic', group: 'Biotech', canDefault: false }),
            navigation: createSkillField({ attribute: 'intuition', group: 'Outdoors' }),
            software: createSkillField({ attribute: 'logic', group: 'Electronics', canDefault: false }),
            gunnery: createSkillField({ attribute: 'agility' }),
            pilot_aerospace: createSkillField({ attribute: 'reaction', canDefault: false }),
            pilot_aircraft: createSkillField({ attribute: 'reaction', canDefault: false }),
            pilot_walker: createSkillField({ attribute: 'reaction', canDefault: false }),
            pilot_ground_craft: createSkillField({ attribute: 'reaction' }),
            pilot_water_craft: createSkillField({ attribute: 'reaction' }),
            pilot_exotic_vehicle: createSkillField({ attribute: 'reaction', canDefault: false }),
        }
    }
);

export const KnowledgeSkillList = (initialAttribute: string) => ({
    attribute: new StringField({
        required: true,
        initial: initialAttribute,
        choices: ["willpower", "logic", "intuition", "charisma"]
    }),
    value: Skills(),
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
