import { CharacterPrep } from './CharacterPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';
import { SR5 } from "../../config";
import { RangedWeaponRules } from '../../rules/RangedWeaponRules';
import { SR } from '../../constants';
import { ModifiableValueType } from 'src/module/types/template/BaseModel';
import { SR5Item } from 'src/module/item/SR5Item';


export class VehiclePrep {
    static prepareBaseData(system: Actor.SystemOfType<'vehicle'>) {
        SkillsPrep.prepareSkillData(system);

        ModifiersPrep.prepareModifiers(system);
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearArmorMods(system);
        ModifiersPrep.clearLimitMods(system);
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
        // set the value for the stats
        for (let [key, stat] of Object.entries(vehicle_stats)) {
            // this turns the Object model into the list mod
            if (typeof stat.mod === 'object') {
                stat.mod = new PartsList(stat.mod).list;
            }
            const parts = new PartsList(stat.mod);

            if (stat.temp) parts.addUniquePart('SR5.Temporary', stat.temp);

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
            PartsList.AddUniquePart(attribute.mod, vehicle_stats.pilot.label, vehicle_stats.pilot.value);
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
            PartsList.AddUniquePart(attribute.mod, attributes.body.label, attributes.body.value);
            AttributesPrep.calculateAttribute(attId, attribute);
        });
    }

    static prepareLimits(system: Actor.SystemOfType<'vehicle'>) {
        const { limits, vehicle_stats, isOffRoad } = system;

        limits.mental.base = Helpers.calcTotal(vehicle_stats.sensor);

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
        matrix.condition_monitor.max = 8 + Math.ceil(rating / 2) + Number(modifiers.matrix_track);
    }

    static prepareMovement(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, movement, isOffRoad } = system;

        let speedTotal = Helpers.calcTotal(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed);

        // algorithm to determine speed, CRB pg 202 table.
        // Allow ActiveEffects to apply to movement directly.
        movement.walk.base = 5 * Math.pow(2, speedTotal - 1);
        movement.walk.value = Helpers.calcTotal(movement.walk as ModifiableValueType, {min: 0});

        movement.run.base = 10 * Math.pow(2, speedTotal - 1);
        movement.run.value = Helpers.calcTotal(movement.run as ModifiableValueType, {min: 0});
    }

    static prepareMeatspaceInit(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, initiative, modifiers } = system;

        const pilot = Helpers.calcTotal(vehicle_stats.pilot);

        initiative.meatspace.base.base = pilot * 2;
        initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));
        initiative.meatspace.dice.base = 4;
        initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));

        Helpers.calcTotal(initiative.meatspace.base);
        Helpers.calcTotal(initiative.meatspace.dice);
    }

    static prepareArmor(system: Actor.SystemOfType<'vehicle'>) {
        const { armor, modifiers } = system;

        armor.mod = PartsList.AddUniquePart(armor.mod, 'SR5.Temporary', Number(armor['temp'] || 0));
        armor.mod = PartsList.AddUniquePart(armor.mod, 'SR5.Bonus', Number(modifiers['armor'] || 0));

        Helpers.calcTotal(armor);
    }
    /**
     * Prepare the base actor recoil compensation without item influence.
     */
    static prepareRecoilCompensation(system: Actor.SystemOfType<'vehicle'>) {
        const {attributes} = system;

        const recoilCompensation = RangedWeaponRules.vehicleRecoilCompensationValue(attributes.body.value);
        PartsList.AddUniquePart(system.values.recoil_compensation.mod, 'SR5.RecoilCompensation', recoilCompensation);

        Helpers.calcTotal(system.values.recoil_compensation, {min: 0});
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
        Helpers.calcTotal(system.attributes.strength, ranges.strength);
        Helpers.calcTotal(system.attributes.agility, ranges.agility);
    }
}
