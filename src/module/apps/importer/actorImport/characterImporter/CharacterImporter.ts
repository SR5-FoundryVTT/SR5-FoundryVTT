import { BlankCharacter, CharacterInfoUpdater } from "./CharacterInfoUpdater"
import { ItemsParser } from "../itemImporter/ItemsParser";
import { VehicleParser } from "../itemImporter/vehicleImport/VehicleParser";
import { ActorFile } from "../ActorSchema";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { ImportHelper as IH } from "src/module/apps/itemImport/helper/ImportHelper";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { DataDefaults } from "@/module/data/DataDefaults";

export type importOptionsType = Partial<{
    assignIcons: boolean;
    folderId: string | null;

    armor: boolean;
    contacts: boolean;
    cyberware: boolean;
    equipment: boolean;
    lifestyles: boolean;
    metamagics: boolean;
    powers: boolean;
    qualities: boolean;
    rituals: boolean;
    spells: boolean;
    vehicles: boolean;
    weapons: boolean;
}>;

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class CharacterImporter {

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param {*} chummerFile The complete chummer file as json object. The first character will be selected for import.
     * @param {*} importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    async import(chummerFile: ActorFile, importOptions: importOptionsType) {
        if(!game.user?.can("ACTOR_CREATE")) {
            ui.notifications?.error(game.i18n.format("SR5.VehicleImport.MissingPermission"))
            return;
        }

        console.log('Importing the following character file content:');
        console.log(chummerFile);

        console.log('Using the following import options:')
        console.log(importOptions);

        if (!chummerFile.characters?.character) {
            ui.notifications.error("No valid character found in Chummer file");
            return;
        }

        const chummerCharacter = IH.getArray(chummerFile.characters.character)[0];

        const character = {
            effects: [],
            type: 'character',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('character'),
            items: await new ItemsParser().parse(chummerCharacter, importOptions),
            name: chummerCharacter.alias ?? chummerCharacter.name ?? '[Name not found]',
        } satisfies BlankCharacter;

        await new CharacterInfoUpdater().update(character, chummerCharacter);

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.character.schema, character.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerCharacter.name}\n`);
            console.table(consoleLogs);
        }

        const actor = (await SR5Actor.create(character))!;

        if (importOptions.vehicles) {
            const vehicles = IH.getArray(chummerCharacter.vehicles?.vehicle);
            const vehicleActors = await new VehicleParser().parseVehicles(actor, vehicles);

            await SR5Actor.create(vehicleActors);
        }
    }
}
