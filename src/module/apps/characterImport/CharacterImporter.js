import {CharacterInfoUpdater} from "./CharacterInfoUpdater"
import {ItemsParser} from "./ItemsParser"

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

        const chummerCharacter = chummerFile.characters.character;
        const updatedActorData = new CharacterInfoUpdater().update(actor._source, chummerCharacter);
        const items = new ItemsParser().parse(chummerCharacter, importOptions);


        await actor.update(updatedActorData);
        await actor.createEmbeddedDocuments('Item', items);
    }
}