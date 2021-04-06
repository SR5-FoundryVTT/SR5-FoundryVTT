/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5VehicleType = SR5ActorBase & {
        data: VehicleActorData;
        type: 'vehicle';
    };

    export type VehicleTypes = 'air' | 'aerospace' | 'ground' | 'water' | 'walker' | 'exotic';

    export type VehicleControlModeTypes = 'manual' | 'remote' | 'rigger' | 'autopilot';

    export type VehicleStat = ModifiableValue & LabelField & ManualModField & CanHideFiled;

    export type VehicleEnvironment = 'speed' | 'handling';

    export type VehicleActorData = CommonActorData &
        ArmorActorData &
        MatrixActorData &
        MovementActorData &
        PhysicalTrackActorData & {
            vehicleType: VehicleTypes;
            controlMode: VehicleControlModeTypes;
            isDrone: boolean;
            isOffRoad: boolean;
            driver: string;
            environment: VehicleEnvironment;
            vehicle_stats: VehicleStats;
        };

    export type VehicleStats = {
        pilot: VehicleStat;
        handling: VehicleStat;
        off_road_handling: VehicleStat;
        speed: VehicleStat;
        off_road_speed: VehicleStat;
        acceleration: VehicleStat;
        sensor: VehicleStat;
    };
}
