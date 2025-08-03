import { DataImporter } from './DataImporter';
import { AdeptPowerParser } from '../parser/powers/AdeptPowerParser';
import { Power, PowersSchema } from '../schema/PowersSchema';

export class AdeptPowerImporter extends DataImporter {
    public files = ['powers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    async Parse(jsonObject: PowersSchema): Promise<void> {
        return await AdeptPowerImporter.ParseItems<Power, Shadowrun.AdeptPowerItemData>(
            jsonObject.powers.power,
            {
                compendiumKey: () => "Adept_Power",
                parser: new AdeptPowerParser(),
                errorPrefix: "Failed Parsing Complex Form"
            }
        );
    }
}
