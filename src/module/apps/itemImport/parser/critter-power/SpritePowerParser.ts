import { ImportHelper } from "../../helper/ImportHelper";
import { ItemParserBase } from "../item/ItemParserBase";


/**
 * Handle a Chummer5a critterpower.xml power element subset for emergent powers to system spirte_power documents.
 * 
 * TODO: Use in Chummer5 character import
 */
export class SpritePowerParser extends ItemParserBase<Shadowrun.SpritePowerItemData> {
    _parseSpritePowerActionType(chummerData): string {
        const action = ImportHelper.StringValue(chummerData, 'action', undefined);
        if (foundry.utils.getType(action) === 'string') return action.toLowerCase();
        else return '';
    }

    public override Parse(chummerData: object, itemData: Shadowrun.SpritePowerItemData, dataTranslation?: object): Shadowrun.SpritePowerItemData {
        itemData = super.Parse(chummerData, itemData, dataTranslation);

        // Chummer has camel case for action, system uses lowercase for type. ('Complex' => 'complex', ...)
        // xml2js returns action as string, and category as Element._TEXT... Unsure why.
        itemData.system.action.type = this._parseSpritePowerActionType(chummerData);

        return itemData;
    }
}