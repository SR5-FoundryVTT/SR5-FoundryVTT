import { ParseData, Parser } from "../Parser";
import AmmoItemData = Shadowrun.AmmoItemData;
import { Gear } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";

export class AmmoParser extends Parser<AmmoItemData> {
    protected override parseType: string = 'ammo';

    protected override getSystem(jsonData: Gear): AmmoItemData['system'] {
        const system =  this.getBaseSystem('Item');

        const bonusData = jsonData.weaponbonus;
        if (bonusData) {
            system.ap = Number(bonusData.ap?._TEXT) || 0;
            system.damage = Number(bonusData.damage?._TEXT) || 0;

            const damageType = bonusData.damagetype?._TEXT ?? '';
            if (damageType.includes('P'))
                system.damageType = 'physical';
            else if (damageType.includes('S'))
                system.damageType = 'stun';
            else if (damageType.includes('M'))
                system.damageType = 'matrix';
        }

        return system;
    }

    public override async Parse(jsonData: Gear): Promise<AmmoItemData> {
        const item = await super.Parse(jsonData);

        // TODO: This can be improved by using the stored english name in item.system.importFlags.name
        if (jsonData.addweapon?._TEXT) {
            const weaponName = jsonData.addweapon._TEXT;
            const [foundWeapon] = await IH.findItem('Item', weaponName, 'weapon') ?? [];

            if (foundWeapon && "action" in foundWeapon.system) {
                const weaponData = foundWeapon.system as Shadowrun.WeaponData;
                item.system.damageType = weaponData.action.damage.type.base;
                item.system.element = weaponData.action.damage.element.base;
                item.system.damage = weaponData.action.damage.value;
                item.system.ap = weaponData.action.damage.ap.value;
                item.system.blast = weaponData.thrown.blast;
            } else if (!foundWeapon) {
                console.log(`[Weapon Missing (Ammo)]\nAmmo: ${item.name}\nWeapon: ${weaponName}`);
            }
        }

        return item;
    }

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        let folderName = 'Misc';

        const splitName = TH.getTranslation(jsonData.name._TEXT).split(':');
        if (splitName.length > 1)
            folderName = splitName[0].trim();

        const rootFolder = TH.getTranslation('Ammunition', {type: 'category'});
        return IH.getFolder('Item', rootFolder, folderName);
    }
}