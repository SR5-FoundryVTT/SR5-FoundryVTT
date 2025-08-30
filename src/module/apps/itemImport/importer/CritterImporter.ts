import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpiritParser } from '../parser/metatype/SpiritParser';
import { SpriteParser } from '../parser/metatype/SpriteParser';
import { CritterParser } from '../parser/metatype/CritterParser';
import { MetatypeSchema, Metatype } from "../schema/MetatypeSchema";

export class CritterImporter extends DataImporter {
    public readonly files = ['critters.xml'] as const;

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

        private readonly critterParser = new CritterParser();
        private readonly spiritParser = new SpiritParser();
        private readonly spriteParser = new SpriteParser();
        public async Parse(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Actor.CreateData> {
            const selectedParser = jsonData.category?._TEXT === 'Sprites'        ? this.spriteParser
                                 : CritterImporter.parserWrap.isSpirit(jsonData) ? this.spiritParser 
                                                                                 : this.critterParser;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Actor.CreateData>;
        }
    };

    async _parse(chummerData: MetatypeSchema): Promise<void> {
        IH.setTranslatedCategory('metatypes', IH.getArray(chummerData.categories.category));

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
                parser: new CritterImporter.parserWrap(),
                documentType: "Critter"
            }
        );
    }
}
