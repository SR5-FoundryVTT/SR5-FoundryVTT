const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ValueMaxPair, ModifiableValue } from "../template/BaseModel";
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { ActionPartData } from "./ActionModel";

export const BlastData = () => ({
    radius: new NumberField({ required: true, nullable: false, initial: 0 }),
    dropoff: new NumberField({ required: true, nullable: false, initial: 0 }),
});

const AmmunitionData = () => ({
    spare_clips: new SchemaField(ValueMaxPair(), { required: true }),
    current: new SchemaField(ValueMaxPair(), { required: true }),
    clip_type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['removable_clip', 'break_action', 'belt_fed', 'internal_magazin', 'muzzle_loader', 'cylinder', 'drum', 'bow', ''],
    }),
    partial_reload_value: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const RangeData = () => ({
    short: new NumberField({ required: true, nullable: false, initial: 0 }),
    medium: new NumberField({ required: true, nullable: false, initial: 0 }),
    long: new NumberField({ required: true, nullable: false, initial: 0 }),
    extreme: new NumberField({ required: true, nullable: false, initial: 0 }),
    category: new StringField({ required: true, initial: '' }),
    // attribute: new StringField({ required: false, initial: '' }),
});

const FiringModeData = () => ({
    single_shot: new BooleanField({ required: true, initial: false }),
    semi_auto: new BooleanField({ required: true, initial: false }),
    burst_fire: new BooleanField({ required: true, initial: false }),
    full_auto: new BooleanField({ required: true, initial: false }),
});

const RangeWeaponData = () => ({
    category: new StringField({ required: true, initial: '' }),
    ranges: new SchemaField(RangeData(), { required: true }),
    rc: new SchemaField(ModifiableValue(), { required: true }),
    modes: new SchemaField(FiringModeData(), { required: true }),
});

const MeleeWeaponData = () => ({
    reach: new NumberField({ required: true, nullable: false, initial: 0 }),
});

const ThrownWeaponData = () => ({
    range: new SchemaField(RangeData(), { required: true }),
    blast: new SchemaField(BlastData(), { required: true }),
});

const WeaponData = {
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    category: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['melee', 'ranged', 'thrown', ''],
    }),
    subcategory: new StringField({ required: true, initial: '' }),
    ammo: new SchemaField(AmmunitionData(), { required: true }),
    range: new SchemaField(RangeWeaponData(), { required: true }),
    melee: new SchemaField(MeleeWeaponData(), { required: true }),
    thrown: new SchemaField(ThrownWeaponData(), { required: true }),
}


export class Weapon extends foundry.abstract.TypeDataModel<typeof WeaponData, Item.Implementation> {
    static override defineSchema() {
        return WeaponData;
    }
}

console.log("WeaponData", WeaponData, new Weapon());

export type RangeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeData>>;
export type BlastType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BlastData>>;
export type AmmunitionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AmmunitionData>>;
export type RangeWeaponType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeWeaponData>>;
