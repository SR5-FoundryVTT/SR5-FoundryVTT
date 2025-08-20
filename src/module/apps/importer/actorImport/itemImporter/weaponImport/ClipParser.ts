import { BlankItem, ExtractItemType, Parser } from "../Parser";

type Unwrap<T> = T extends Array<infer U> ? U : T;
type ClipType = Unwrap<NonNullable<ExtractItemType<'weapons', 'weapon'>['clips']>['clip']> & { guid: string; };

export class ClipParser extends Parser<'ammo'> {
    protected readonly parseType = 'ammo';
    protected readonly compKey = 'Ammo';

    private readonly currentWeapon: ExtractItemType<'weapons', 'weapon'>;
 
    constructor(currentWeapon: ExtractItemType<'weapons', 'weapon'>) {
        super(); this.currentWeapon = currentWeapon;
    }

    protected parseItem(item: BlankItem<'ammo'>, itemData: ClipType) {
        const ammobonus = itemData.ammotype;
        const system = item.system;

        system.ap = Number(ammobonus.weaponbonusap) || 0;
        system.accuracy = Number(ammobonus.weaponbonusacc) || 0;

        if (ammobonus.weaponbonusdamage != null) {
            system.damage = Number(ammobonus.weaponbonusdamage_english.match(/(\d+)/)?.pop()) || 0;

            system.damageType = ammobonus.weaponbonusdamage_english.match(/S/)?.pop() === 'S' ? 'stun' : 'physical';

            system.element = (ammobonus.weaponbonusdamage_english || '').match(/\(e\)/)?.pop() === '(e)' ? 'electricity' : '';
        }

        system.technology.equipped = itemData.name === this.currentWeapon.currentammo;
    }
}
