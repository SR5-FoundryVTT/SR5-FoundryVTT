import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { MetatypeParserBase } from './MetatypeParserBase';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import SpiritActorData = Shadowrun.SpiritActorData;

import { Metatype } from "../../schema/MetatypeSchema";

export class SpiritParser extends MetatypeParserBase<SpiritActorData> {

    override async Parse(jsonData: Metatype, spirit: SpiritActorData, jsonTranslation?: object): Promise<SpiritActorData> {
        const qualities = jsonData.qualities || undefined;
        const optionalpowers = jsonData.optionalpowers || jsonData.bonus?.optionalpowers || undefined;

        const allTraitsName = [
            ...IH.getArray(jsonData.powers?.power).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(qualities?.positive?.quality).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(qualities?.negative?.quality).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(optionalpowers?.optionalpower).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
        ];

        const traitsPromise = IH.findItem('Trait', allTraitsName);

        spirit.name = jsonData.name._TEXT;
        spirit.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        switch (jsonData.category?._TEXT) {
            case "Insect Spirits":
                spirit.system.spiritType = jsonData.name._TEXT.split(/[ /]/)[0].toLowerCase() as Shadowrun.SpiritType;
                break;

            case "Toxic Spirits": {
                const specialMapping = new Map<string, Shadowrun.SpiritType>([
                    ['Noxious Spirit', 'toxic_air'], ['Abomination Spirit', 'toxic_beasts'],
                    ['Barren Spirit', 'toxic_earth'], ['Nuclear Spirit', 'toxic_fire'],
                    ['Plague Spirit', 'toxic_man'], ['Sludge Spirit', 'toxic_water']
                ]);

                spirit.system.spiritType = specialMapping.get(jsonData.name._TEXT) ?? "";
                break;
            }

            case "Ritual":
                const attrMap = {
                    body: "bodmin",     agility: "agimin",  reaction: "reamin",
                    strength: "strmin", charisma: "chamin", intuition: "intmin",
                    logic: "logmin",    willpower: "wilmin"
                } as const;

                for (const [attr, key] of Object.entries(attrMap)) {
                    spirit.system.attributes[attr].base = +jsonData[key]._TEXT;
                }

                spirit.system.spiritType = ["Watcher", "Corps Cadavre"].includes(jsonData.name._TEXT)
                    ? jsonData.name._TEXT.replace(" ", "_").toLowerCase() : "homunculus";
                break;

            default:
                spirit.system.spiritType = jsonData.name._TEXT
                    .replace(" Spirit", "").replace("Spirit of ", "")
                    .replace(" (Demon)", "").replace(/[\s\-]/g, "_")
                    .split("/")[0].toLowerCase();
        }

        if (jsonData.run) {
            const [value, mult, base] = jsonData.run._TEXT.split('/').map((v) => +v || 0);
            spirit.system.movement.run = { value, mult, base } as Shadowrun.Movement['run'];
        }

        if (jsonData.walk) {
            const [value, mult, base] = jsonData.walk._TEXT.split('/').map((v) => +v || 0);
            spirit.system.movement.walk = { value, mult, base } as Shadowrun.Movement['walk'];
        }
        spirit.system.movement.sprint = +(jsonData.sprint?._TEXT.split('/')[0] ?? 0);

        spirit.system.is_npc = true;

        const allTraits = await traitsPromise;

        //@ts-expect-error
        spirit.items = [
            ...this.getItems(allTraits, jsonData.powers?.power, {type: 'Power', critter: spirit.name}, jsonTranslation),
            ...this.getItems(allTraits, qualities?.positive?.quality, {type: 'Power', critter: spirit.name}, jsonTranslation),
            ...this.getItems(allTraits, qualities?.negative?.quality, {type: 'Power', critter: spirit.name}, jsonTranslation),
            ...this.getItems(allTraits, optionalpowers?.optionalpower, {type: 'Optional Power', critter: spirit.name}, jsonTranslation),
        ];

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, spirit.name);
            spirit.system.description.source = `${jsonData.source._TEXT} ${page}`;
            spirit.name = IH.MapNameToTranslation(jsonTranslation, spirit.name);
        }

        return spirit;
    }
}
