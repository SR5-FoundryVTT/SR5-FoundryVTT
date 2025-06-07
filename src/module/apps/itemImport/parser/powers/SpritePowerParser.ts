import { Parser } from "../Parser";
import { Power } from "../../schema/CritterpowersSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";

export class SpritePowerParser extends Parser<'sprite_power'> {
    protected parseType = 'sprite_power' as const;

    protected override getSystem(jsonData: Power): Item.SystemOfType<'sprite_power'> {
        const system = this.getBaseSystem() as Item.SystemOfType<'sprite_power'>;

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : '';
        system.action.type = jsonData.action ? jsonData.action._TEXT.toLowerCase() : '';

        return system;
    }

    protected override async getFolder(jsonData: Power): Promise<Folder> {
        return IH.getFolder('Trait', "Sprite Powers");
    }
}
