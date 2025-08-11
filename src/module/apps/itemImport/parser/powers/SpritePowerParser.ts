import { Parser } from "../Parser";
import { Power } from "../../schema/CritterpowersSchema";
import { CompendiumKey } from "../../importer/Constants";
import { ImportHelper as IH } from "../../helper/ImportHelper";

export class SpritePowerParser extends Parser<'sprite_power'> {
    protected readonly parseType = 'sprite_power';

    protected override getSystem(jsonData: Power) {
        const system = this.getBaseSystem();

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : '';
        system.action.type = jsonData.action ? jsonData.action._TEXT.toLowerCase() : '';

        return system;
    }

    protected override async getFolder(jsonData: Power, compendiumKey: CompendiumKey): Promise<Folder> {
        const folder = game.i18n.localize("SR5.ItemTypes.SpritePower")
        return IH.getFolder(compendiumKey, folder);
    }
}
