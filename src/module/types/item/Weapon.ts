import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { ModifiableField } from "../fields/ModifiableField";
import { ValueMaxPair, ModifiableValue } from "../template/Base";
import { SR5 } from '@/module/config';
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const BlastData = () => ({
    radius: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    dropoff: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

const AmmunitionData = () => ({
    spare_clips: new SchemaField(ValueMaxPair()),
    current: new SchemaField(ValueMaxPair()),
    clip_type: new StringField({
        blank: true,
        required: true,
        choices: SR5.weaponCliptypes,
    }),
    partial_reload_value: new NumberField({ required: true, nullable: false, integer: true, initial: -1 }),
});

export const RangeData = () => ({
    short: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    medium: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    long: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    extreme: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    category: new StringField({ required: true, initial: 'manual', choices: SR5.weaponRangeCategories }),
    attribute: new StringField({ required: true }),
});

const FiringModeData = () => ({
    single_shot: new BooleanField(),
    semi_auto: new BooleanField(),
    burst_fire: new BooleanField(),
    full_auto: new BooleanField(),
});

export const RangeWeaponData = () => ({
    ranges: new SchemaField(RangeData()),
    rc: new ModifiableField(ModifiableValue()),
    modes: new SchemaField(FiringModeData()),
});

const MeleeWeaponData = () => ({
    reach: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

const ThrownWeaponData = () => ({
    ranges: new SchemaField(RangeData()),
    blast: new SchemaField(BlastData()),
});

const WeaponData = () => ({
    ...BaseItemData(),
    ...ActionPartData({ opposedTest: "PhysicalDefenseTest", resistTest: "PhysicalDefenseTest" }),
    ...TechnologyPartData(),

    category: new StringField({
        blank: true,
        required: true,
        choices: SR5.weaponCategories,
    }),
    subcategory: new StringField({ required: true }),
    ammo: new SchemaField(AmmunitionData()),
    range: new SchemaField(RangeWeaponData()),
    melee: new SchemaField(MeleeWeaponData()),
    thrown: new SchemaField(ThrownWeaponData()),
});

export class Weapon extends ItemBase<ReturnType<typeof WeaponData>> {
    static override defineSchema() {
        return WeaponData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Weapon", "SR5.Item"];
}

console.log("WeaponData", WeaponData(), new Weapon());

export type RangeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeData>>;
export type BlastType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BlastData>>;
export type FiringModeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof FiringModeData>>;
export type AmmunitionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AmmunitionData>>;
export type RangeWeaponType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeWeaponData>>;
