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
        return rollData;
    },

    /**
     * Inject values for vehicle actors and their different rigging modes.
     * 
     */
    injectVehicleDriverRollData: function(actor: SR5Actor, rollData: SR5Actor['system'], options: RollDataOptions = {}) {
        const driver = actor.getVehicleDriver()
        if (!driver) return;

        // if the driver is in control of the vehicle, inject the driver's attributes and skills
        if (actor.isControlledByDriver()) {
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
