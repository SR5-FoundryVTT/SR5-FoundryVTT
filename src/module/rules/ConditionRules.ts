import { SR5Actor } from "../actor/SR5Actor";

export interface DefeatedStatus {
    unconscious: boolean,
    dying: boolean,
    dead: boolean,

}
export const ConditionRules = {
    /**
     * Determine the current defeated status of an actor
     * 
     * @param actor The actor to check out
     */
    determineDefeatedStatus: (actor: SR5Actor): DefeatedStatus => {
        const stun = actor.getStunTrack();
        const physical = actor.getPhysicalTrack();
        const matrix = actor.getMatrixTrack();

        let unconscious = false;
        let dying = false;
        let dead = false;

        // Some actor types die differently.
        if (actor.isIC() || actor.isSprite()) {
            dead = matrix?.value === matrix?.max;
        } else if (actor.isVehicle() || actor.isGrunt()) {
            dead = physical?.value === physical?.max;
        } else {
            unconscious = stun?.value === stun?.max;
            dying = physical?.value === physical?.max;
            dead = dying && physical?.overflow.value === physical?.overflow.max;
        }

        return {
            unconscious, dying, dead
        }
    }

}