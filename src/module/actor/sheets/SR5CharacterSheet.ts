import {SR5BaseActorSheet} from "./SR5BaseActorSheet";
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import MarkedDocument = Shadowrun.MarkedDocument;


interface CharacterSheetData extends SR5ActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    markedDocuments: MarkedDocument[]
}


export class SR5CharacterSheet extends SR5BaseActorSheet {
    getData(): any {
        const data = super.getData() as CharacterSheetData;

        // Character actor types are matrix actors.
        super._prepareMatrixAttributes(data);

        data['markedDocuments'] = this.object.getAllMarkedDocuments();

        return data;
    }
}