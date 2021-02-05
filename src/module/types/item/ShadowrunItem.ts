/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type SR5ItemType =
        | Action
        | AdeptPower
        | Ammo
        | Armor
        | ComplexForm
        | Contact
        | CritterPower
        | Cyberware
        | Bioware
        | Device
        | Equipment
        | Lifestyle
        | Modification
        | Program
        | Quality
        | Sin
        | Spell
        | SpritePower
        | Weapon;

    export type SR5ItemDataPartial = Partial<ActionData> &
        Partial<AdeptPowerData> &
        Partial<AmmoData> &
        Partial<ArmorData> &
        Partial<ComplexFormData> &
        Partial<ContactData> &
        Partial<CritterPowerData> &
        Partial<CyberwareData> &
        Partial<BiowareData> &
        Partial<DeviceData> &
        Partial<EquipmentData> &
        Partial<LifestyleData> &
        Partial<ModificationData> &
        Partial<ProgramData> &
        Partial<QualityData> &
        Partial<SinData> &
        Partial<SpellData> &
        Partial<SpritePowerData> &
        Partial<WeaponData>;

    export type SR5ItemData<DataType> = Item.Data<DataType> & {
        _id: string;
        folder?: string | null;
        permission?: {
            default: number;
        };
    };

    /**
     * Condition data for an item.
     */
    export type ConditionData = ValueMaxPair<number> & LabelField;
}
