import { Parser } from "../Parser";
import { Power } from "../../schema/CritterpowersSchema";
import { CompendiumKey } from "../../importer/Constants";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { ActionRollType } from '@/module/types/item/Action';

export class SpritePowerParser extends Parser<'sprite_power'> {
    protected readonly parseType = 'sprite_power';

    protected override getSystem(jsonData: Power) {
        const system = this.getBaseSystem();

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : '';
        system.action.type = jsonData.action ? jsonData.action._TEXT.toLowerCase() as ActionRollType['type'] : '';

        return system;
    }

    protected override async getFolder(jsonData: Power, compendiumKey: CompendiumKey): Promise<Folder> {
        return IH.getFolder(compendiumKey, "Sprite Powers");
    }
}
