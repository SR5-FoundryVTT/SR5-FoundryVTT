import { Metatype } from "../../schema/MetatypeSchema";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH, TranslationType } from '../../helper/TranslationHelper';
import SpiritActorData = Shadowrun.SpiritActorData;
import { CompendiumKey } from "../../importer/Constants";

export class SpiritParser extends MetatypeParserBase<SpiritActorData> {
    protected override parseType: string = 'spirit';

    protected override getSystem(jsonData: Metatype): SpiritActorData['system'] {
        const system = this.getBaseSystem();

        system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        switch (jsonData.category?._TEXT) {
            case "Insect Spirits":
                system.spiritType = jsonData.name._TEXT.split(/[ /]/)[0].toLowerCase() as Shadowrun.SpiritType;
                break;

            case "Toxic Spirits": {
                const specialMapping = new Map<string, Shadowrun.SpiritType>([
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
                    .replace(" (Demon)", "").replace(/[\s-]/g, "_")
                    .split("/")[0].toLowerCase();
        }

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => +v || 0);
            system.movement.run = { value, mult, base } as Shadowrun.Movement['run'];
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => +v || 0);
            system.movement.walk = { value, mult, base } as Shadowrun.Movement['walk'];
        }
        system.movement.sprint = +(jsonData.sprint?._TEXT.split('/')[0] ?? 0);
        system.is_npc = true;

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Shadowrun.ShadowrunItemData[]> {
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

        const allPowers = await IH.findItem('Critter_Power', powerList.map(i => translationMap[i]));
        const allQualities = await IH.findItem('Quality', qualityList.map(i => translationMap[i]));
        const spiritName = name._TEXT;

        return [
            ...this.getMetatypeItems(allPowers, powers?.power, { type: 'Power', critter: spiritName }, translationMap),
            ...this.getMetatypeItems(allQualities, qualities?.positive?.quality, { type: 'Power', critter: spiritName }, translationMap),
            ...this.getMetatypeItems(allQualities, qualities?.negative?.quality, { type: 'Power', critter: spiritName }, translationMap),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Optional Power', critter: spiritName }, translationMap),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = TH.getTranslation("Spirit", {type: 'category'});
        const folderName = TH.getTranslation(category, {type: 'category'});
        const specFolder = category === 'Insect Spirits' ? jsonData.name._TEXT.match(/\(([^)]+)\)/)?.[1] : undefined;

        return await IH.getFolder(compendiumKey, rootFolder, folderName, specFolder);
    }
}
