const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const BlastData = {
    radius: new NumberField({ required: true, initial: 0 }),
    dropoff: new NumberField({ required: true, initial: 0 }),
}

const AmmunitionData = {
    spare_clips: new SchemaField(SM.ValueMaxPair, { required: true }),
    current: new SchemaField(SM.ValueMaxPair, { required: true }),
    clip_type: new StringField({
        required: true,
        initial: '',
        choices: [
            'removable_clip',
            'break_action',
            'belt_fed',
            'internal_magazin',
            'muzzle_loader',
            'cylinder',
            'drum',
            'bow',
            ''
        ],
    }),
    partial_reload_value: new NumberField({ required: true, initial: 0 }),
}

const RangeData = {
    short: new NumberField({ required: true, initial: 0 }),
    medium: new NumberField({ required: true, initial: 0 }),
    long: new NumberField({ required: true, initial: 0 }),
    extreme: new NumberField({ required: true, initial: 0 }),
    category: new StringField({
        required: true,
        initial: '',
        choices: Object.keys(SR5CONFIG.weaponRangeCategories),
    }),
    attribute: new StringField({ required: false, initial: '' }),
}

const FiringModeData = {
    single_shot: new BooleanField({ required: true, initial: false }),
    semi_auto: new BooleanField({ required: true, initial: false }),
    burst_fire: new BooleanField({ required: true, initial: false }),
    full_auto: new BooleanField({ required: true, initial: false }),
}

const RangeWeaponData = {
    category: new StringField({ required: true, initial: '' }),
    ranges: new SchemaField(RangeData, { required: true }),
    rc: new SchemaField(SM.ModifiableValue, { required: true }),
    modes: new SchemaField(FiringModeData, { required: true }),
}

const MeleeWeaponData = {
    reach: new NumberField({ required: true, initial: 0 }),
}

const ThrownWeaponData = {
    range: new SchemaField(RangeData, { required: true }),
    blast: new SchemaField(BlastData, { required: true }),
}


const WeaponData = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    category: new StringField({
        required: true,
        initial: '',
        choices: [
            'melee',
            'ranged',
            'thrown',
            ''
        ],
    }),
    subcategory: new StringField({ required: true, initial: '' }),
    ammo: new SchemaField(AmmunitionData, { required: true }),
    range: new SchemaField(RangeWeaponData, { required: true }),
    melee: new SchemaField(MeleeWeaponData, { required: true }),
    thrown: new SchemaField(ThrownWeaponData, { required: true }),
}


export class Weapon extends foundry.abstract.TypeDataModel<typeof WeaponData, Item.Implementation> {
    static override defineSchema() {
        return WeaponData;
    }
}
