import { Action, ActionRollData } from "./Action";
import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
import { ValueMaxPair, ModifiableValue } from "../template/Base";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const BlastData = () => ({
    radius: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    dropoff: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

const AmmunitionData = () => ({
    spare_clips: new SchemaField(ValueMaxPair()),
    current: new SchemaField(ValueMaxPair()),
    clip_type: new StringField({
        blank: true,
        required: true,
        choices: ['removable_clip', 'break_action', 'belt_fed', 'internal_magazin', 'muzzle_loader', 'cylinder', 'drum', 'bow', ''],
    }),
    partial_reload_value: new NumberField({ required: true, nullable: false, integer: true, initial: -1 }),
});

export const RangeData = () => ({
    short: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    medium: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    long: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    extreme: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    category: new StringField({ required: true, initial: 'manual' }), // I believe we don't use this, we could use the value from the RangeWeaponData
    attribute: new StringField({ required: true }),
});

const FiringModeData = () => ({
    single_shot: new BooleanField(),
    semi_auto: new BooleanField(),
    burst_fire: new BooleanField(),
    full_auto: new BooleanField(),
});

const RangeWeaponData = () => ({
    category: new StringField({ required: true, initial: 'manual' }),
    ranges: new SchemaField(RangeData()),
    rc: new SchemaField(ModifiableValue()),
    modes: new SchemaField(FiringModeData()),
});

const MeleeWeaponData = () => ({
    reach: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

const ThrownWeaponData = () => ({
    ranges: new SchemaField(RangeData()),
    blast: new SchemaField(BlastData()),
});

const WeaponData = {
    action: new SchemaField(ActionRollData({test: '', opposedTest: 'PhysicalDefenseTest', resistTest: 'PhysicalResistTest'})),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),

    category: new StringField({
        blank: true,
        required: true,
        choices: ['melee', 'range', 'thrown', ''],
    }),
    subcategory: new StringField({ required: true }),
    ammo: new SchemaField(AmmunitionData()),
    range: new SchemaField(RangeWeaponData()),
    melee: new SchemaField(MeleeWeaponData()),
    thrown: new SchemaField(ThrownWeaponData()),
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
