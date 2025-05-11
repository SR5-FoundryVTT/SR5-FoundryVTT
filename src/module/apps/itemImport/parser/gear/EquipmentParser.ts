import { Parser } from "../Parser";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";
import EquipmentItemData = Shadowrun.EquipmentItemData;

export class EquipmentParser extends Parser<EquipmentItemData> {
    protected override parseType: string = 'equipment';
    protected categories: GearSchema['categories']['category'];

    constructor(categories: GearSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const folderName = TH.getTranslation(categoryData, {type: 'category'});
        let rootFolder: string | undefined;

        for (const category of this.categories)
            if (category._TEXT === categoryData)
                rootFolder = category.$?.blackmarket;

        if (!rootFolder)
            rootFolder = "Other";

        if (rootFolder.includes(','))
            rootFolder = "Multiple Categories";

        return IH.getFolder('Gear', rootFolder, folderName);
    }
}
