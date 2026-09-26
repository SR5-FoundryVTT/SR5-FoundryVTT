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
        VehiclePrep.prepareJumpedInDriverData(system, actor);
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimits(system);
        VehiclePrep.prepareConditionMonitor(system);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);
        MatrixPrep.prepareMatrixAttributesForDevice(system);

        VehiclePrep.prepareMovement(system);

        InitiativePrep.prepareInit('vehicle', system);
        VehiclePrep.prepareVehicleInitiative(system, actor);

        ItemPrep.prepareArmor(system, items);
        CharacterPrep.prepareRecoil(system);
        VehiclePrep.prepareRecoilCompensation(system);
    }

    /**
     * Transfer driver's attributes, skills, and Control Rig bonuses to vehicle when jumped in.
     * When jumped out (autopilot), derived data modifiers and skills are automatically reset.
     */
    static prepareJumpedInDriverData(system: Actor.SystemOfType<'vehicle'>, actor?: SR5Actor) {
        if (!actor || system.controlMode !== 'rigger') return;

        const driver = actor.getVehicleDriver();
        if (!driver) return;

        // 1. Transfer Driver mental & physical attributes relevant to rigging
        const attributeKeysToTransfer = ['logic', 'intuition', 'reaction', 'agility', 'willpower'] as const;
        for (const attKey of attributeKeysToTransfer) {
            const att = driver.findAttribute(attKey);
            const rating = att?.value || 0;
            if (rating > 0) {
                const attribute = system.attributes[attKey];
                if (attribute) {
                    ModifiableValue.addUnique(attribute, 'SR5.Rigger.JumpedIn', rating, { type: 'upgrade' });
                    AttributesPrep.calculateAttribute(attKey, attribute);
                }
            }
        }

        // 2. Transfer Driver active skills
        const skillKeysToTransfer = new Set<string>(['gunnery', 'perception', 'sneaking', 'electronic_warfare']);
        const vehiclePilotSkill = actor.getVehicleTypeSkillName();
        if (vehiclePilotSkill) {
            skillKeysToTransfer.add(vehiclePilotSkill);
        }
        for (const pSkill of RiggingRules.PilotSkills) {
            skillKeysToTransfer.add(pSkill);
        }
        if (driver.system?.skills?.active) {
            for (const [skillKey, skill] of Object.entries(driver.system.skills.active)) {
                if (skill && ((skill.value ?? 0) > 0 || (skill.base ?? 0) > 0)) {
                    skillKeysToTransfer.add(skillKey);
                }
            }
        }

        for (const skillKey of skillKeysToTransfer) {
            const driverSkill = driver.findActiveSkill(skillKey);
            const rating = driverSkill?.value ?? driverSkill?.base ?? 0;
            if (rating <= 0) continue;

            const existingSkill = system.skills.active[skillKey];
            if (existingSkill) {
                ModifiableValue.addUnique(existingSkill, 'SR5.Rigger.JumpedIn', rating, { type: 'upgrade' });
                ModifiableValue.calcTotal(existingSkill);
                if (!existingSkill.specs?.length && driverSkill?.specs?.length) {
                    existingSkill.specs = [...driverSkill.specs];
                }
            } else {
                const skillName = SR5.activeSkills[skillKey] || skillKey;
                const skillField = DataDefaults.createData('skill_field', {
                    id: driverSkill?.id || skillKey,
                    key: skillKey,
                    name: skillName,
                    img: driverSkill?.img || 'icons/svg/item-bag.svg',
                    label: game.i18n.localize(skillName),
                    base: rating,
                    attribute: driverSkill?.attribute || 'agility',
                    canDefault: true,
                    specs: driverSkill?.specs ? [...driverSkill.specs] : [],
                });
                ModifiableValue.addUnique(skillField, 'SR5.Rigger.JumpedIn', rating, { type: 'upgrade' });
                ModifiableValue.calcTotal(skillField);
                system.skills.active[skillKey] = skillField;
            }
        }
    }

    /**
     * Dynamically adjust vehicle initiative based on its active control mode.
     * - Autopilot: uses onboard Pilot * 2 + 4d6 (default meatspace)
     * - Rigger: uses driver's Matrix VR initiative (hot-sim/cold-sim)
     * - Remote: uses driver's remote initiative (matrix VR if in VR, or meatspace/AR)
     * - Manual: uses driver's meatspace initiative
     */
    static prepareVehicleInitiative(system: Actor.SystemOfType<'vehicle'>, actor?: SR5Actor) {
        if (!actor) return;

        const driver = actor.getVehicleDriver();

        if (system.controlMode === 'rigger') {
            if (driver) {
                const driverInit = (driver.system.initiative as any)?.matrix || driver.system.initiative?.current;
                if (driverInit) {
                    const constVal = driverInit.constant?.value ?? 0;
                    const diceVal = driverInit.dice?.value ?? 0;

                    ModifiableValue.addUnique(system.initiative.current.constant, 'SR5.Rigger.JumpedIn', constVal, {
                        type: 'override',
                        priority: ModifiableValue.TOP_PRIORITY
                    });
                    ModifiableValue.addUnique(system.initiative.current.dice, 'SR5.Rigger.JumpedIn', diceVal, {
                        type: 'override',
                        priority: ModifiableValue.TOP_PRIORITY
                    });
                    ModifiableValue.calcTotal(system.initiative.current.constant);
                    ModifiableValue.calcTotal(system.initiative.current.dice, { min: 0, max: 5 });
                    (system.initiative.current.dice as any).text = `${system.initiative.current.dice.value}d6`;
                }
            }
        } else if (system.controlMode === 'remote') {
            if (driver) {
                const driverInit = driver.system.initiative?.current || (driver.system.initiative as any)?.matrix;
                if (driverInit) {
                    const constVal = driverInit.constant?.value ?? 0;
                    const diceVal = driverInit.dice?.value ?? 0;

                    ModifiableValue.addUnique(system.initiative.current.constant, 'SR5.ControlModes.Remote', constVal, {
                        type: 'override',
                        priority: ModifiableValue.TOP_PRIORITY
                    });
                    ModifiableValue.addUnique(system.initiative.current.dice, 'SR5.ControlModes.Remote', diceVal, {
                        type: 'override',
                        priority: ModifiableValue.TOP_PRIORITY
                    });
                    ModifiableValue.calcTotal(system.initiative.current.constant);
                    ModifiableValue.calcTotal(system.initiative.current.dice, { min: 0, max: 5 });
                    (system.initiative.current.dice as any).text = `${system.initiative.current.dice.value}d6`;
                }
            }
        } else if (system.controlMode === 'manual') {
            if (driver) {
                const driverInit = (driver.system.initiative as any)?.meatspace || driver.system.initiative?.current;
                if (driverInit) {
                    const constVal = driverInit.constant?.value ?? 0;
                    const diceVal = driverInit.dice?.value ?? 0;

                    ModifiableValue.addUnique(system.initiative.current.constant, 'SR5.Vehicle.ControlModes.Manual', constVal, {
                        type: 'override',
                        priority: ModifiableValue.TOP_PRIORITY
                    });
                    ModifiableValue.addUnique(system.initiative.current.dice, 'SR5.Vehicle.ControlModes.Manual', diceVal, {
                        type: 'override',
                        priority: ModifiableValue.TOP_PRIORITY
                    });
                    ModifiableValue.calcTotal(system.initiative.current.constant);
                    ModifiableValue.calcTotal(system.initiative.current.dice, { min: 0, max: 5 });
                    (system.initiative.current.dice as any).text = `${system.initiative.current.dice.value}d6`;
                }
            }
        }
    }

    /**
     * Populate and enhance vehicle active skills with running autosoft ratings.
     * Follows SR5 CRB p. 267: if any local autosoft is running, all RCC shared autosofts are ignored.
     */
    static prepareAutosoftSkills(system: Actor.SystemOfType<'vehicle'>, items: SR5Item[], actor?: SR5Actor) {
        if (!actor) return;

        if (!actor.itemsForType?.get('skill')?.length) {
            system.skills.active = {};
        }

        const effectiveAutosofts = RiggingRules.getAllEffectiveAutosofts(actor);
        if (effectiveAutosofts.length === 0) return;

        for (const autosoft of effectiveAutosofts) {
            const rating = autosoft.getRating();
            if (rating <= 0) continue;

            const skillKey = RiggingRules.getSkillForAutosoft(autosoft, actor);
            if (!skillKey) continue;

            const existingSkill = system.skills.active[skillKey];
            if (existingSkill) {
                existingSkill.base = Math.max(existingSkill.base || 0, rating);
                ModifiableValue.calcTotal(existingSkill);
            } else {
                const skillName = SR5.activeSkills[skillKey] || skillKey;
                const skillField = DataDefaults.createData('skill_field', {
                    id: autosoft.id || skillKey,
                    key: skillKey,
                    name: skillName,
                    img: autosoft.img || 'icons/svg/item-bag.svg',
                    label: game.i18n.localize(skillName),
                    base: rating,
                    attribute: 'pilot',
                    canDefault: true,
                    specs: [],
                });
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
        movement.walk.value = ModifiableValue.calcTotal(movement.walk as ModifiableValueType, {min: 0});

        movement.run.base = 10 * Math.pow(2, speedTotal - 1);
        movement.run.value = ModifiableValue.calcTotal(movement.run as ModifiableValueType, {min: 0});
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
