import { RollDataOptions } from "../../item/Types";
import { SR5Actor } from "../SR5Actor";

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
        if (actor.isVehicle()) ActorRollDataFlow.injectVehicleRiggerRollData(actor, rollData, options);
        return rollData;
    },

    /**
     * Inject values for vehicle actors and their different rigging modes.
     * 
     * TODO: Hand over to a RiggingRules implementation.
     */
    injectVehicleRiggerRollData: function(actor: SR5Actor, rollData: any, options: RollDataOptions) {
        const driver = actor.getVehicleDriver()
        const vehicleSystem = actor.system as Shadowrun.VehicleData;
        const vehicleAttributes = actor.system.attributes as Shadowrun.AttributesData;
        const driverSkills = driver?.system.skills as Shadowrun.CharacterSkills;
        const driverAttributes = driver?.system.attributes as Shadowrun.AttributesData;
        
        if (vehicleSystem.controlMode == "rigger") {
            const injectAttributes = ['intuition', 'agility'];
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
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    _injectAttributes(names: string[], attributes: Shadowrun.AttributesData, rollData: Shadowrun.ShadowrunItemDataData, options: { bigger: boolean }) {
        const targetAttributes = rollData.attributes as Shadowrun.AttributesData;
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
     * @param attributes The list of source attribute to pull from
     * @param rollData The testData to inject attributes into
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    _injectSkills(names: string[], skills: Shadowrun.CharacterSkills, rollData: Shadowrun.ShadowrunActorDataData, options: { bigger: boolean }) {
        const targetAttributes = rollData.skills.active as Shadowrun.AttributesData;
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