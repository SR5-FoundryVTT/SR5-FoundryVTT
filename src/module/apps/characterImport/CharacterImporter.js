import {CharacterInfoUpdater} from "./CharacterInfoUpdater"
import {ItemsParser} from "./importHelper/ItemsParser";
import VehicleParser from "./vehicleImport/VehicleParser.js";


/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class CharacterImporter {

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param {*} actor The actor that will be updated with the chummer character.
     * @param {*} chummerFile The complete chummer file as json object. The first character will be selected for import.
     * @param {*} importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    async importChummerCharacter(actor, chummerFile, importOptions) {
        console.log('Importing the following character file content:');
        console.log(chummerFile);

        console.log('Using the following import options:')
        console.log(importOptions);

        if (!chummerFile.characters || !chummerFile.characters.character) {
            console.log('Did not find a valid character to import  - aborting import');
            return;
        }

        await this.resetCharacter(actor)

        const chummerCharacter = chummerFile.characters.character;
        const characterInfoUpdater = new CharacterInfoUpdater();
        const updatedActorData = characterInfoUpdater.update(actor._source, chummerCharacter);
        const items = new ItemsParser().parse(chummerCharacter, importOptions);

        new VehicleParser().parseVehicles(actor, chummerCharacter, importOptions)

        await actor.update(await updatedActorData);
        await actor.createEmbeddedDocuments('Item', await items);
    }

    async resetCharacter(actor) {
        let deletedItems = actor.deleteEmbeddedDocuments("Item", [], { deleteAll: true });

        let removed = {
            'system.skills.language.-=value' : null,
            'system.skills.knowledge.academic.-=value' : null,
            'system.skills.knowledge.interests.-=value' : null,
            'system.skills.knowledge.professional.-=value' : null,
            'system.skills.knowledge.street.-=value' : null
        }
        let removeSkills = actor.update(removed)

        //await as late as possible to save time
        await deletedItems
        await removeSkills
    }
}