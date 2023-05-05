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
        | SummoningItemData
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
        system: ActionData;
    }

    export interface AdeptPowerItemData {
        type: 'adept_power';
        name: string;
        data: AdeptPowerData;
        system: AdeptPowerData;
    }
    export interface AmmoItemData {
        type: 'ammo';
        name: string;
        data: AmmoData;
        system: AmmoData;
    }
    export interface ArmorItemData {
        type: 'armor';
        name: string;
        data: ArmorData;
        system: ArmorData;
    }
    export interface BiowareItemData {
        type: 'bioware';
        name: string;
        data:  BiowareData;
        system: BiowareData;
    }
    export interface ComplexFormItemData {
        type: 'complex_form';
        name: string;
        data: ComplexFormData;
        system: ComplexFormData;
    }
    export interface ContactItemData {
        type: 'contact';
        name: string;
        data: ContactData;
        system: ContactData;
    }
    export interface CritterPowerItemData {
        type: 'critter_power';
        name: string;
        data: CritterPowerData;
        system: CritterPowerData;
    }
    export interface CyberwareItemData {
        type: 'cyberware';
        name: string;
        data: CyberwareData;
        system: CyberwareData;
    }
    export interface DeviceItemData {
        type: 'device';
        name: string;
        data: DeviceData;
        system: DeviceData;
    }
    export interface EquipmentItemData {
        type: 'equipment';
        name: string;
        data: EquipmentData;
        system: EquipmentData;
    }
    export interface HostItemData {
        type: 'host';
        name: string;
        data: HostData;
        system: HostData;
    }
    export interface LifestyleItemData {
        type: 'lifestyle';
        name: string;
        data: LifestyleData;
        system: LifestyleData;
    }
    export interface ModificationItemData {
        type: 'modification';
        name: string;
        data: ModificationData;
        system: ModificationData;
    }
    export interface ProgramItemData {
        type: 'program';
        name: string;
        data: ProgramData;
        system: ProgramData;
    }
    export interface QualityItemData {
        type: 'quality';
        name: string;
        data: QualityData;
        system: QualityData;
    }
    export interface SinItemData {
        type: 'sin';
        name: string;
        data: SinData;
        system: SinData;
    }
    export interface SpellItemData {
        type: 'spell';
        name: string;
        data: SpellData;
        system: SpellData;
    }
    export interface SummoningItemData {
        type: 'summoning'
        name: string
        data: SummoningData
        system: SummoningData
    }
    export interface SpritePowerItemData {
        type: 'sprite_power';
        name: string;
        data: SpritePowerData;
        system: SpritePowerData;
    }
    export interface WeaponItemData {
        type: 'weapon';
        name: string;
        data: WeaponData;
        system: WeaponData;
    }
}