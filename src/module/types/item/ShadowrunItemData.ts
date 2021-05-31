/// <reference path="../Shadowrun.ts" />

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
 * TODO: Remove all none foundry-vtt-types with naming collision to the interfaces like WeaponActorData2
 * TODO: Remove all 2 names
 */
declare namespace Shadowrun {
    // Register your global ItemData types here.  Try sorting your ItemData types alphabetically.
    export type ShadowrunItemData =
        ActionItemData |
        AdeptPowerItemData |
        AmmoItemData |
        ArmorItemData |
        BiowareItemData |
        ComplexFormItemData |
        ContactItemData |
        CritterPowerItemData |
        CyberwareItemData |
        DeviceItemData |
        EquipmentItemData |
        LifestyleItemData |
        ModificationItemData |
        ProgramItemData |
        QualityItemData |
        SinItemData |
        SpellItemData |
        SpritePowerItemData |
        WeaponItemData;

    export type ItemTypesData =
        ActionData |
        AdeptPowerData |
        AmmoData |
        ArmorData |
        BiowareData |
        ComplexFormData |
        ContactData |
        CritterPowerData |
        CyberwareData |
        DeviceData |
        EquipmentData |
        LifestyleData |
        ModificationData |
        ProgramData |
        QualityData |
        SinData |
        SpellData |
        SpritePowerData |
        WeaponData;

    // Setup your ItemData types below here. Try sorting your ItemData types alphabetically.
    export interface ActionItemData extends Item.Data<ActionData> {
        type: 'action'
    }
    export interface AdeptPowerItemData extends Item.Data<AdeptPowerData> {
        type: 'adept_power'
    }
    export interface AmmoItemData extends Item.Data<AmmoData> {
        type: 'ammo'
    }
    export interface ArmorItemData extends Item.Data<ArmorData> {
        type: 'armor'
    }
    export interface BiowareItemData extends Item.Data<BiowareData> {
        type: 'bioware'
    }
    export interface ComplexFormItemData extends Item.Data<ComplexFormData> {
        type: 'complex_form'
    }
    export interface ContactItemData extends Item.Data<ContactData> {
        type: 'contact'
    }
    export interface CritterPowerItemData extends Item.Data<CritterPowerData> {
        type: 'critter_power'
    }
    export interface CyberwareItemData extends Item.Data<CyberwareData> {
        type: 'cyberware'
    }
    export interface DeviceItemData extends Item.Data<DeviceData> {
        type: 'device'
    }
    export interface EquipmentItemData extends Item.Data<EquipmentData> {
        type: 'equipment'
    }
    export interface LifestyleItemData extends Item.Data<LifestyleData> {
        type: 'lifestyle'
    }
    export interface ModificationItemData extends Item.Data<ModificationData> {
        type: 'modification'
    }
    export interface ProgramItemData extends Item.Data<ProgramData> {
        type: 'program'
    }
    export interface QualityItemData extends Item.Data<QualityData> {
        type: 'quality'
    }
    export interface SinItemData extends Item.Data<SinData> {
        type: 'sin'
    }
    export interface SpellItemData extends Item.Data<SpellData> {
        type: 'spell'
    }
    export interface SpritePowerItemData extends Item.Data<SpritePowerData> {
        type: 'sprite_power'
    }
    export interface WeaponItemData extends Item.Data<WeaponData> {
        type: 'weapon'
    }
}