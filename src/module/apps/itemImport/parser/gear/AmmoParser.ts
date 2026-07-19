import { Parser, SystemType } from "../Parser";
import { CompendiumKey } from "../../importer/Constants";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { WeaponParserBase } from "../weapon/WeaponParserBase";

const weaponParser = new WeaponParserBase();

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
            let damageText = bonusData.damagereplace?._TEXT?.trim() ?? bonusData.damage?._TEXT?.trim() ?? '';
            const apText = bonusData.apreplace?._TEXT?.trim() ?? bonusData.ap?._TEXT ?? 0;
            const damageTypeText = bonusData.damagetype?._TEXT?.trim() ?? '';
            let normalizedDamageType = '';

            if (/^\([PSM]\)$/i.test(damageTypeText))
                normalizedDamageType = damageTypeText.slice(1, -1);
            else if (/^[PSM](?:\([a-zA-Z]+\))?$/i.test(damageTypeText))
                normalizedDamageType = damageTypeText;
            else if (/^Acid$/i.test(damageTypeText))
                normalizedDamageType = 'P(acid)';

            const parsedDamageText = /^([+-]?\d+(?:\.\d+)?)([PSM])?(?:\(([a-zA-Z]+)\))?$/i.exec(damageText);
            if (parsedDamageText && normalizedDamageType) {
                const [, amount] = parsedDamageText;
                damageText = `${amount}${normalizedDamageType}`;
            } else if (!damageText && normalizedDamageType) {
                damageText = `0${normalizedDamageType}`;
            }

            const damageData = weaponParser.parseDamageData(damageText, apText);
            system.ap = damageData.ap.value;
            system.damage = damageData.value;
            system.damageType = damageData.type.value;
            system.element = damageData.element.value;
            system.replaceAP = !!bonusData.apreplace?._TEXT;
            system.replaceDamage = !!bonusData.damagereplace?._TEXT;
        }

        return system;
    }

    protected override setImporterFlags(entity: Item.CreateData, jsonData: Gear) {
        super.setImporterFlags(entity, jsonData);

        if (entity.system!.importFlags!.category === 'Ammunition') {
            entity.system!.importFlags!.category = entity.name.split(':')[0].trim();
        }
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
                console.warn(`[Weapon Missing (Ammo)]\nAmmo: ${item.name}\nWeapon: ${weaponName}`);
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
