import { Parser } from "../Parser";
import { Gear } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";
import EquipmentItemData = Shadowrun.EquipmentItemData;

export class EquipmentParser extends Parser<EquipmentItemData> {
    protected override parseType: string = 'equipment';

    protected override getSystem(jsonData: Gear): EquipmentItemData['system'] {
        return this.getBaseSystem('Item');
    }

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        const rootFolder = TH.getTranslation('Gear', {type: 'category'});
        const folderName = TH.getTranslation(jsonData.category._TEXT, {type: 'category'});

        return IH.getFolder('Item', rootFolder, folderName);
    }
}