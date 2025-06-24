import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpellData = {
    action: new SchemaField(ActionRollData({test: 'SpellCastingTest', followedTest: 'DrainTest'}), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

    type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['physical', 'mana', '']
    }),
    category: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['combat', 'detection', 'enchantment', 'health', 'illusion', 'manipulation', 'ritual', ''] // what to do with enchantment (from chummer)?
    }),
    drain: new NumberField({ required: true, nullable: false, initial: 0 }),
    range: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['touch', 'los', 'los_a', '']
    }),
    duration: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['instant', 'sustained', 'permanent', '']
    }),

    extended: new BooleanField({ initial: false }),
    combat: new SchemaField({
        type: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ['direct', 'indirect', '']
        }),
    }),
    detection: new SchemaField({
        type: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ['directional', 'psychic', 'area', '']
        }),
        passive: new BooleanField({ required: true, initial: false }),
        extended: new BooleanField({ required: true, initial: false }), // do we need this?
    }),
    illusion: new SchemaField({
        type: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ['obvious', 'realistic', '']
        }),
        sense: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ['single-sense', 'multi-sense', '']
        }),
    }),
    manipulation: new SchemaField({
        damaging: new BooleanField({ required: true, initial: false }),
        mental: new BooleanField({ required: true, initial: false }),
        environmental: new BooleanField({ required: true, initial: false }),
        physical: new BooleanField({ required: true, initial: false }),
    }),
    ritual: new SchemaField({
        type: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ['anchored', 'material_link', 'minion', 'spell', 'spotter', '']
        }),
    }),
}

export class Spell extends foundry.abstract.TypeDataModel<typeof SpellData, Item.Implementation> {
    static override defineSchema() {
        return SpellData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        const result = source as Spell['_source'];

        // Reset broken legacy data.
        if (source.category === 'rituals')
            result.category = 'ritual';

        return super.migrateData(source);
    }
}

console.log("SpellData", SpellData, new Spell());
