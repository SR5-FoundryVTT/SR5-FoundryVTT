import { CharacterPrep } from './CharacterPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { Helpers } from '../../helpers';
import { SR5 } from "../../config";
import { RangedWeaponRules } from '../../rules/RangedWeaponRules';
import { SR } from '../../constants';
import { ModifiableValueType } from 'src/module/types/template/Base';
import { SR5Item } from 'src/module/item/SR5Item';
import { MatrixRules } from '@/module/rules/MatrixRules';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';
import { PartsList } from '@/module/parts/PartsList';

export class VehiclePrep {
    static prepareBaseData(system: Actor.SystemOfType<'vehicle'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'vehicle'>, items: SR5Item[]) {
        VehiclePrep.prepareVehicleStats(system);
        VehiclePrep.prepareDeviceAttributes(system);
        VehiclePrep.prepareLimits(system);
        
        AttributesPrep.prepareAttributes(system);
        VehiclePrep.prepareAttributesWithPilot(system);
        VehiclePrep.prepareAttributesWithBody(system);
        VehiclePrep.prepareAttributeRanges(system);
        
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimits(system);
        VehiclePrep.prepareConditionMonitor(system);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);
        MatrixPrep.prepareMatrixAttributesForDevice(system);

        VehiclePrep.prepareMovement(system);

        VehiclePrep.prepareMeatspaceInit(system);
        InitiativePrep.prepareMatrixInit(system);
        InitiativePrep.prepareCurrentInitiative(system);

        VehiclePrep.prepareArmor(system);
        CharacterPrep.prepareRecoil(system);
        VehiclePrep.prepareRecoilCompensation(system);
    }

    static prepareVehicleStats(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, isOffRoad, isDrone } = system;

        for (const [key, stat] of Object.entries(vehicle_stats)) {
            PartsList.calcTotal(stat);
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

        // Hide vehicle seats for drones
        vehicle_stats.seats.hidden = isDrone;
    }

    /**
     * Apply SR5#199 'Pilot' and SR5#269 'Pilot Program' rules.
     * 
     * Rulings here are a bit vague and current system implementation makes it more vague.
     * 
     */
    static prepareAttributesWithPilot(system: Actor.SystemOfType<'vehicle'>) {
        const { attributes, vehicle_stats } = system;


        const attributeIds = [
            // SR5#199 - 'Pilot' => All  mental attributes and reaction.
            'reaction', 'willpower', 'logic', 'intuition', 'charisma',
            // No actual rule, a typical skill check would be 'Autosoft Rating + Pilot'
            // Setting agility to pilot, helps the current unpolished way vehicles use character skills.
            'agility',
            // The actual pilot attribute will also equal the vehicle stat pilot
            'pilot'
        ];

        attributeIds.forEach((attId) => {
            const attribute = attributes[attId];
            if (!attribute) return;

            // Allow value to be understandable when displayed.
            attribute.base = 0;
            PartsList.addUniquePart(attribute, vehicle_stats.pilot.label, vehicle_stats.pilot.value);
            AttributesPrep.calculateAttribute(attId, attribute);
        });
    }

    static prepareAttributesWithBody(system: Actor.SystemOfType<'vehicle'>) {
        const { attributes } = system;

        // R5.0#125 'Drone Arm' - while not ALL vehicles have arms, leave it up to the user to NOT cast if they shouldn't.
        const attributeIds = ['strength']

        attributeIds.forEach((attId) => {
            const attribute = attributes[attId];
            if (!attribute) return;

            // Allow value to be understandable when displayed.
            attribute.base = 0;
            PartsList.addUniquePart(attribute, attributes.body.label, attributes.body.value);
            AttributesPrep.calculateAttribute(attId, attribute);
        });
    }

    static prepareLimits(system: Actor.SystemOfType<'vehicle'>) {
        const { limits, vehicle_stats, isOffRoad } = system;

        limits.mental.base = PartsList.calcTotal(vehicle_stats.sensor);

        // add sensor, handling, and speed as limits
        limits.sensor = { ...vehicle_stats.sensor, hidden: true, attribute: 'sensor' };
        limits.handling = { ...(isOffRoad ? vehicle_stats.off_road_handling : vehicle_stats.handling), hidden: true, attribute: 'handling' };
        limits.speed = { ...(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed), hidden: true, attribute: 'speed' };
    }

    /**
     * Apply SR5#269 'Drones in the matrix' rules.
     */
    static prepareDeviceAttributes(system: Actor.SystemOfType<'vehicle'>) {
        const {matrix, vehicle_stats} = system;

        matrix.rating = vehicle_stats.pilot.value;
    }

    static prepareConditionMonitor(system: Actor.SystemOfType<'vehicle'>) {
        const { track, attributes, matrix, isDrone, modifiers } = system;

        const halfBody = Math.ceil(PartsList.calcTotal(attributes.body) / 2);
        // CRB pg 199 drone vs vehicle physical condition monitor rules
        if (isDrone) {
            track.physical.base = 6 + halfBody;
            track.physical.max = track.physical.base + (Number(modifiers['physical_track']) || 0);
        } else {
            track.physical.base = 12 + halfBody;
            track.physical.max =  track.physical.base + (Number(modifiers['physical_track']) || 0);
        }
        track.physical.label = SR5.damageTypes.physical;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        const rating = matrix.rating || 0;
        matrix.condition_monitor.max = MatrixRules.getVehicleMonitor(rating) + Number(modifiers.matrix_track);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getVehicleMonitor(rating);
        PartsList.addUniquePart(track.matrix, "SR5.Bonus", modifiers.matrix_track);
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMovement(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, movement, isOffRoad } = system;

        const speedTotal = PartsList.calcTotal(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed);

        // algorithm to determine speed, CRB pg 202 table.
        // Allow ActiveEffects to apply to movement directly.
        movement.walk.base = 5 * Math.pow(2, speedTotal - 1);
        movement.walk.value = PartsList.calcTotal(movement.walk as ModifiableValueType, {min: 0});

        movement.run.base = 10 * Math.pow(2, speedTotal - 1);
        movement.run.value = PartsList.calcTotal(movement.run as ModifiableValueType, {min: 0});
    }

    static prepareMeatspaceInit(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, initiative, modifiers } = system;

        const pilot = PartsList.calcTotal(vehicle_stats.pilot);

        initiative.meatspace.base.base = pilot * 2;
        PartsList.addUniquePart(initiative.meatspace.base, "SR5.Bonus", modifiers.meat_initiative);
        initiative.meatspace.dice.base = 4;
        PartsList.addUniquePart(initiative.meatspace.dice, "SR5.Bonus", modifiers.meat_initiative_dice);

        PartsList.calcTotal(initiative.meatspace.base);
        PartsList.calcTotal(initiative.meatspace.dice);
    }

    static prepareArmor(system: Actor.SystemOfType<'vehicle'>) {
        const { armor, modifiers } = system;

        PartsList.addUniquePart(armor, 'SR5.Bonus', modifiers.armor);

        PartsList.calcTotal(armor);
    }
    /**
     * Prepare the base actor recoil compensation without item influence.
     */
    static prepareRecoilCompensation(system: Actor.SystemOfType<'vehicle'>) {
        const {attributes} = system;

        const recoilCompensation = RangedWeaponRules.vehicleRecoilCompensationValue(attributes.body.value);
        PartsList.addUniquePart(system.values.recoil_compensation, 'SR5.RecoilCompensation', recoilCompensation);
        PartsList.calcTotal(system.values.recoil_compensation, {min: 0});
    }

    /**
     * Some attributes don't exist on vehicle actors.
     * 
     * Instead of default character range, use vehicle specific ranges.
     * 
     * NOTE: This is a hack around the actor type character centric preparation design still present in the system.
     *       Times is short, perfect solutions are costly.
     */
    static prepareAttributeRanges(system: Actor.SystemOfType<'vehicle'>) {
        const ranges = SR.actorTypeAttributes['vehicle'];
        PartsList.calcTotal(system.attributes.strength, ranges.strength);
        PartsList.calcTotal(system.attributes.agility, ranges.agility);
    }
}
