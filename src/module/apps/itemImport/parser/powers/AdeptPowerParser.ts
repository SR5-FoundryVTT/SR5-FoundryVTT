import { Parser } from '../Parser';
import { Power } from '../../schema/PowersSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class AdeptPowerParser extends Parser<'adept_power'> {
    protected readonly parseType = 'adept_power';

    protected override getSystem(jsonData: Power) {
        const system = this.getBaseSystem();

        system.pp = Number(jsonData.points._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Power, compendiumKey: CompendiumKey): Promise<Folder> {
        const folder = game.i18n.localize("SR5.ItemTypes.AdeptPower")
        return IH.getFolder(compendiumKey, folder);
    }
}
