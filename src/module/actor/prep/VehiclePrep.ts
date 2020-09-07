import { BaseActorPrep } from './BaseActorPrep';
import SR5VehicleType = Shadowrun.SR5VehicleType;
import VehicleActorData = Shadowrun.VehicleActorData;
import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { MovementPrep } from './functions/MovementPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';

export class VehiclePrep extends BaseActorPrep<SR5VehicleType, VehicleActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);

        VehiclePrep.prepareVehicleStats(this.data);
        VehiclePrep.prepareVehicleAttributesAndLimits(this.data);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        VehiclePrep.prepareVehicleConditionMonitors(this.data);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);
        MatrixPrep.prepareAttributesForDevice(this.data);

        MovementPrep.prepareMovement(this.data);

        InitiativePrep.prepareMeatspaceInit(this.data);
        InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);
    }

    static prepareVehicleStats(data: VehicleActorData) {
        const { vehicle_stats, isOffRoad } = data;
        // set the value for the stats
        for (let [key, stat] of Object.entries(vehicle_stats)) {
            // this turns the Object model into the list mod
            if (typeof stat.mod === 'object') {
                stat.mod = new PartsList(stat.mod).list;
            }
            const parts = new PartsList(stat.mod);

            parts.addUniquePart('SR5.Temporary', stat.temp ?? 0);

            stat.mod = parts.list;
            Helpers.calcTotal(stat);
            // add labels
            stat.label = CONFIG.SR5.vehicle.stats[key];
        }

        if (isOffRoad) {
            vehicle_stats.off_road_speed.hidden = false;
            vehicle_stats.off_road_handling.hidden = false;
            vehicle_stats.speed.hidden = true;
            vehicle_stats.handling.hidden = true;
        } else {
            vehicle_stats.off_road_speed.hidden = true;
            vehicle_stats.off_road_handling.hidden = true;
            vehicle_stats.speed.hidden = false;
            vehicle_stats.handling.hidden = false;
        }
    }

    static prepareVehicleAttributesAndLimits(data: VehicleActorData) {
        const { attributes, limits, vehicle_stats, isOffRoad } = data;

        const attributeIds = ['agility', 'reaction', 'strength', 'willpower', 'logic', 'intuition', 'charisma'];

        const totalPilot = Helpers.calcTotal(vehicle_stats.pilot);

        attributeIds.forEach((attId) => {
            if (attributes[attId] !== undefined) {
                attributes[attId].base = totalPilot;
            }
        });

        limits.mental.base = Helpers.calcTotal(vehicle_stats.sensor);

        // add sensor, handling, and speed as limits
        limits.sensor = { ...vehicle_stats.sensor, hidden: true };
        limits.handling = { ...(isOffRoad ? vehicle_stats.off_road_handling : vehicle_stats.handling), hidden: true };
        limits.speed = { ...(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed), hidden: true };
    }

    static prepareVehicleConditionMonitors(data: VehicleActorData) {
        const { track, attributes, matrix, isDrone } = data;

        const halfBody = Math.ceil(Helpers.calcTotal(attributes.body) / 2);
        // CRB pg 199 drone vs vehicle physical condition monitor rules
        if (isDrone) {
            track.physical.base = 6 + halfBody;
        } else {
            track.physical.base = 12 + halfBody;
        }

        const rating = matrix.rating || 0;
        matrix.condition_monitor.max = 8 + Math.ceil(rating / 2);
    }
}
