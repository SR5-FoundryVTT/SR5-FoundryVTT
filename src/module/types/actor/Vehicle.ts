/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5VehicleType = SR5ActorBase & {
        data: VehicleData;
        type: 'vehicle';
    };

    export type VehicleTypes = 'air' | 'aerospace' | 'ground' | 'water' | 'walker' | 'exotic';

    export type VehicleControlModeTypes = 'manual' | 'remote' | 'rigger' | 'autopilot';

    export type VehicleStat = ModifiableValue & LabelField & ManualModField & CanHideFiled;

    export type VehicleEnvironment = 'speed' | 'handling';

    export type VehicleData = ArmorActorData &
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

            attributes: Attributes;
            limits: Limits;
            skills: {
                active: Skills;
                language: KnowledgeSkillList;
                knowledge: KnowledgeSkills;
            };
            initiative: Initiative;
            modifiers: Modifiers;
            special: SpecialTrait;
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
