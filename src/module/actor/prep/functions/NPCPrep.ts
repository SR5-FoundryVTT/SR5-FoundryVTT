import CharacterActorData = Shadowrun.CharacterActorData;
import {DataTemplates} from "../../../dataTemplates";
import {Helpers} from "../../../helpers";
import {METATYPEMODIFIER} from "../../../constants";
import {PartsList} from "../../../parts/PartsList";

export class NPCPrep {
    static prepareNPCData(data: CharacterActorData) {
        // Apply to NPC and none NPC to remove lingering modifiers after actor has been removed it's npc status.
        NPCPrep.applyMetatypeModifiers(data);
    }

    /** Replace current metatype modifiers with, even if nothing has changed.
     *
     */
    static applyMetatypeModifiers(data: CharacterActorData) {
        const {metatype} = data;
        let modifiers = DataTemplates.grunt.metatype_modifiers[metatype];
        modifiers = modifiers ? modifiers : {};

        const {attributes} = data;

        for (const [attId, attribute] of Object.entries(attributes)) {
            // old-style object mod transformation is happening in AttributePrep and is needed here. Order is important.
            if (!Array.isArray(attribute.mod)) {
                    console.error('Actor data contains wrong data type for attribute.mod', attribute, !Array.isArray(attribute.mod));
            } else {
                const modifyBy = modifiers?.attributes?.[attId];
                const parts = new PartsList(attribute.mod);
                parts.removePart(METATYPEMODIFIER);

                if (data.is_npc && modifyBy) {
                    parts.addPart(METATYPEMODIFIER, modifyBy);
                }

                attribute.mod = parts.list;

                // Don't modify attribute below one.
                // TODO: Use a SR5.Values.Attribute calculation to avoid duplication.
                Helpers.calcTotal(attribute, {min: 1});
            }
        }
    }

    static AddNPCMetatypeAttributeModifier(value) {
        return {
            name: METATYPEMODIFIER,
            value: value as number
        }
    }
}