import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpiritParser } from '../parser/metatype/SpiritParser';
import { SpriteParser } from '../parser/metatype/SpriteParser';
import { CritterParser } from '../parser/metatype/CritterParser';
import { MetatypeSchema, Metatype } from "../schema/MetatypeSchema";

type CrittersDataTypes = Shadowrun.CharacterActorData | Shadowrun.SpiritActorData | Shadowrun.SpriteActorData;

export class CritterImporter extends DataImporter {
    public files = ['critters.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('metatypes') && jsonObject['metatypes'].hasOwnProperty('metatype');
    }

    static parserWrap = class {
        private isSpirit(jsonData: Metatype): Boolean {
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

        public async Parse(jsonData: Metatype): Promise<CrittersDataTypes> {
            const critterParser = new CritterParser();
            const spiritParser = new SpiritParser();
            const spriteParser = new SpriteParser();

            const selectedParser = jsonData.category?._TEXT === 'Sprites' ? spriteParser
                                 : this.isSpirit(jsonData) ? spiritParser : critterParser;

            return await selectedParser.Parse(jsonData);
        }
    };

    async Parse(chummerData: MetatypeSchema): Promise<void> {
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

        return CritterImporter.ParseItems<Metatype, CrittersDataTypes>(
            [...baseMetatypes, ...metavariants],
            {
                compendiumKey: 'Critter',
                parser: new CritterImporter.parserWrap(),
                errorPrefix: "Failed Parsing Critter"
            }
        );
    }
}
