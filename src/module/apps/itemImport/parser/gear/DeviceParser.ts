import { Parser } from "../Parser";
import { Gear,GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";
import DeviceItemData = Shadowrun.DeviceItemData;

export class DeviceParser extends Parser<DeviceItemData> {
    protected override parseType: string = 'device';
    protected categories: GearSchema['categories']['category'];

    constructor(categories: GearSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override getSystem(jsonData: Gear): DeviceItemData['system'] {
        const system =  this.getBaseSystem();

        const category = jsonData.category._TEXT;
        system.category = category === 'Cyberdecks' ? 'cyberdeck'
                        : category === 'Commlinks'  ? 'commlink'
                                                    : 'rcc';

        if (system.category === 'cyberdeck') {
            const attrArray = jsonData.attributearray?._TEXT;
            if (attrArray) {
                const [att1, att2, att3, att4] = attrArray.split(',').map(Number);

                system.atts.att1.value = att1;
                system.atts.att2.value = att2;
                system.atts.att3.value = att3;
                system.atts.att4.value = att4;
            } else {
                system.atts.att1.value = Number(jsonData.attack?._TEXT) || 0;
                system.atts.att2.value = Number(jsonData.sleaze?._TEXT) || 0;
                system.atts.att3.value = Number(jsonData.dataprocessing?._TEXT) || 0;
                system.atts.att4.value = Number(jsonData.firewall?._TEXT) || 0;
            }
        } else {
            system.atts.att3.value = Number(jsonData.dataprocessing?._TEXT) || 0;;
            system.atts.att4.value = Number(jsonData.firewall?._TEXT) || 0;
        }
    
        return system;
    }

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const rootFolder = TH.getTranslation('Electronics', {type: 'category'});
        const folderName = TH.getTranslation(categoryData, {type: 'category'});

        return await IH.getFolder('Gear', rootFolder, folderName);
    }
}
