import { BlankItem, ExtractItemType, Parser } from "../Parser";

/**
 * Parses common, hacking and agent programs.
 */
export class ProgramParser extends Parser<'program'> {
    protected readonly parseType = 'program';

    protected parseItem(item: BlankItem<'program'>, itemData: ExtractItemType<'gears', 'gear'>) {
        const system = item.system;

        if (itemData.category_english === 'Common Programs')
            system.type = 'common_program'
        else if (itemData.category_english === 'Hacking Programs')
            system.type = 'hacking_program'
        else if (itemData.category_english === 'Software')
            system.type = 'agent'
    }

    protected override parseCategoryFlags(item: BlankItem<'program'>, itemData: ExtractItemType<'gears', 'gear'>) {
        return item.system.type;
    }
}
