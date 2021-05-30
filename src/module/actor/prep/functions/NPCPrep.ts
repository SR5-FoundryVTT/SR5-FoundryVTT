import CharacterActorData = Shadowrun.CharacterActorData;
import {DataTemplates} from "../../../dataTemplates";
import {METATYPEMODIFIER} from "../../../constants";
import {PartsList} from "../../../parts/PartsList";
import {AttributesPrep} from "./AttributesPrep";

export class NPCPrep {
    static prepareNPCData(data: CharacterActorData) {
        // Apply to NPC and none NPC to remove lingering modifiers after actor has been removed it's npc status.
        NPCPrep.applyMetatypeModifiers(data);
    }

    /**
     * Apply modifiers that result from an NPCs metatype.
     * This method also should still run on any none NPC to remove eventually lingering NPC metatype modifiers.
     */
    static applyMetatypeModifiers(data: CharacterActorData) {
        // Extract needed data.
        const {attributes, metatype} = data;
        const metatypeModifier = DataTemplates.grunt.metatype_modifiers[metatype] || {};

        for (const [name, attribute] of Object.entries(attributes)) {
            // old-style object mod transformation is happening in AttributePrep and is needed here. Order is important.
            if (!Array.isArray(attribute.mod)) {
                    console.error('Actor data contains wrong data type for attribute.mod', attribute, !Array.isArray(attribute.mod));
            } else {

                // Remove lingering modifiers from NPC actors that aren't anymore.
                const parts = new PartsList(attribute.mod);
                parts.removePart(METATYPEMODIFIER);

                // Apply NPC modifiers
                const modifyBy = metatypeModifier.attributes?.[name];
                if (data.is_npc && modifyBy) {
                    parts.addPart(METATYPEMODIFIER, modifyBy);
                }

                // Prepare attribute modifiers
                attribute.mod = parts.list;

                AttributesPrep.calculateAttribute(name, attribute);
            }
        }
    }
}