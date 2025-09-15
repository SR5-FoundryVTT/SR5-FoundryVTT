import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { DataDefaults } from "src/module/data/DataDefaults";
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH, TranslationType } from '../../helper/TranslationHelper';

export class SpiritParser extends MetatypeParserBase<'spirit'> {
    protected readonly parseType = 'spirit';

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        switch (jsonData.category?._TEXT) {
            case "Insect Spirits":
                // TODO shawn fix typing
                system.spiritType = jsonData.name._TEXT.split(/[ /]/)[0].toLowerCase() as any;
                break;

            case "Toxic Spirits": {
                const specialMapping = new Map<string, string>([
                    ['Noxious Spirit', 'toxic_air'], ['Abomination Spirit', 'toxic_beasts'],
                    ['Barren Spirit', 'toxic_earth'], ['Nuclear Spirit', 'toxic_fire'],
                    ['Plague Spirit', 'toxic_man'], ['Sludge Spirit', 'toxic_water']
                ]);

                // TODO shawn fix typing
                system.spiritType = specialMapping.get(jsonData.name._TEXT) ?? "" as any;
                break;
            }

            case "Ritual":
                system.attributes.body.base = Number(jsonData.bodmin._TEXT) || 0;
                system.attributes.agility.base = Number(jsonData.agimin._TEXT) || 0;
                system.attributes.reaction.base = Number(jsonData.reamin._TEXT) || 0;
                system.attributes.strength.base = Number(jsonData.strmin._TEXT) || 0;
                system.attributes.charisma.base = Number(jsonData.chamin._TEXT) || 0;
                system.attributes.intuition.base = Number(jsonData.intmin._TEXT) || 0;
                system.attributes.logic.base = Number(jsonData.logmin._TEXT) || 0;
                system.attributes.willpower.base = Number(jsonData.wilmin._TEXT) || 0;
                system.attributes.edge.base = Number(jsonData.edgmin._TEXT) || 0;
                system.attributes.magic.base = Number(jsonData.magmin?._TEXT) || 0;
                system.attributes.resonance.base = Number(jsonData.resmin?._TEXT) || 0;

                // TODO shawn fix typing
                system.spiritType = ["Watcher", "Corps Cadavre"].includes(jsonData.name._TEXT)
                    ? (jsonData.name._TEXT.replace(" ", "_").toLowerCase() as any) : "homunculus";
                break;
            default:
                // TODO shawn fix typing
                system.spiritType = jsonData.name._TEXT
                    .replace(" Spirit", "").replace("Spirit of ", "")
                    .replace(" (Demon)", "").replace(/[\s\-]/g, "_")
                    .split("/")[0].toLowerCase() as any;
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

        return IH.getFolder(compendiumKey, rootFolder, folderName, specFolder);
    }
}
