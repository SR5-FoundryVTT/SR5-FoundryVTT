import { DataImporter } from './DataImporter';
import { EchoParser } from '../parser/powers/EchoParser';
import { EchoesSchema, Echo } from '../schema/EchoesSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class EchoesImporter extends DataImporter {
    public readonly files = ['echoes.xml'] as const;

    async _parse(jsonObject: EchoesSchema): Promise<void> {
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
