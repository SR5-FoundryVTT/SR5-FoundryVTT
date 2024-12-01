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
        if (actor.isVehicle()) ActorRollDataFlow.injectAstralRollData(actor, rollData, options);
        return rollData;
    },

    /**
     * Inject values for vehicle actors and their different rigging modes.
     * 
     * TODO: Hand over to a RiggingRules implementation.
     */
    injectVehicleRiggerRollData: function(actor: SR5Actor, rollData: any, options: RollDataOptions) {   
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
    }
}