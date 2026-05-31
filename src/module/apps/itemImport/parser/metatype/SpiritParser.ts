import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class SpiritParser extends MetatypeParserBase<'spirit'> {
    protected readonly parseType = 'spirit';

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        switch (jsonData.category?._TEXT) {
            case "Insect Spirits":
                system.spiritType = jsonData.name._TEXT.split(/[ /]/)[0].toLowerCase() as any;
                break;

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

                system.spiritType = ["Watcher", "Corps Cadavre"].includes(jsonData.name._TEXT)
                    ? (jsonData.name._TEXT.replace(" ", "_").toLowerCase() as any) : "homunculus";
                break;
            default:
                system.spiritType = jsonData.name._TEXT
                    .replace(" Spirit", "").replace("Spirit of ", "")
                    .replace(" (Demon)", "").replace(/[\s\-]/g, "_")
                    .split("/")[0].toLowerCase() as any;
        }

        this.applyMovement(system, jsonData);

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const { name, powers, skills } = jsonData;
        const qualities = this.mergeLists(
            jsonData.qualities?.positive?.quality,
            jsonData.qualities?.negative?.quality
        );
        const optionalPowers = this.mergeLists(
            jsonData.optionalpowers?.optionalpower,
            jsonData.bonus?.optionalpowers?.optionalpower
        );

        const qualityList = this.getNamedList(qualities);
        const skillList = this.getNamedList(skills?.skill, skills?.group);
        const powerList = this.getNamedList(powers?.power, optionalPowers);

        const allSkills = await IH.findItems('Skill', skillList);
        const allQualities = await IH.findItems('Quality', qualityList);
        const allPowers = await IH.findItems('Critter_Power', powerList);

        const spiritName = name._TEXT;
        return [
            ...this.getMetatypeItems(allSkills, skills?.skill, { type: 'Skill', critter: spiritName }),
            ...this.getMetatypeItems(allPowers, powers?.power, { type: 'Power', critter: spiritName }),
            ...this.getMetatypeItems(allQualities, qualities, { type: 'Quality', critter: spiritName }),
            ...this.getMetatypeItems(allSkills, skills?.group, { type: 'Skill Group', critter: spiritName }),
            ...this.getMetatypeItems(allPowers, optionalPowers, { type: 'Optional Power', critter: spiritName }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category ? jsonData.category._TEXT : "Other";
        const rootFolder = game.i18n.localize("TYPES.Actor.spirit");
        const folderName = IH.getTranslatedCategory('metatypes', category);
        const specFolder = category === 'Insect Spirits' ? /\(([^)]+)\)/.exec(jsonData.name._TEXT)?.[1] : undefined;

        return IH.getFolder(compendiumKey, rootFolder, folderName, specFolder);
    }
}
