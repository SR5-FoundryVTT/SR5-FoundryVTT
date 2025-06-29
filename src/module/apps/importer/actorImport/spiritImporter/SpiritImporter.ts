import {SpiritInfoUpdater} from "./SpiritInfoUpdater.js"
import {ItemsParser} from "../itemImporter/ItemsParser.js";
import { SR5Actor } from "src/module/actor/SR5Actor.js";
import { ActorFile } from "../ActorSchema.js";
import { importOptionsType } from "../characterImporter/CharacterImporter.js";
import { getArray } from "../itemImporter/importHelper/BaseParserFunctions.js";


/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class SpiritImporter {

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param {*} actor The actor that will be updated with the chummer character.
     * @param {*} chummerFile The complete chummer file as json object. The first character will be selected for import.
     * @param {*} importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    async importChummerCharacter(actor: SR5Actor<'spirit'>, chummerFile: ActorFile, importOptions: importOptionsType) {
        console.log('Importing the following character file content:');
        console.log(chummerFile);

        console.log('Using the following import options:')
        console.log(importOptions);

        if (!chummerFile.characters?.character) {
            console.log('Did not find a valid character to import  - aborting import');
            return;
        }

        if(actor.type !== "spirit") {
            return;
        }

        await this.resetCharacter(actor)

        const chummerCharacter = getArray(chummerFile.characters.character)[0];
        const infoUpdater = new SpiritInfoUpdater();
        const updatedActorData = infoUpdater.update(actor, chummerCharacter);
        const items = new ItemsParser().parse(chummerCharacter, importOptions);

        await actor.update(await updatedActorData as any);
        await actor.createEmbeddedDocuments('Item', await items);
    }

    async resetCharacter(actor: SR5Actor<'spirit'>) {
        const toDeleteItems = actor.items?.filter(item => item.type !== "action").map(item => item.id) as string[];
        const deletedItems = actor.deleteEmbeddedDocuments("Item", toDeleteItems );

        const removed = {
            'system.skills.language.-=value' : null,
            'system.skills.knowledge.academic.-=value' : null,
            'system.skills.knowledge.interests.-=value' : null,
            'system.skills.knowledge.professional.-=value' : null,
            'system.skills.knowledge.street.-=value' : null
        }
        const removeSkills = actor.update(removed as any)

        //await as late as possible to save time
        await deletedItems
        await removeSkills
    }
}
