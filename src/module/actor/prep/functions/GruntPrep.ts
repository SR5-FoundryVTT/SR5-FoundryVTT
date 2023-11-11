import { ConditionMonitorsPrep } from "./ConditionMonitorsPrep";

/**
 * Prepare actor types with grunt support with rules around grunt actors.
 */
export const GruntPrep = {
    /**
     * If an NPC Grunt is selected, prepare the grunt condition monitor according to SR5#378 'Grunts'.
     * @param system To be altered system data.
     */
    prepareConditionMonitors: (system: Shadowrun.GruntActorData) => {
        if (system.is_npc && system.npc.is_grunt) {
            ConditionMonitorsPrep.prepareGrunt(system);
        } else {
            ConditionMonitorsPrep.preparePhysical(system);
            ConditionMonitorsPrep.prepareStun(system);
        }
    }
}