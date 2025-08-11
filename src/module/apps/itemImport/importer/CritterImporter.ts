import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpiritParser } from '../parser/metatype/SpiritParser';
import { SpriteParser } from '../parser/metatype/SpriteParser';
import { CritterParser } from '../parser/metatype/CritterParser';
import { MetatypeSchema, Metatype } from "../schema/MetatypeSchema";


export class CritterImporter extends DataImporter {
    public files = ['critters.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('metatypes') && jsonObject['metatypes'].hasOwnProperty('metatype');
    }

    protected static parserWrap = class {
        public static isSpirit(jsonData: Metatype): boolean {
            const attributeKeys = [
                "bodmin", "agimin", "reamin",
                "strmin", "chamin", "intmin",
                "logmin", "wilmin", "edgmin",
            ] as const;

            for (const key of attributeKeys)
                if ((jsonData[key]?._TEXT || '').includes("F"))
                    return true;
    
            return false;
        }

        public static async Parse(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Actor.CreateData> {
            const critterParser = new CritterParser();
            const spiritParser = new SpiritParser();
            const spriteParser = new SpriteParser();

            const selectedParser = jsonData.category?._TEXT === 'Sprites' ? spriteParser
                                 : this.isSpirit(jsonData) ? spiritParser : critterParser;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Actor.CreateData>;
        }
    };

    async Parse(chummerData: MetatypeSchema): Promise<void> {
        IH.setTranslatedCategory('metatypes', chummerData.categories.category);

        // get metavariants as well
        const baseMetatypes = chummerData.metatypes.metatype;
        const metavariants = baseMetatypes.flatMap(metatype => {
            const parentName = metatype.name._TEXT;

            return IH.getArray(metatype.metavariants?.metavariant).map(variant => ({
                ...variant,
                name: { _TEXT: `${parentName} (${variant.name._TEXT})` },
                category: { _TEXT: metatype.category?._TEXT ?? "" },
            }));
        });

        return CritterImporter.ParseItems<Metatype>(
            [...baseMetatypes, ...metavariants],
            {
                compendiumKey: (jsonData: Metatype) => {
                    if (jsonData.category?._TEXT === 'Sprites') return 'Sprite';
                    if (CritterImporter.parserWrap.isSpirit(jsonData)) return 'Sprite';
                    return 'Critter';
                },
                parser: CritterImporter.parserWrap,
                errorPrefix: "Failed Parsing Critter"
            }
        );
    }
}
