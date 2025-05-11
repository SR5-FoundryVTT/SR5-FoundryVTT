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
        return ComplexFormImporter.ParseItems<Complexform, Shadowrun.ComplexFormItemData>(
            jsonObject.complexforms.complexform,
            {
                compendiumKey: "Magic",
                parser: new ComplexFormParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Complex Form"
            }
        );
    }
}
