import { Helpers } from "@/module/helpers";
import {METATYPEMODIFIER, SR} from "../../../constants";
import {AttributesPrep} from "./AttributesPrep";

export class NPCPrep {
    static prepareNPCData(system: Actor.SystemOfType<'character'>) {
        // Apply to NPC and none NPC to remove lingering modifiers after actor has been removed it's npc status.
        NPCPrep.applyMetatypeModifiers(system);
    }

    /**
     * Apply modifiers that result from an NPCs metatype.
     * This method also should still run on any none NPC to remove eventually lingering NPC metatype modifiers.
     */
    static applyMetatypeModifiers(system: Actor.SystemOfType<'character'>) {
        if (!system.is_npc) return;

        // Extract needed data.
        const { attributes, metatype } = system;
        // Fallback to empty object if no metatype modifiers exist.
        const metatypeModifier = SR.grunt.metatype_modifiers[metatype as keyof typeof SR.grunt.metatype_modifiers] || {};

        for (const [name, attribute] of Object.entries(attributes)) {
            // Apply NPC modifiers
            const modifyBy = metatypeModifier.attributes?.[name] as number | undefined;
            if (modifyBy)
                Helpers.addChange(attribute, { name: METATYPEMODIFIER, value: modifyBy });

            AttributesPrep.calculateAttribute(name, attribute);
        }
    }
}
