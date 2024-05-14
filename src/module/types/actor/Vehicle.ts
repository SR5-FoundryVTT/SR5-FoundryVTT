/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type VehicleTypes = 'air' | 'aerospace' | 'ground' | 'water' | 'walker' | 'exotic'

    export type VehicleControlModeTypes = 'manual' | 'remote' | 'rigger' | 'autopilot'

    export type VehicleStat =
        ModifiableValue &
        LabelField &
        ManualModField &
        CanHideFiled

    export type VehicleEnvironment = 'speed' | 'handling'

    type VehicleAttributes = Attributes & {
        pilot: AttributeField
    }

    export interface VehicleData extends
        CommonData,
        ArmorActorData,
        MatrixActorData,
        MovementActorData,
        PhysicalTrackActorData {
            values: PhysicalCombatValues
            vehicleType: VehicleTypes
            controlMode: VehicleControlModeTypes
            isDrone: boolean
            isOffRoad: boolean
            driver: string
            environment: VehicleEnvironment
            vehicle_stats: VehicleStats
            attributes: VehicleAttributes
            networkController: string
            modifiers: Modifiers & CommonModifiers
            modificationCategories: VehicleModCategories
            modPoints: number
        }

    export interface VehicleStats {
        pilot: VehicleStat
        handling: VehicleStat
        off_road_handling: VehicleStat
        speed: VehicleStat
        off_road_speed: VehicleStat
        acceleration: VehicleStat
        sensor: VehicleStat
        seats: VehicleStat
    }

    export interface VehicleModCategories {
        body: number
        power_tain: number
        protection: number
        electromagnetic: number
        cosmetic: number
        weapons: number
    }
}
