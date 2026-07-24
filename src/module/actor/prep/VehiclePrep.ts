import { CharacterPrep } from './CharacterPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { SR5 } from "../../config";
import { RangedWeaponRules } from '../../rules/RangedWeaponRules';
import { SR } from '../../constants';
import { ModifiableValueType } from 'src/module/types/template/Base';
import { SR5Item } from 'src/module/item/SR5Item';
import { MatrixRules } from '@/module/rules/MatrixRules';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { ItemPrep } from './functions/ItemPrep';

export class VehiclePrep {
    static prepareBaseData(system: Actor.SystemOfType<'vehicle'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'vehicle'>, items: SR5Item[]) {
        VehiclePrep.prepareVehicleStats(system);
        system.parent?.applyActiveEffects('vehicle');

        VehiclePrep.prepareDeviceAttributes(system);
        VehiclePrep.prepareLimits(system);
        
        AttributesPrep.prepareAttributes(system);
        VehiclePrep.prepareAttributesWithPilot(system);
        VehiclePrep.prepareAttributesWithBody(system);
        VehiclePrep.prepareAttributeRanges(system);
        system.parent?.applyActiveEffects('attributes');
        AttributesPrep.clampAttributesToRange(system, SR.actorTypeAttributes['vehicle']);
        
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimits(system);
        VehiclePrep.prepareConditionMonitor(system);

        MatrixPrep.prepareMatrixAttributesForDevice(system);
        system.parent?.applyActiveEffects('matrix');
        MatrixPrep.prepareMatrixToLimitsAndAttributes(system, true);

        VehiclePrep.prepareMovement(system);

        InitiativePrep.prepareInit('vehicle', system);

        ItemPrep.prepareArmor(system, items);
        CharacterPrep.prepareRecoil(system);
        VehiclePrep.prepareRecoilCompensation(system);
        system.parent?.applyActiveEffects('derived');
    }

    static prepareVehicleStats(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, isDrone } = system;

        for (const [key, stat] of Object.entries(vehicle_stats)) {
            ModifiableValue.applyChanges(stat);
            stat.label = SR5.vehicle.stats[key];
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
            ModifiableValue.addUnique(attribute, vehicle_stats.pilot.label, vehicle_stats.pilot.value);
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
            ModifiableValue.addUnique(attribute, attributes.body.label, attributes.body.value);
            AttributesPrep.calculateAttribute(attId, attribute);
        });
    }

    static prepareLimits(system: Actor.SystemOfType<'vehicle'>) {
        const { limits, vehicle_stats, isOffRoad } = system;

        // Sensor is the anchor, logged as a BASE_PRIORITY entry so it survives `base` removal.
        limits.mental.base = 0;
        ModifiableValue.addUniqueBase(limits.mental, 'SR5.BaseValue', vehicle_stats.sensor.value);

        // add sensor, handling, and speed as limits.
        // The stat's own anchor is still its `base`, so carry it over as a BASE_PRIORITY entry and zero the
        // copy's base. `changes` must be cloned: a plain spread shares the array with the vehicle stat, so
        // adding the anchor would mutate the stat itself.
        const asLimit = <F extends ModifiableValueType, A extends string>(stat: F, attribute: A) => {
            const limit = { ...stat, changes: [...stat.changes], base: 0, hidden: true, attribute };
            ModifiableValue.addUniqueBase(limit, 'SR5.BaseValue', stat.base);
            return limit;
        };

        limits.sensor = asLimit(vehicle_stats.sensor, 'sensor');
        limits.handling = asLimit(isOffRoad ? vehicle_stats.off_road_handling : vehicle_stats.handling, 'handling');
        limits.speed = asLimit(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed, 'speed');
    }

    /**
     * Apply SR5#269 'Drones in the matrix' rules.
     */
    static prepareDeviceAttributes(system: Actor.SystemOfType<'vehicle'>) {
        const {matrix, vehicle_stats} = system;

        matrix.rating = vehicle_stats.pilot.value;
    }

    static prepareConditionMonitor(system: Actor.SystemOfType<'vehicle'>) {
        const { track, attributes, matrix, isDrone, modifiers, category } = system;

        const halfBody = Math.ceil(attributes.body.value / 2);
        // CRB pg 199 drone vs vehicle physical condition monitor rules
        // Anthro vehicles have condition monitor as 8 + (body/2). R5 pg 145
        // Capacity is an intermediate for `max`, not a fold anchor, so it stays a local.
        const capacity = (isDrone ? (category === 'anthro' ? 8 : 6) : 12) + halfBody;
        track.physical.max = capacity + modifiers['physical_track'];
        track.physical.label = SR5.damageTypes.physical;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        const rating = matrix.rating || 0;
        matrix.condition_monitor.max = MatrixRules.getVehicleMonitor(rating) + Number(modifiers.matrix_track);

        // Prepare user visible matrix track values. `max` comes from the condition monitor above; the track's
        // own `base` was write-only (nothing reads it), so it is no longer set.
        ModifiableValue.addUnique(track.matrix, "SR5.Bonus", modifiers.matrix_track);
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMovement(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, movement, isOffRoad } = system;

        const speedTotal = (isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed).value;

        // algorithm to determine speed, CRB pg 202 table.
        // Allow ActiveEffects to apply to movement directly. The derived anchor is a BASE_PRIORITY entry
        // folded from 0, so it survives `base` leaving the schema.
        const resolve = (field: ModifiableValueType, base: number) => {
            const mod = new ModifiableValue(field);
            mod.addUniqueBase('SR5.BaseValue', base);
            return mod.applyChanges({ from: 0, min: 0 });
        };

        movement.walk.value = resolve(movement.walk as ModifiableValueType, 5 * Math.pow(2, speedTotal - 1));
        movement.run.value = resolve(movement.run as ModifiableValueType, 10 * Math.pow(2, speedTotal - 1));
    }

    /**
     * Prepare the base actor recoil compensation without item influence.
     */
    static prepareRecoilCompensation(system: Actor.SystemOfType<'vehicle'>) {
        const {attributes} = system;

        const recoilCompensation = RangedWeaponRules.vehicleRecoilCompensationValue(attributes.body.value);
        ModifiableValue.addUnique(system.values.recoil_compensation, 'SR5.RecoilCompensation', recoilCompensation);
        ModifiableValue.applyChanges(system.values.recoil_compensation, {min: 0});
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
        ModifiableValue.applyChanges(system.attributes.strength, ranges.strength);
        ModifiableValue.applyChanges(system.attributes.agility, ranges.agility);
    }
}
