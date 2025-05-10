import { Parser } from "../Parser";
import { Power } from "../../schema/CritterpowersSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import SpritePowerItemData = Shadowrun.SpritePowerItemData;

/**
 * Handle a Chummer5a critterpower.xml power element subset for emergent powers to system spirte_power documents.
 * 
 * TODO: Use in Chummer5 character import
 */
export class SpritePowerParser extends Parser<SpritePowerItemData> {
    protected override parseType: string = 'sprite_power';

    protected override getSystem(jsonData: Power): SpritePowerItemData['system'] {
        const system = this.getBaseSystem('Item');

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : '';
        system.action.type = jsonData.action ? jsonData.action._TEXT.toLowerCase() : '';

        return system;
    }

    protected override async getFolder(jsonData: Power): Promise<Folder> {
        return IH.getFolder('Trait', "Sprite Powers");
    }
}
