import { Metatype } from "../../schema/MetatypeSchema";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH, TranslationType } from '../../helper/TranslationHelper';
import SpiritActorData = Shadowrun.SpiritActorData;

export class SpiritParser extends MetatypeParserBase<'spirit'> {
    protected parseType = 'spirit' as const;

    protected override getSystem(jsonData: Metatype): Actor.SystemOfType<'spirit'> {
        const system = this.getBaseSystem() as Actor.SystemOfType<'spirit'>;

        switch (jsonData.category?._TEXT) {
            case "Insect Spirits":
                system.spiritType = jsonData.name._TEXT.split(/[ /]/)[0].toLowerCase();
                break;

            case "Toxic Spirits": {
                const specialMapping = new Map<string, string>([
                    ['Noxious Spirit', 'toxic_air'], ['Abomination Spirit', 'toxic_beasts'],
                    ['Barren Spirit', 'toxic_earth'], ['Nuclear Spirit', 'toxic_fire'],
                    ['Plague Spirit', 'toxic_man'], ['Sludge Spirit', 'toxic_water']
                ]);

                system.spiritType = specialMapping.get(jsonData.name._TEXT) ?? "";
                break;
            }

            case "Ritual":
                const attrMap = {
                    body: "bodmin",     agility: "agimin",  reaction: "reamin",
                    strength: "strmin", charisma: "chamin", intuition: "intmin",
                    logic: "logmin",    willpower: "wilmin"
                } as const;

                for (const [attr, key] of Object.entries(attrMap)) {
                    system.attributes[attr].base = +jsonData[key]._TEXT;
                }

                system.spiritType = ["Watcher", "Corps Cadavre"].includes(jsonData.name._TEXT)
                    ? jsonData.name._TEXT.replace(" ", "_").toLowerCase() : "homunculus";
                break;

            default:
                system.spiritType = jsonData.name._TEXT
                    .replace(" Spirit", "").replace("Spirit of ", "")
                    .replace(" (Demon)", "").replace(/[\s\-]/g, "_")
                    .split("/")[0].toLowerCase();
        }

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => +v || 0);
            system.movement.run = DataDefaults.createData('movement_field', { value, mult, base })
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => +v || 0);
            system.movement.walk = DataDefaults.createData('movement_field', { value, mult, base })
        }
        system.movement.sprint = +(jsonData.sprint?._TEXT.split('/')[0] ?? 0);
        system.is_npc = true;

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const { name, powers } = jsonData;
        const qualities = jsonData.qualities || undefined;
        const optionalpowers = jsonData.optionalpowers || jsonData.bonus?.optionalpowers;

        const powerList = [...IH.getArray(powers?.power), ...IH.getArray(optionalpowers?.optionalpower)].map(i => i._TEXT);
        const qualityList = [
            ...IH.getArray(qualities?.positive?.quality),
            ...IH.getArray(qualities?.negative?.quality),
        ].map(i => i._TEXT);

        const translationMap: Record<string, string> = {};
        const addTranslations = (items: any[], type: TranslationType) =>
            items.forEach(i => translationMap[i] = TH.getTranslation(i, { type }));

        addTranslations(powerList, 'power');
        addTranslations(qualityList, 'quality');

        const allTraits = await IH.findItem('Trait', [...powerList, ...qualityList].map(i => translationMap[i]));
        const spiritName = name._TEXT;

        return [
            ...this.getMetatypeItems(allTraits, powers?.power, { type: 'Power', critter: spiritName }, translationMap),
            ...this.getMetatypeItems(allTraits, qualities?.positive?.quality, { type: 'Power', critter: spiritName }, translationMap),
            ...this.getMetatypeItems(allTraits, qualities?.negative?.quality, { type: 'Power', critter: spiritName }, translationMap),
            ...this.getMetatypeItems(allTraits, optionalpowers?.optionalpower, { type: 'Optional Power', critter: spiritName }, translationMap),
        ];
    }

    protected override async getFolder(jsonData: Metatype): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = TH.getTranslation("Spirit", {type: 'category'});
        const folderName = TH.getTranslation(category, {type: 'category'});
        const specFolder = category === 'Insect Spirits' ? jsonData.name._TEXT.match(/\(([^)]+)\)/)?.[1] : undefined;

        return IH.getFolder('Critter', rootFolder, folderName, specFolder);
    }
}
