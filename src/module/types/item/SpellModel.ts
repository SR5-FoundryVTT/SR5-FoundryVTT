const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const CombatSpellData = {
    type: new StringField({
        required: true,
        initial: '',
        choices: ['direct', 'indirect', '']
    }),
}

const DetectionSpellData = {
    type: new StringField({
        required: true,
        initial: '',
        choices: ['directional', 'psychic', 'area', '']
    }),
    passive: new BooleanField({ required: true, initial: false }),
    extended: new BooleanField({ required: true, initial: false }),
}

const IllusionSpellData = {
    type: new StringField({
        required: true,
        initial: '',
        choices: ['obvious', 'realistic', '']
    }),
    sense: new StringField({
        required: true,
        initial: '',
        choices: ['single-sense', 'multi-sense', '']
    }),
}

const ManipulationSpellData = {
    damaging: new BooleanField({ required: true, initial: false }),
    mental: new BooleanField({ required: true, initial: false }),
    environmental: new BooleanField({ required: true, initial: false }),
    physical: new BooleanField({ required: true, initial: false }),
}

const RitualSpellData = {
    ritual: new SchemaField({
        type: new StringField({
            required: true,
            initial: '',
            choices: ['anchored', 'material_link', 'minion', 'spell', 'spotter', '']
        }),
    }, { required: true }),
}

const SpellPartData = {
    type: new StringField({
        required: true,
        initial: '',
        choices: ['physical', 'mana', '']
    }),
    category: new StringField({
        required: true,
        initial: '',
        choices: ['combat', 'detection', 'health', 'illusion', 'manipulation', 'ritual', '']
    }),
    drain: new NumberField({ required: true, initial: 0 }),
    range: new StringField({
        required: true,
        initial: '',
        choices: ['touch', 'los', 'los_a', '']
    }),
    duration: new StringField({
        required: true,
        initial: '',
        choices: ['instant', 'sustained', 'permanent', '']
    }),

    extended: new BooleanField({ required: true, initial: false }),
    combat: new SchemaField(CombatSpellData, { required: true }),
    detection: new SchemaField(DetectionSpellData, { required: true }),
    illusion: new SchemaField(IllusionSpellData, { required: true }),
    manipulation: new SchemaField(ManipulationSpellData, { required: true }),
    ritual: new SchemaField(RitualSpellData, { required: true }),
}

export class Spell extends foundry.abstract.TypeDataModel<typeof SpellPartData, Item.Implementation> {
    static override defineSchema() {
        return SpellPartData;
    }
}
