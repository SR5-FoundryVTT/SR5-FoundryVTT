import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import { BlankItem, ExtractItemType, Parser } from "../Parser";

/**
 * Parses ammunition
 */
export class AmmoParser extends Parser<'ammo'> {
    protected readonly parseType = 'ammo';
    protected readonly compKey = 'Ammo';

    protected parseItem(item: BlankItem<'ammo'>, itemData: ExtractItemType<'gears', 'gear'>) {
        const system = item.system;
        if (itemData.weaponbonusap)
            system.ap = Number(itemData.weaponbonusap) || 0;

        if (itemData.weaponbonusdamage) {
            system.damage = Number(itemData.weaponbonusdamage_english) || 0;

            if (itemData.weaponbonusdamage.includes('S'))
                system.damageType = 'stun';
            else if (itemData.weaponbonusdamage.includes('M'))
                system.damageType = 'matrix';
            else
                system.damageType = 'physical';

            system.element = (itemData.weaponbonusdamage_english || '').match(/\(e\)/)?.pop() === '(e)' ? 'electricity' : '';
        }

        system.accuracy = Number(itemData.weaponbonusacc) || 0;
        system.blast = { radius: 0, dropoff: 0 };
        system.replaceDamage = false;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(itemData.name_english.split(':')[0]));
    }
}
