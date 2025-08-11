import { DataImporter } from './DataImporter';
import { EchoParser } from '../parser/powers/EchoParser';
import { EchoesSchema, Echo } from '../schema/EchoesSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class EchoesImporter extends DataImporter {
    public files = ['echoes.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('echoes') && jsonObject['echoes'].hasOwnProperty('echo');
    }

    async Parse(jsonObject: EchoesSchema): Promise<void> {
        return EchoesImporter.ParseItems<Echo>(
            jsonObject.echoes.echo,
            {
                compendiumKey: () => "Echo",
                parser: new EchoParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Echoes"
            }
        );
    }    
}
