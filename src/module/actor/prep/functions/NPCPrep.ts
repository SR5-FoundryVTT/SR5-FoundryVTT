import CharacterActorData = Shadowrun.CharacterActorData;
import {DataTemplates} from "../../../dataTemplates";
import {SR5} from "../../../config";

export class NPCPrep {
    // TODO: This is only for dev until it's ready and needs to be moved to data migration.
    static prepareNPCData(data: CharacterActorData)  {
        data.is_npc = data.is_npc ? data.is_npc : false;
        data.npc = data.npc ? data.npc : {
            is_grunt: false,
            professional_rating: 0
        };

        if (data.is_npc) {
            NPCPrep.applyMetatypeModifiers(data);
        }

        // TODO: metatype should go into migration for false metatypes. This is a dev todo and taMiF should be scolded for it...
        //@ts-ignore
        const type = data.metatype.toLowerCase();
        data.metatype = SR5.character.types.hasOwnProperty(type) ? data.metatype : 'human';
    }

    static applyMetatypeModifiers(data: CharacterActorData) {
        const {metatype} = data;
        const modifiers = DataTemplates.grunt.metatype_modifiers[metatype];
        if (!modifiers) {
            return;
        }


        const {attributes} = data;
        for (const [attId, value] of Object.entries(modifiers.attributes)) {
            if (attributes[attId] !== undefined) {
                //@ts-ignore
                // TODO: Add typing.
                attributes[attId].temp = value;
            }
        }
    }
}