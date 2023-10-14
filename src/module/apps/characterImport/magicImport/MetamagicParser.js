import { getArray } from "../BaseParserFunctions.js"

export class MetamagicParser {
    parseMetamagic(chummerChar, system) {
        const metamagics = getArray(chummerChar.metamagics.metamagic);
        
        system.magic.metamagic = metamagics.map(
            meta => {
                return {"name":meta.name, "notes":meta.notes};
            }
        )
    }
}