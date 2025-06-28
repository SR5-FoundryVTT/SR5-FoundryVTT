import { CharacterInfoUpdater } from "./CharacterInfoUpdater"
import { ItemsParser } from "../itemImporter/ItemsParser";
import VehicleParser from "../itemImporter/vehicleImport/VehicleParser";
import { ActorFile } from "../ActorSchema";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { ImportHelper as IH } from "src/module/apps/itemImport/helper/ImportHelper";
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
    async importChummerCharacter(actor: SR5Actor<'character'>, chummerFile: ActorFile, importOptions) {
        console.log('Importing the following character file content:');
        console.log(chummerFile);

        console.log('Using the following import options:')
        console.log(importOptions);

        if (!chummerFile.characters?.character) {
            console.log('Did not find a valid character to import  - aborting import');
            return;
        }

        await this.resetCharacter(actor)

        // only import the first character in the file
        const chummerCharacter = IH.getArray(chummerFile.characters.character)[0];
        const infoUpdater = new CharacterInfoUpdater();
        const updatedActorData = infoUpdater.update(actor, chummerCharacter);
        const items = new ItemsParser().parse(chummerCharacter, importOptions);

        void new VehicleParser().parseVehicles(actor, chummerCharacter, importOptions)

        await actor.update(await updatedActorData as any);
        await actor.createEmbeddedDocuments('Item', await items);
    }

    async resetCharacter(actor: SR5Actor<'character'>) {
        const toDeleteItems = actor.items?.filter(item => item.type !== "action")
            //filter items that were not imported
            //first line is for legacy items, user need to delete these manually
            .filter(item => item.system.importFlags.isImported)
            .filter(item => item.effects.size === 0)
            .map(item => item.id) as string[];

        const deletedItems = actor.deleteEmbeddedDocuments("Item", toDeleteItems);

        const removed = {
            'system.skills.language.-=value': null,
            'system.skills.knowledge.academic.-=value': null,
            'system.skills.knowledge.interests.-=value': null,
            'system.skills.knowledge.professional.-=value': null,
            'system.skills.knowledge.street.-=value': null
        };
        const removeSkills = actor.update(removed as any);

        //await as late as possible to save time
        await deletedItems
        await removeSkills
    }
}
