/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5VehicleType = SR5ActorBase & {
        data: VehicleActorData;
        type: 'vehicle';
    };

    export type VehicleTypes = keyof typeof CONFIG.SR5.vehicle.types;

    export type VehicleControlModeTypes = keyof typeof CONFIG.SR5.vehicle.control_modes;

    export type VehicleStat = ModifiableValue & LabelField & ManualModField & CanHideFiled;

    export type VehicleActorData = ArmorActorData &
        MatrixActorData &
        MovementActorData &
        PhysicalTrackActorData & {
            vehicleType: VehicleTypes;
            controlMode: VehicleControlModeTypes;
            isDrone: boolean;
            isOffRoad: boolean;
            vehicle_stats: {
                pilot: VehicleStat;
                handling: VehicleStat;
                off_road_handling: VehicleStat;
                speed: VehicleStat;
                off_road_speed: VehicleStat;
                acceleration: VehicleStat;
                sensor: VehicleStat;
            };

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
}
