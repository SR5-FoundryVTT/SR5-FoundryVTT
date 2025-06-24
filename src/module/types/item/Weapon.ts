import { Action, ActionRollData } from "./Action";
import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
import { ValueMaxPair, ModifiableValue } from "../template/Base";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

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
    partial_reload_value: new NumberField({ required: true, nullable: false, initial: -1 }),
});

export const RangeData = () => ({
    short: new NumberField({ required: true, nullable: false, initial: 0 }),
    medium: new NumberField({ required: true, nullable: false, initial: 0 }),
    long: new NumberField({ required: true, nullable: false, initial: 0 }),
    extreme: new NumberField({ required: true, nullable: false, initial: 0 }),
    category: new StringField({ required: true, initial: 'manual' }), // I believe we don't use this, we could use the value from the RangeWeaponData
    attribute: new StringField({ required: true, initial: '' }),
});

const FiringModeData = () => ({
    single_shot: new BooleanField({ required: true, initial: false }),
    semi_auto: new BooleanField({ required: true, initial: false }),
    burst_fire: new BooleanField({ required: true, initial: false }),
    full_auto: new BooleanField({ required: true, initial: false }),
});

const RangeWeaponData = () => ({
    category: new StringField({ required: true, initial: 'manual' }),
    ranges: new SchemaField(RangeData(), { required: true }),
    rc: new SchemaField(ModifiableValue(), { required: true }),
    modes: new SchemaField(FiringModeData(), { required: true }),
});

const MeleeWeaponData = () => ({
    reach: new NumberField({ required: true, nullable: false, initial: 0 }),
});

const ThrownWeaponData = () => ({
    ranges: new SchemaField(RangeData(), { required: true }),
    blast: new SchemaField(BlastData(), { required: true }),
});

const WeaponData = {
    action: new SchemaField(ActionRollData({test: '', opposedTest: 'PhysicalDefenseTest', resistTest: 'PhysicalResistTest'}), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),

    category: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['melee', 'range', 'thrown', ''],
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

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        Action.migrateData(source);

        return super.migrateData(source);
    }
}

console.log("WeaponData", WeaponData, new Weapon());

export type RangeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeData>>;
export type BlastType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BlastData>>;
export type FiringModeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof FiringModeData>>;
export type AmmunitionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AmmunitionData>>;
export type RangeWeaponType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeWeaponData>>;
