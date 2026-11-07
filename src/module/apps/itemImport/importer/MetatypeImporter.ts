import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { MetatypeItemParser } from '../parser/metatype/MetatypeItemParser';
import { MetatypeSchema, Metatype } from "../schema/MetatypeSchema";

export class MetatypeImporter extends DataImporter {
    public readonly files = ['metatypes.xml'] as const;

    async _parse(jsonObject: MetatypeSchema): Promise<void> {
        if (jsonObject.categories?.category) {
            IH.setTranslatedCategory('metatypes', jsonObject.categories.category);
        }

        const rawMetatypes = IH.getArray(jsonObject.metatypes?.metatype);
        const allMetatypes: Metatype[] = [];

        for (const meta of rawMetatypes) {
            allMetatypes.push(meta);
            if (meta.metavariants?.metavariant) {
                const variants = IH.getArray(meta.metavariants.metavariant);
                for (const variant of variants) {
                    allMetatypes.push(variant);
                }
            }
        }

        return MetatypeImporter.ParseItems<Metatype>(
            allMetatypes,
            {
                compendiumKey: () => "Metatype",
                parser: new MetatypeItemParser(),
                documentType: "Metatype"
            }
        );
    }
}

export const RaceImporter = MetatypeImporter;
