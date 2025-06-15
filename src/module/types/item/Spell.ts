import { DescriptionPartData } from "../template/Description";
import { ImportFlags } from "../template/ImportFlags";
import { ActionPartData } from "./Action";

const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const CombatSpellData = ()=> ({
    type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['direct', 'indirect', '']
    }),
});

const DetectionSpellData = () => ({
    type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['directional', 'psychic', 'area', '']
    }),
    passive: new BooleanField({ required: true, initial: false }),
    extended: new BooleanField({ required: true, initial: false }),
});

const IllusionSpellData = () => ({
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
});

const ManipulationSpellData = () => ({
    damaging: new BooleanField({ required: true, initial: false }),
    mental: new BooleanField({ required: true, initial: false }),
    environmental: new BooleanField({ required: true, initial: false }),
    physical: new BooleanField({ required: true, initial: false }),
});

const RitualSpellData = () => ({
    ritual: new SchemaField({
        type: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ['anchored', 'material_link', 'minion', 'spell', 'spotter', '']
        }),
    }, { required: true }),
});

const SpellData = {
    ...DescriptionPartData(),
    ...ImportFlags(),
    ...ActionPartData(),
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

    extended: new BooleanField({ required: true, initial: false }),
    combat: new SchemaField(CombatSpellData(), { required: true }),
    detection: new SchemaField(DetectionSpellData(), { required: true }),
    illusion: new SchemaField(IllusionSpellData(), { required: true }),
    manipulation: new SchemaField(ManipulationSpellData(), { required: true }),
    ritual: new SchemaField(RitualSpellData(), { required: true }),
}


export class Spell extends foundry.abstract.TypeDataModel<typeof SpellData, Item.Implementation> {
    static override defineSchema() {
        return SpellData;
    }
}

console.log("SpellData", SpellData, new Spell());
