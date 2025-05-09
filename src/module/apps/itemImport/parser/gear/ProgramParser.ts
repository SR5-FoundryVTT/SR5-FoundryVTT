import { Parser } from "../Parser";
import { Gear } from "../../schema/GearSchema";
import { Constants } from "../../importer/Constants";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";
import ProgramItemData = Shadowrun.ProgramItemData;

export class ProgramParser extends Parser<ProgramItemData> {
    protected override parseType: string = 'program';

    protected override getSystem(jsonData: Gear): ProgramItemData['system'] {
        const system =  this.getBaseSystem('Item');

        system.type = Constants.MAP_CHUMMER_PROGRAMM_CATEGORY[jsonData.category._TEXT];

        return system;
    }

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        const rootFolder = game.i18n.localize('SR5.Programs');
        const folderName = TH.getTranslation(jsonData.category._TEXT, {type: 'category'});

        return IH.getFolder('Item', rootFolder, folderName);
    }
}