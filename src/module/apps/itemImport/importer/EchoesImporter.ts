import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { EchoesSchema, Echo } from '../schema/EchoesSchema';
import { EchoParser } from '../parser/critter-power/EchoParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class EchoesImporter extends DataImporter {
    public files = ['echoes.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('echoes') && jsonObject['echoes'].hasOwnProperty('echo');
    }

    async Parse(jsonObject: EchoesSchema): Promise<void> {
        const items = await EchoesImporter.ParseItems<Echo, Shadowrun.EchoItemData>(
            jsonObject.echoes.echo,
            {
                compendiumKey: "Trait",
                parser: new EchoParser(),
                filter: jsonData => !EchoesImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Echoes"
            }
        );

        // @ts-expect-error
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Trait'].pack });
    }    
}
