import { RollDataOptions } from "../../item/Types";
import { SR5Actor } from "../SR5Actor";
import { RiggingRules } from '@/module/rules/RiggingRules';
import { AttributeRules } from '@/module/rules/AttributeRules';

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
        AttributeRules.injectMentalAttributesToPhysicalAttributes(rollData);
    },

    /**
     * Inject values for vehicle actors and their different rigging modes.
     * 
     */
    injectVehicleDriverRollData: function(actor: SR5Actor, rollData: SR5Actor['system'], options: RollDataOptions = {}) {
        const driver = actor.getVehicleDriver()
        if (!driver) return;
        const vehicleSystem = actor.system;
        if (!vehicleSystem.controlMode) return;

        // if the driver is in control of the vehicle, inject the driver's attributes and skills
        if (['rigger', 'remote', 'manual'].includes(vehicleSystem.controlMode)) {
            RiggingRules.modifyRollDataForDriver(driver.getRollData(), rollData);
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
}
