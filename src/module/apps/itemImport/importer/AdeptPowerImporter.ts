import { DataImporter } from './DataImporter';
import { Power, PowersSchema } from '../schema/PowersSchema';
import { AdeptPowerParser } from '../parser/powers/AdeptPowerParser';

export class AdeptPowerImporter extends DataImporter {
    public files = ['powers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    async Parse(jsonObject: PowersSchema): Promise<void> {
        return AdeptPowerImporter.ParseItems<Power>(
            jsonObject.powers.power,
            {
                compendiumKey: () => "Adept_Power",
                parser: new AdeptPowerParser(),
                errorPrefix: "Failed Parsing Complex Form"
            }
        );
    }
}
