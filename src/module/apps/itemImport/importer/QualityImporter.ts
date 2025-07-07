import { DataImporter } from './DataImporter';
import { QualityParser } from '../parser/quality/QualityParser';
import { QualitiesSchema, Quality } from "../schema/QualitiesSchema";
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class QualityImporter extends DataImporter {
    public files = ['qualities.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('qualities') && jsonObject['qualities'].hasOwnProperty('quality');
    }

    async Parse(jsonObject: QualitiesSchema): Promise<void> {
        return QualityImporter.ParseItems<Quality, Shadowrun.QualityItemData>(
            jsonObject.qualities.quality,
            {
                compendiumKey: () => "Quality",
                parser: new QualityParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Quality"
            }
        );
    }
}
