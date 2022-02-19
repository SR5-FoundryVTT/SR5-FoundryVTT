import VehicleActorData = Shadowrun.VehicleData;
import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';
import {SR5} from "../../config";
import VehicleData = Shadowrun.VehicleData;
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";


export class VehiclePrep {
    static prepareBaseData(data: VehicleData) {
        ModifiersPrep.prepareModifiers(data);
        ModifiersPrep.clearAttributeMods(data);
        ModifiersPrep.clearArmorMods(data);
        ModifiersPrep.clearLimitMods(data);
    }

    static prepareDerivedData(data: VehicleData, items: SR5ItemDataWrapper[]) {
        VehiclePrep.prepareVehicleStats(data);
        VehiclePrep.prepareAttributes(data);
        VehiclePrep.prepareLimits(data);

        AttributesPrep.prepareAttributes(data);
        SkillsPrep.prepareSkills(data);

        LimitsPrep.prepareLimits(data);
        VehiclePrep.prepareConditionMonitor(data);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(data);
        MatrixPrep.prepareAttributesForDevice(data);

        VehiclePrep.prepareMovement(data);

        VehiclePrep.prepareMeatspaceInit(data);
        InitiativePrep.prepareMatrixInit(data);
        InitiativePrep.prepareCurrentInitiative(data);

        VehiclePrep.prepareArmor(data);
    }

    static prepareVehicleStats(data: VehicleData) {
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
            stat.label = SR5.vehicle.stats[key];
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
            track.physical.base = 6 + halfBody;
            track.physical.max = track.physical.base + (Number(modifiers['physical_track']) || 0);
        } else {
            track.physical.base = 12 + halfBody;
            track.physical.max =  track.physical.base + (Number(modifiers['physical_track']) || 0);
        }
        track.physical.label = SR5.damageTypes.physical;

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
        const { vehicle_stats, initiative, modifiers } = data;

        const pilot = Helpers.calcTotal(vehicle_stats.pilot);

        initiative.meatspace.base.base = pilot * 2;
        initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));
        initiative.meatspace.dice.base = 4;
        initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));

        Helpers.calcTotal(initiative.meatspace.base);
        Helpers.calcTotal(initiative.meatspace.dice);
    }

    static prepareArmor(data: VehicleActorData) {
        const { armor, modifiers } = data;

        armor.mod = PartsList.AddUniquePart(armor.mod, 'SR5.Temporary', Number(armor['temp']));
        armor.mod = PartsList.AddUniquePart(armor.mod, 'SR5.Bonus', Number(modifiers['armor']));

        Helpers.calcTotal(armor);
    }
}
