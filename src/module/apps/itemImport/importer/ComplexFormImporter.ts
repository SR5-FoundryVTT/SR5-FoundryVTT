import { DataImporter } from './DataImporter';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { ComplexFormParser } from '../parser/complex-form/ComplexFormParser';
import { ComplexformsSchema, Complexform } from '../schema/ComplexformsSchema';

export class ComplexFormImporter extends DataImporter {
    public readonly files = ['complexforms.xml'] as const;

    async Parse(jsonObject: ComplexformsSchema): Promise<void> {
        return ComplexFormImporter.ParseItems<Complexform>(
            jsonObject.complexforms.complexform,
            {
                compendiumKey: () => "Complex_Form",
                parser: new ComplexFormParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Complex Form"
            }
        );
    }
}
