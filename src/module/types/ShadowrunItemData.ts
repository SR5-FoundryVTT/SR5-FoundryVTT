/// <reference path="./Shadowrun.ts" />
// NOTE: See https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.8.x%5D-Actors-and-Items for reference

/**
 * Types for Item with foundry-vtt-types pattern used:
 * https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.7.x%5D-Actors-and-Items
 *
 * The naming pattern is as follows:
 * - Item. => XYZActorData (WeaponItemData)
 * - Item.system => XYZData (WeaponData)
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
        | EchoItemData
        | HostItemData
        | LifestyleItemData
        | MetamagicItemData
        | ModificationItemData
        | ProgramItemData
        | QualityItemData
        | SinItemData
        | SpellItemData
        | CallInActionItemData
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
     * Also used for the iconAssign function. Will be needed until character and item importers are unified.
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
        Partial<EchoData> &
        Partial<EquipmentData> &
        Partial<HostData> &
        Partial<LifestyleData> &
        Partial<MetamagicData> &
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
        img: string;
        data: ActionData;
        system: ActionData;
    }

    export interface AdeptPowerItemData {
        type: 'adept_power';
        name: string;
        img: string;
        data: AdeptPowerData;
        system: AdeptPowerData;
    }
    export interface AmmoItemData {
        type: 'ammo';
        name: string;
        img: string;
        data: AmmoData;
        system: AmmoData;
        descriptionHTML?: string;
    }
    export interface ArmorItemData {
        type: 'armor';
        name: string;
        img: string;
        data: ArmorData;
        system: ArmorData;
    }
    export interface BiowareItemData {
        type: 'bioware';
        name: string;
        img: string;
        data:  BiowareData;
        system: BiowareData;
    }
    export interface ComplexFormItemData {
        type: 'complex_form';
        name: string;
        img: string;
        data: ComplexFormData;
        system: ComplexFormData;
    }
    export interface ContactItemData {
        type: 'contact';
        name: string;
        img: string;
        data: ContactData;
        system: ContactData;
    }
    export interface CritterPowerItemData {
        type: 'critter_power';
        name: string;
        img: string;
        data: CritterPowerData;
        system: CritterPowerData;
    }
    export interface CyberwareItemData {
        type: 'cyberware';
        name: string;
        img: string;
        data: CyberwareData;
        system: CyberwareData;
    }
    export interface DeviceItemData {
        type: 'device';
        name: string;
        img: string;
        data: DeviceData;
        system: DeviceData;
    }
    export interface EchoItemData {
        type: 'echo';
        name: string;
        img: string;
        data: EchoData;
        system: EchoData;
    }
    export interface EquipmentItemData {
        type: 'equipment';
        name: string;
        img: string;
        data: EquipmentData;
        system: EquipmentData;
    }
    export interface HostItemData {
        type: 'host';
        name: string;
        img: string;
        data: HostData;
        system: HostData;
    }
    export interface LifestyleItemData {
        type: 'lifestyle';
        name: string;
        img: string;
        data: LifestyleData;
        system: LifestyleData;
    }
    export interface MetamagicItemData {
        type: 'metamagic';
        name: string;
        img: string;
        data: MetamagicData;
        system: MetamagicData;
    }
    export interface ModificationItemData {
        type: 'modification';
        name: string;
        img: string;
        data: ModificationData;
        system: ModificationData;
        descriptionHTML?: string;
    }
    export interface ProgramItemData {
        type: 'program';
        name: string;
        img: string;
        data: ProgramData;
        system: ProgramData;
    }
    export interface QualityItemData {
        type: 'quality';
        name: string;
        img: string;
        data: QualityData;
        system: QualityData;
    }
    export interface SinItemData {
        type: 'sin';
        name: string;
        img: string;
        data: SinData;
        system: SinData;
    }
    export interface SpellItemData {
        type: 'spell';
        name: string;
        img: string;
        data: SpellData;
        system: SpellData;
    }
    export interface CallInActionItemData {
        type: 'call_in_action';
        name: string;
        img: string;
        data: CallInActionData;
        system: CallInActionData;
    }
    export interface SpritePowerItemData {
        type: 'sprite_power';
        name: string;
        img: string;
        data: SpritePowerData;
        system: SpritePowerData;
    }
    export interface WeaponItemData {
        type: 'weapon';
        name: string;
        img: string;
        data: WeaponData;
        system: WeaponData;
    }
}