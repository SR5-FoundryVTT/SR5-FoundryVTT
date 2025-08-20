import { RollDataOptions } from "../../item/Types";
import { SR5Actor } from "../SR5Actor";
import { AttributesType } from '@/module/types/template/Attributes';

/**
 * Handling around actor roll data resolution.
 * 
 * Functionality here 
 */
export const ActorRollDataFlow = {
    /**
     * Use the given roll data to inject values for a roll of the given actor.
     * 
     * This can result in roll data with mixed values from different actors / items.
     * 
     * @param actor
     * @param rollData
     * @param options
     */
    getRollData: function(actor: SR5Actor, rollData: any, options: RollDataOptions) {
        if (actor.isType('vehicle')) ActorRollDataFlow.injectVehicleDriverRollData(actor, rollData, options);
        if (actor.isUsingVR) ActorRollDataFlow.injectMentalAttributesAsPhysical(actor, rollData, options);
        return rollData;
    },

    /**
     * Inject the Mental attributes values and labels into their physical attribute counterparts,
     * these are defined on page 314 of SR5 -- it is the Astral Attributes Table but I believe that is the same as Matrix
     * @param actor
     * @param rollData
     * @param options
     */
    injectMentalAttributesAsPhysical: (actor: SR5Actor, rollData: SR5Actor['system'], options: RollDataOptions = {}) => {
        const attributes = rollData.attributes;
        const attributeMapper = {
            'agility': 'logic',
            'body': 'willpower',
            'reaction': 'intuition',
            'strength': 'charisma',
        }

        for (const [key, value] of Object.entries(attributeMapper)) {
            const a1 = attributes[key];
            const a2 = attributes[value];

            a1.value = a2.value;
            a1.label = a2.label;
        }
    },

    /**
     * Inject values for vehicle actors and their different rigging modes.
     * 
     * TODO: Hand over to a RiggingRules implementation.
     */
    injectVehicleDriverRollData: function(actor: SR5Actor, rollData: SR5Actor['system'], options: RollDataOptions = {}) {
        const driver = actor.getVehicleDriver()
        if (!driver) return;
        const vehicleSystem = actor.system;
        if (!vehicleSystem.controlMode) return;

        const driverRollData = driver.getRollData();

        const driverSkills = driverRollData.skills;
        if (!driverSkills) return;

        const driverAttributes = driverRollData.attributes;
        if (!driverAttributes) return;

        // if the driver is in control of the vehicle, inject the driver's attributes and skills
        if (['rigger', 'remote', 'manual'].includes(vehicleSystem.controlMode)) {

            const injectAttributes = ['intuition', 'reaction', 'logic', 'agility'];
            ActorRollDataFlow._injectAttributes(injectAttributes, driverAttributes, rollData, { bigger: false });

            const injectSkills = ['perception', 'sneaking', 'gunnery', 'pilot_aerospace', 'pilot_aircraft',
                'pilot_exotic_vehicle', 'pilot_ground_craft', 'pilot_walker', 'pilot_water_craft'
            ]
            ActorRollDataFlow._injectSkills(injectSkills, driverSkills, rollData, { bigger: false });  
        }
    },

    /**
     * Inject values for an actor on the astral plane.
     * 
     * TODO: Hand over to a MagicRules implementation.
     * 
     * @param actor 
     * @param rollData 
     * @param options 
     */
    injectAstralRollData: function(actor: SR5Actor, rollData: any, options: RollDataOptions) {
    },

    /**
     * Inject all attributes into testData that match the given attribute names list.
     *
     * Also implements the 'use bigger value rule',if necessary.
     *
     * @param names A list of attribute names to inject
     * @param attributes The list of source attribute to pull from
     * @param rollData The testData to inject attributes into
     * @param options
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    _injectAttributes(names: string[], attributes: AttributesType, rollData: SR5Actor['system'], options: { bigger: boolean }) {
        const targetAttributes = rollData.attributes;
        for (const name of names) {
            const sourceAttribute = foundry.utils.duplicate(attributes[name]);
            const targetAttribute = targetAttributes[name];

            if (options.bigger) {
                targetAttributes[name] = sourceAttribute.value > targetAttribute.value ? sourceAttribute : targetAttribute;
            } else {
                targetAttributes[name] = sourceAttribute;
            }
        }
    },

    /**
     * Inject all attributes into testData that match the given attribute names list.
     *
     * Also implements the 'use bigger value rule',if necessary.
     *
     * @param names A list of attribute names to inject
     * @param skills
     * @param rollData The testData to inject attributes into
     * @param options
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    _injectSkills(names: string[], skills: SR5Actor['system']['skills'], rollData: SR5Actor['system'], options: { bigger: boolean }) {
        const targetAttributes = rollData.skills.active;
        for (const name of names) {
            const sourceAttribute = foundry.utils.duplicate(skills.active[name]);
            const targetAttribute = targetAttributes[name];

            if (options.bigger) {
                targetAttributes[name] = sourceAttribute.value > targetAttribute.value ? sourceAttribute : targetAttribute;
            } else {
                targetAttributes[name] = sourceAttribute;
            }
        }
    },
}
