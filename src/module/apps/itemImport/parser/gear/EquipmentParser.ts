import { Parser } from "../Parser";
import { CompendiumKey } from "../../importer/Constants";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";

export class EquipmentParser extends Parser<'equipment'> {
    protected readonly parseType = 'equipment';
    protected readonly categories: GearSchema['categories']['category'];

    constructor(categories: GearSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override async getFolder(jsonData: Gear, compendiumKey: CompendiumKey): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const folderName = IH.getTranslatedCategory("gear", categoryData);
        let rootFolder = "Other";

        for (const category of this.categories)
            if (category._TEXT === categoryData && category.$?.blackmarket)
                rootFolder = category.$?.blackmarket;

        if (rootFolder.includes(','))
            rootFolder = "Multiple Categories";

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
