import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { QualityParser } from '../parser/quality/QualityParser';
import { QualitiesSchema, Quality } from "../schema/QualitiesSchema";
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class QualityImporter extends DataImporter {
    public readonly files = ['qualities.xml'] as const;

    async _parse(jsonObject: QualitiesSchema): Promise<void> {
        IH.setTranslatedCategory('qualities', jsonObject.categories.category);

        return QualityImporter.ParseItems<Quality>(
            jsonObject.qualities.quality,
            {
                compendiumKey: () => "Quality",
                parser: new QualityParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Quality"
            }
        );
    }
}
