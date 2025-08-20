import { genImportFlags, formatAsSlug } from "./BaseParserFunctions";
import { BlankItem, ExtractItemType, Parser, ItemSystems } from "../Parser";
import { CompendiumKey } from "@/module/apps/itemImport/importer/Constants";

export class SimpleParser<Type extends ItemSystems> extends Parser<Type> {
    protected readonly parseType: Type;
    protected readonly compKey: CompendiumKey | null;

    constructor(parseType: Type, compKey: CompendiumKey | null = null) {
        super();
        this.parseType = parseType;
        this.compKey = compKey;
    }

    protected parseItem(
        item: BlankItem<'echo' | 'metamagic' | "equipment">,
        itemData: ExtractItemType<'metamagics', 'metamagic'> | ExtractItemType<'gears', 'gear'>
    ) {
        const system = item.system;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
    }
}
