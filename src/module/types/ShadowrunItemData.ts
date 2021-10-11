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
        name: string;
        data: ActionData;
    }

    export interface AdeptPowerItemData {
        type: 'adept_power';
        name: string;
        data: AdeptPowerData;
    }
    export interface AmmoItemData {
        type: 'ammo';
        name: string;
        data: AmmoData;
    }
    export interface ArmorItemData {
        type: 'armor';
        name: string;
        data: ArmorData;
    }
    export interface BiowareItemData {
        type: 'bioware';
        name: string;
        data:  BiowareData;
    }
    export interface ComplexFormItemData {
        type: 'complex_form';
        name: string;
        data: ComplexFormData;
    }
    export interface ContactItemData {
        type: 'contact';
        name: string;
        data: ContactData;
    }
    export interface CritterPowerItemData {
        type: 'critter_power';
        name: string;
        data: CritterPowerData;
    }
    export interface CyberwareItemData {
        type: 'cyberware';
        name: string;
        data: CyberwareData;
    }
    export interface DeviceItemData {
        type: 'device';
        name: string;
        data: DeviceData;
    }
    export interface EquipmentItemData {
        type: 'equipment';
        name: string;
        data: EquipmentData;
    }
    export interface HostItemData {
        type: 'host';
        name: string;
        data: HostData;
    }
    export interface LifestyleItemData {
        type: 'lifestyle';
        name: string;
        data: LifestyleData;
    }
    export interface ModificationItemData {
        type: 'modification';
        name: string;
        data: ModificationData;
    }
    export interface ProgramItemData {
        type: 'program';
        name: string;
        data: ProgramData;
    }
    export interface QualityItemData {
        type: 'quality';
        name: string;
        data: QualityData;
    }
    export interface SinItemData {
        type: 'sin';
        name: string;
        data: SinData;
    }
    export interface SpellItemData {
        type: 'spell';
        name: string;
        data: SpellData;
    }
    export interface SpritePowerItemData {
        type: 'sprite_power';
        name: string;
        data: SpritePowerData;
    }
    export interface WeaponItemData {
        type: 'weapon';
        name: string;
        data: WeaponData;
    }
}