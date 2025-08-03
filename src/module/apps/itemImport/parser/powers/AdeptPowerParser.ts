import { Parser } from '../Parser';
import { Power } from '../../schema/PowersSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import AdeptPowerItemData = Shadowrun.AdeptPowerItemData;

export class AdeptPowerParser extends Parser<AdeptPowerItemData> {
    protected override parseType: string = 'adept_power';

    protected override getSystem(jsonData: Power): AdeptPowerItemData['system'] {
        const system = this.getBaseSystem();

        system.pp = Number(jsonData.points._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Power, compendiumKey: CompendiumKey): Promise<Folder> {
        return await IH.getFolder(compendiumKey, "Adept Powers");
    }
}
