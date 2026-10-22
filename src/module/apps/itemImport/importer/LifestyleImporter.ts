import { DataImporter } from './DataImporter';
import { LifestyleParser } from '../parser/misc/LifestyleParser';
import { LifestylesSchema, Lifestyle } from '../schema/LifestylesSchema';

export class LifestyleImporter extends DataImporter {
    public readonly files = ['lifestyles.xml'] as const;

    async _parse(jsonObject: LifestylesSchema): Promise<void> {
        return LifestyleImporter.ParseItems<Lifestyle>(
            jsonObject.lifestyles.lifestyle,
            {
                compendiumKey: () => "Lifestyle",
                parser: new LifestyleParser(),
                // An empty <hide /> parses as null. A lifestyle's cost is monthly, so daily ones are left out.
                filter: jsonData => !('hide' in jsonData) && jsonData.increment?._TEXT !== 'day',
                documentType: "Lifestyles"
            }
        );
    }
}
