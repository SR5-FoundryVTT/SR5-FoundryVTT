import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { ComplexFormParser } from '../parser/complex-form/ComplexFormParser';
import { ComplexformsSchema, Complexform } from '../schema/ComplexformsSchema';

export class ComplexFormImporter extends DataImporter {
    public files = ['complexforms.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('complexforms') && jsonObject['complexforms'].hasOwnProperty('complexform');
    }

    async Parse(jsonObject: ComplexformsSchema): Promise<void> {
        const items = await ComplexFormImporter.ParseItems<Complexform, Shadowrun.ComplexFormItemData>(
            jsonObject.complexforms.complexform,
            {
                compendiumKey: "Magic",
                parser: new ComplexFormParser(),
                filter: jsonData => !DataImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Complex Form"
            }
        );

        // @ts-expect-error
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Magic'].pack }) as Item;
    }
}
