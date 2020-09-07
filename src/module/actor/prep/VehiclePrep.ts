import { BaseActorPrep } from './BaseActorPrep';
import SR5VehicleType = Shadowrun.SR5VehicleType;
import VehicleActorData = Shadowrun.VehicleActorData;
import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';

export class VehiclePrep extends BaseActorPrep<SR5VehicleType, VehicleActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);

        VehiclePrep.prepareVehicleStats(this.data);
        VehiclePrep.prepareAttributes(this.data);
        VehiclePrep.prepareLimits(this.data);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        VehiclePrep.prepareConditionMonitor(this.data);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);
        MatrixPrep.prepareAttributesForDevice(this.data);

        VehiclePrep.prepareMovement(this.data);

        VehiclePrep.prepareMeatspaceInit(this.data);
        InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);

        console.log(this.data);
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

        // hide certain stats depending on if we're offroad
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

    static prepareAttributes(data: VehicleActorData) {
        const { attributes, vehicle_stats } = data;

        const attributeIds = ['agility', 'reaction', 'strength', 'willpower', 'logic', 'intuition', 'charisma'];

        const totalPilot = Helpers.calcTotal(vehicle_stats.pilot);

        attributeIds.forEach((attId) => {
            if (attributes[attId] !== undefined) {
                attributes[attId].base = totalPilot;
            }
        });
    }

    static prepareLimits(data: VehicleActorData) {
        const { limits, vehicle_stats, isOffRoad } = data;

        limits.mental.base = Helpers.calcTotal(vehicle_stats.sensor);

        // add sensor, handling, and speed as limits
        limits.sensor = { ...vehicle_stats.sensor, hidden: true };
        limits.handling = { ...(isOffRoad ? vehicle_stats.off_road_handling : vehicle_stats.handling), hidden: true };
        limits.speed = { ...(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed), hidden: true };
    }

    static prepareConditionMonitor(data: VehicleActorData) {
        const { track, attributes, matrix, isDrone, modifiers } = data;

        const halfBody = Math.ceil(Helpers.calcTotal(attributes.body) / 2);
        // CRB pg 199 drone vs vehicle physical condition monitor rules
        if (isDrone) {
            track.physical.max = 6 + halfBody + (Number(modifiers['physical_track']) || 0);
        } else {
            track.physical.max = 12 + halfBody + (Number(modifiers['physical_track']) || 0);
        }
        track.physical.label = CONFIG.SR5.damageTypes.physical;

        const rating = matrix.rating || 0;
        matrix.condition_monitor.max = 8 + Math.ceil(rating / 2);
    }

    static prepareMovement(data: VehicleActorData) {
        const { vehicle_stats, movement, isOffRoad } = data;

        let speedTotal = Helpers.calcTotal(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed);

        // algorithm to determine speed, CRB pg 202 table
        movement.walk.base = 5 * Math.pow(2, speedTotal - 1);
        movement.walk.value = movement.walk.base;

        movement.run.base = 10 * Math.pow(2, speedTotal - 1);
        movement.run.value = movement.run.base;
    }

    static prepareMeatspaceInit(data: VehicleActorData) {
        const { vehicle_stats, initiative } = data;

        const pilot = Helpers.calcTotal(vehicle_stats.pilot);

        initiative.meatspace.base.base = pilot * 2;
        initiative.meatspace.dice.base = 4;
        Helpers.calcTotal(initiative.meatspace.base);
        Helpers.calcTotal(initiative.meatspace.dice);
    }
}
