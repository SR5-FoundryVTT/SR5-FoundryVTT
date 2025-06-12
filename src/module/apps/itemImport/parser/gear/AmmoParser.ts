import { Parser, SystemType } from "../Parser";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";

export class AmmoParser extends Parser<'ammo'> {
    protected parseType = 'ammo' as const;
    protected categories: GearSchema['categories']['category'];

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
            if (damageType.includes('P'))
                system.damageType = 'physical';
            else if (damageType.includes('S'))
                system.damageType = 'stun';
            else if (damageType.includes('M'))
                system.damageType = 'matrix';
        }

        return system;
    }

    public override async Parse(jsonData: Gear): Promise<Item.CreateData> {
        const item = await super.Parse(jsonData) as Item.CreateData;
        const system = item.system as SystemType<'ammo'>;

        // TODO: This can be improved by using the stored english name in item.system.importFlags.name
        if (jsonData.addweapon?._TEXT) {
            const weaponName = jsonData.addweapon._TEXT;
            const weaponTranslation = TH.getTranslation(weaponName, { type: 'weapon' });
            const [foundWeapon] = await IH.findItem('Weapon', weaponTranslation, 'weapon') ?? [];

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

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const rootFolder = TH.getTranslation("Weapons", {type: 'category'})
        const folderName = TH.getTranslation(categoryData, {type: 'category'});

        let specFolder: string | undefined;
        if (categoryData === "Ammunition") {
            specFolder = 'Misc';
            const splitName = TH.getTranslation(jsonData.name._TEXT).split(':');
            if (splitName.length > 1)
                specFolder = splitName[0].trim();
        }

        return IH.getFolder('Gear', rootFolder, folderName, specFolder);
    }
}