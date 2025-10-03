import { Parser, SystemType } from "../Parser";
import { CompendiumKey } from "../../importer/Constants";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";

export class AmmoParser extends Parser<'ammo'> {
    protected readonly parseType = 'ammo';
    protected readonly categories: GearSchema['categories']['category'];

    constructor(categories: GearSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override getSystem(jsonData: Gear) {
        const system = this.getBaseSystem();

        const bonusData = jsonData.weaponbonus;
        if (bonusData) {
            system.ap = Number(bonusData.ap?._TEXT) || 0;
            system.damage = Number(bonusData.damage?._TEXT) || 0;

            const damageType = bonusData.damagetype?._TEXT ?? '';
            if (damageType.includes('S'))
                system.damageType = 'stun';
            else if (damageType.includes('M'))
                system.damageType = 'matrix';
            else
                system.damageType = 'physical';
        }

        return system;
    }

    public override async Parse(jsonData: Gear, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
        const item = await super.Parse(jsonData, compendiumKey) as Item.CreateData;
        const system = item.system as SystemType<'ammo'>;

        // TODO: This can be improved by using the stored english name in item.system.importFlags.name
        if (jsonData.addweapon?._TEXT) {
            const weaponName = jsonData.addweapon._TEXT;
            const foundWeapon = (await IH.findItems('Weapon', [weaponName]))[0];

            if (foundWeapon && "action" in foundWeapon.system) {
                const weaponData = foundWeapon.system as SystemType<'weapon'>;
                system.damageType = weaponData.action.damage.type.base;
                system.element = weaponData.action.damage.element.base;
                system.damage = weaponData.action.damage.value;
                system.ap = weaponData.action.damage.ap.value;
                system.blast = weaponData.thrown.blast;
            } else if (!foundWeapon) {
                console.log(`[Weapon Missing (Ammo)]\nAmmo: ${item.name}\nWeapon: ${weaponName}`);
            }
        }

        return item;
    }

    protected override async getFolder(jsonData: Gear, compendiumKey: CompendiumKey): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const rootFolder = game.i18n.localize("SR5.ItemTypes.Ammo");
        const folderName = IH.getTranslatedCategory("gear", categoryData);

        let specFolder: string | undefined;
        if (categoryData === "Ammunition") {
            specFolder = 'Misc';
            const splitName = IH.getTranslatedCategory('gear', jsonData.name._TEXT).split(':');
            if (splitName.length > 1)
                specFolder = splitName[0].trim();
        }

        return IH.getFolder(compendiumKey, rootFolder, folderName, specFolder);
    }
}
