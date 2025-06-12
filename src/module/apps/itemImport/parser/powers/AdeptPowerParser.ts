import { Parser } from '../Parser';
import { Power } from '../../schema/PowersSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class AdeptPowerParser extends Parser<'adept_power'> {
    protected parseType = 'adept_power' as const;

    protected override getSystem(jsonData: Power) {
        const system = this.getBaseSystem();

        system.pp = Number(jsonData.points._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Power): Promise<Folder> {
        return IH.getFolder('Trait', "Adept Powers");
    }
}
