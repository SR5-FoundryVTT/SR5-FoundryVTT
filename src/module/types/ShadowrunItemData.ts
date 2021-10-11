/// <reference path="./Shadowrun.ts" />
// NOTE: See https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.8.x%5D-Actors-and-Items for reference

/**
 * Types for Item.data and Item.data.data with foundry-vtt-types pattern used:
 * https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.7.x%5D-Actors-and-Items
 *
 * The naming pattern is as follows:
 * - Item.data => XYZActorData (WeaponItemData)
 * - Item.data.data => XYZData (WeaponData)
 *
 * Don't put property definitions here. Keep the top level definitions clean.
 *
 */
declare namespace Shadowrun {
    // Register your global ItemData types here.  Try sorting your ItemData types alphabetically.
    export type ShadowrunItemData =
        | ActionItemData
        | AdeptPowerItemData
        | AmmoItemData
        | ArmorItemData
        | BiowareItemData
        | ComplexFormItemData
        | ContactItemData
        | CritterPowerItemData
        | CyberwareItemData
        | DeviceItemData
        | EquipmentItemData
        | HostItemData
        | LifestyleItemData
        | ModificationItemData
        | ProgramItemData
        | QualityItemData
        | SinItemData
        | SpellItemData
        | SpritePowerItemData
        | WeaponItemData;

    /**
     * The subset of items with technology data part.
     */
    export type ShadowrunTechnologyItemData =
        AmmoItemData |
        ArmorItemData |
        DeviceItemData |
        EquipmentItemData |
        ModificationItemData |
        ProgramItemData |
        SinItemData |
        WareItemData |
        WeaponItemData;

    /**
     * The whole item data data as an inclusive union.
     *
     * At the moment this is only used for ShadowrunItemDataWrapper.getData to work a type narrowing rework.
     */
    export type ShadowrunItemDataData =
        Partial<ActionData> &
        Partial<AdeptPowerData> &
        Partial<AmmoData> &
        Partial<ArmorData> &
        Partial<BiowareData> &
        Partial<ComplexFormData> &
        Partial<ContactData> &
        Partial<CritterPowerData> &
        Partial<CyberwareData> &
        Partial<DeviceData> &
        Partial<EquipmentData> &
        Partial<HostData> &
        Partial<LifestyleData> &
        Partial<ModificationData> &
        Partial<ProgramData> &
        Partial<QualityData> &
        Partial<SinData> &
        Partial<SpellData> &
        Partial<SpritePowerData> &
        Partial<WeaponData>;

    // Setup your ItemData types below here. Try sorting your ItemData types alphabetically.
    export interface ActionItemData {
        type: 'action';
        data: ActionData;
    }

    export interface AdeptPowerItemData {
        type: 'adept_power';
        data: AdeptPowerData;
    }
    export interface AmmoItemData {
        type: 'ammo';
        data: AmmoData;
    }
    export interface ArmorItemData {
        type: 'armor';
        data: ArmorData;
    }
    export interface BiowareItemData {
        type: 'bioware';
        data:  BiowareData;
    }
    export interface ComplexFormItemData {
        type: 'complex_form';
        data: ComplexFormData;
    }
    export interface ContactItemData {
        type: 'contact';
        data: ContactData;
    }
    export interface CritterPowerItemData {
        type: 'critter_power';
        data: CritterPowerData;
    }
    export interface CyberwareItemData {
        type: 'cyberware';
        data: CyberwareData;
    }
    export interface DeviceItemData {
        type: 'device';
        data: DeviceData;
    }
    export interface EquipmentItemData {
        type: 'equipment';
        data: EquipmentData;
    }
    export interface HostItemData {
        type: 'host';
        data: HostData;
    }
    export interface LifestyleItemData {
        type: 'lifestyle';
        data: LifestyleData;
    }
    export interface ModificationItemData {
        type: 'modification';
        data: ModificationData;
    }
    export interface ProgramItemData {
        type: 'program';
        data: ProgramData;
    }
    export interface QualityItemData {
        type: 'quality';
        data: QualityData;
    }
    export interface SinItemData {
        type: 'sin';
        data: SinData;
    }
    export interface SpellItemData {
        type: 'spell';
        data: SpellData;
    }
    export interface SpritePowerItemData {
        type: 'sprite_power';
        data: SpritePowerData;
    }
    export interface WeaponItemData {
        type: 'weapon';
        data: WeaponData;
    }
}