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

    _parseSpritePowerActionType(jsonData: Power): string {
        const action = jsonData.action ? jsonData.action._TEXT : undefined;
        if (action && foundry.utils.getType(action) === 'string') return action.toLowerCase();
        else return '';
    }

    protected override getSystem(jsonData: Power): SpritePowerItemData['system'] {
        const system =  this.getBaseSystem('Item');

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : "";

        // Chummer has camel case for action, system uses lowercase for type. ('Complex' => 'complex', ...)
        // xml2js returns action as string, and category as Element._TEXT... Unsure why.
        system.action.type = this._parseSpritePowerActionType(jsonData);

        return system;
    }

    protected override async getFolder(jsonData: Power): Promise<Folder> {
        return IH.getFolder('Trait', "Sprite Powers");
    }
}
