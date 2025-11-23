import { BlankItem, ExtractItemType, Parser, ItemSystems } from "../Parser";

export class SimpleParser<Type extends ItemSystems> extends Parser<Type> {
    protected readonly parseType: Type;

    constructor(parseType: Type) {
        super(); this.parseType = parseType;
    }

    protected parseItem(
        item: BlankItem<'echo' | 'metamagic' | "equipment">,
        itemData: ExtractItemType<'metamagics', 'metamagic'> | ExtractItemType<'gears', 'gear'>
    ) { }
}
