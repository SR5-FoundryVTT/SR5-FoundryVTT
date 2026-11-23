import { CharacterPrep } from './CharacterPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { SR5 } from "../../config";
import { RangedWeaponRules } from '../../rules/RangedWeaponRules';
import { SR } from '../../constants';
import { SR5Item } from 'src/module/item/SR5Item';
import { MatrixRules } from '@/module/rules/MatrixRules';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { ItemPrep } from './functions/ItemPrep';
import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { RiggingRules } from '@/module/rules/RiggingRules';
import { DataDefaults } from '@/module/data/DataDefaults';
import type { SR5Actor } from '@/module/actor/SR5Actor';

export class VehiclePrep {
    static prepareBaseData(system: Actor.SystemOfType<'vehicle'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'vehicle'>, items: SR5Item[], actor?: SR5Actor) {
        VehiclePrep.prepareVehicleStats(system);
        VehiclePrep.prepareDeviceAttributes(system);
        VehiclePrep.prepareLimits(system);
        
        AttributesPrep.prepareAttributes(system);
        VehiclePrep.prepareAttributesWithPilot(system);
        VehiclePrep.prepareAttributesWithBody(system);
        VehiclePrep.prepareAttributeRanges(system);
        
        VehiclePrep.prepareAutosoftSkills(system, items, actor);
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimits(system);
        VehiclePrep.prepareConditionMonitor(system);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);
        MatrixPrep.prepareMatrixAttributesForDevice(system);

        VehiclePrep.prepareMovement(system);

        InitiativePrep.prepareInit('vehicle', system);

        ItemPrep.prepareArmor(system, items);
        CharacterPrep.prepareRecoil(system);
        VehiclePrep.prepareRecoilCompensation(system);

        ItemAvailabilityFlow.calculateValue(system.availability);
    }

    /**
     * Populate and enhance vehicle active skills with running autosoft ratings.
     * Follows SR5 CRB p. 267: if any local autosoft is running, all RCC shared autosofts are ignored.
     */
    static prepareAutosoftSkills(system: Actor.SystemOfType<'vehicle'>, items: SR5Item[], actor?: SR5Actor) {
        if (!actor) return;

        for (const [key, skill] of Object.entries(system.skills.active)) {
            ModifiableValue.remove(skill, 'SR5.Autosoft');
            if ((skill as any)._autosoftSynthetic) {
                delete system.skills.active[key];
            } else {
                ModifiableValue.calcTotal(skill);
            }
        }

        const effectiveAutosofts = RiggingRules.getAllEffectiveAutosofts(actor);
        if (effectiveAutosofts.length === 0) return;

        const allWeapons = (items?.length ? items : Array.from(actor.items ?? [])).filter(i => i.isType('weapon'));
        const equippedWeapons = allWeapons.filter(w => w.isEquipped());
        const candidateWeapons = equippedWeapons.length > 0 ? equippedWeapons : allWeapons;

        for (const autosoft of effectiveAutosofts) {
            const skillKey = RiggingRules.getSkillForAutosoft(autosoft, actor);
            if (!skillKey) continue;

            const autosoftType = autosoft.system.autosoftType || '';
            let rating = 0;

            if (autosoftType === 'targeting' && autosoft.system.targetWeapon) {
                for (const weapon of candidateWeapons) {
                    const effective = RiggingRules.getEffectiveAutosoft(actor, 'targeting', {
                        weapon: weapon.name || '',
                        weaponUuid: weapon.uuid || '',
                        skill: skillKey,
                    });
                    if (effective.rating > rating) {
                        rating = effective.rating;
                    }
                }
            } else {
                const effective = RiggingRules.getEffectiveAutosoft(actor, autosoftType, { skill: skillKey });
                rating = effective.rating;
            }

            if (rating <= 0) continue;

            const existingSkill = system.skills.active[skillKey];
            if (existingSkill) {
                const currentAutoRating = new ModifiableValue(existingSkill).get('SR5.Autosoft') ?? 0;
                ModifiableValue.addUnique(existingSkill, 'SR5.Autosoft', Math.max(currentAutoRating, rating), { type: 'upgrade' });
                ModifiableValue.calcTotal(existingSkill);
            } else {
                const skillName = SR5.activeSkills[skillKey] || skillKey;
                const skillField = DataDefaults.createData('skill_field', {
                    id: autosoft.id || skillKey,
                    key: skillKey,
                    name: skillName,
                    img: autosoft.img || 'icons/svg/item-bag.svg',
                    label: game.i18n.localize(skillName),
                    base: 0,
                    attribute: 'pilot',
                    canDefault: true,
                    specs: [],
                });
                (skillField as any)._autosoftSynthetic = true;
                ModifiableValue.addUnique(skillField, 'SR5.Autosoft', rating, { type: 'upgrade' });
                ModifiableValue.calcTotal(skillField);
                system.skills.active[skillKey] = skillField;
            }
        }
    }
    static prepareVehicleStats(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, isDrone } = system;

        for (const [key, stat] of Object.entries(vehicle_stats)) {
            ModifiableValue.calcTotal(stat);
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

        limits.mental.base = ModifiableValue.calcTotal(vehicle_stats.sensor);

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
        const { track, attributes, matrix, isDrone, modifiers, category } = system;

        const halfBody = Math.ceil(ModifiableValue.calcTotal(attributes.body) / 2);
        // CRB pg 199 drone vs vehicle physical condition monitor rules
        // Anthro vehicles have condition monitor as 8 + (body/2). R5 pg 145
        track.physical.base = (isDrone ? (category === 'anthro' ? 8 : 6) : 12) + halfBody;
        track.physical.max =  track.physical.base + modifiers['physical_track'];
        track.physical.label = SR5.damageTypes.physical;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        const rating = matrix.rating || 0;
        matrix.condition_monitor.max = MatrixRules.getVehicleMonitor(rating) + Number(modifiers.matrix_track);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getVehicleMonitor(rating);
        ModifiableValue.addUnique(track.matrix, "SR5.Bonus", modifiers.matrix_track);
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMovement(system: Actor.SystemOfType<'vehicle'>) {
        const { vehicle_stats, movement, isOffRoad } = system;

        const speedTotal = ModifiableValue.calcTotal(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed);

        // algorithm to determine speed, CRB pg 202 table.
        // Allow ActiveEffects to apply to movement directly.
        movement.walk.base = 5 * Math.pow(2, speedTotal - 1);
        movement.walk.value = ModifiableValue.calcTotal(movement.walk, {min: 0});

        movement.run.base = 10 * Math.pow(2, speedTotal - 1);
        movement.run.value = ModifiableValue.calcTotal(movement.run, {min: 0});
    }

    /**
     * Prepare the base actor recoil compensation without item influence.
     */
    static prepareRecoilCompensation(system: Actor.SystemOfType<'vehicle'>) {
        const {attributes} = system;

        const recoilCompensation = RangedWeaponRules.vehicleRecoilCompensationValue(attributes.body.value);
        ModifiableValue.addUnique(system.values.recoil_compensation, 'SR5.RecoilCompensation', recoilCompensation);
        ModifiableValue.calcTotal(system.values.recoil_compensation, {min: 0});
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
        ModifiableValue.calcTotal(system.attributes.strength, ranges.strength);
        ModifiableValue.calcTotal(system.attributes.agility, ranges.agility);
    }
}
