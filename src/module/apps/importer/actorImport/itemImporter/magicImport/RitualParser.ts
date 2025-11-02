import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class RitualParser extends Parser<'ritual'> {
    protected readonly parseType = 'ritual';

    protected parseItem(item: BlankItem<'ritual'>, itemData: ExtractItemType<'spells', 'spell'>) {
        const system = item.system;

        system.type = itemData.type_english === 'M' ? 'mana' : 'physical';
        system.descriptors = itemData.descriptors;

        system.action.type = 'varies';
        system.action.skill = 'ritual_spellcasting';
        system.action.attribute = 'magic';
    }
}
