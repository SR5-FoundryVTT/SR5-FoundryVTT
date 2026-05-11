import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';

const FORCE_OFFSET_ATTRIBUTE_MAP = {
    body: 'bodmin',
    agility: 'agimin',
    reaction: 'reamin',
    strength: 'strmin',
    willpower: 'wilmin',
    logic: 'logmin',
    intuition: 'intmin',
    charisma: 'chamin',
    magic: 'magmin',
    essence: 'essmin',
} as const;

export class SpiritParser extends MetatypeParserBase<'spirit'> {
    protected readonly parseType = 'spirit';

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        const category = jsonData.category?._TEXT;
        const name = jsonData.name?._TEXT || "";

        if (category === "Insect Spirits") {
            system.spiritType = name.split(/[ /]/)[0];
        }  else if (category === "Ritual") {
            system.attributes.edge.base = Number(jsonData.edgmin?._TEXT) || 0;
            system.spiritType = ["Watcher", "Corps Cadavre"].includes(name) ? name : "Homunculus";
        }  else {
            system.spiritType = name
                .replace(" Spirit", "")
                .replace("Spirit of ", "")
                .replace(" (Demon)", "")
                .replace(/[\s-]/g, "_")
                .split("/")[0];
        }

        this.applyForceOffsetAttributes(system, jsonData);

        if (jsonData.walk)
            system.movement.walk.base = Number(jsonData.walk._TEXT.split('/')[0] ?? 0);

        if (jsonData.run)
            system.movement.run.base = Number(jsonData.run._TEXT.split('/')[0] ?? 0);

        system.movement.sprint = Number(jsonData.sprint?._TEXT.split('/')[0] ?? 0);
        system.half_value_skill = jsonData.skills?.skill?.some(s => ['F', 'F/2'].includes(s.$.rating)) ?? false;

        return system;
    }

    private applyForceOffsetAttributes(system: ReturnType<typeof this.getBaseSystem>, jsonData: Metatype) {
        for (const [attributeId, metatypeAttributeId] of Object.entries(FORCE_OFFSET_ATTRIBUTE_MAP)) {
            const value = (jsonData[metatypeAttributeId] as { _TEXT?: string } | undefined)?._TEXT ?? '';
            const parsed = this.parseForceOffsetValue(value);

            system.force_applies[attributeId] = parsed.forceApplies;
            system.attributes[attributeId].base = parsed.base;
        }
    }

    private parseForceOffsetValue(raw: string): { forceApplies: boolean, base: number } {
        const value = (raw ?? '').trim();
        if (!value) return { forceApplies: false, base: 0 };

        if (/^F$/i.test(value))
            return { forceApplies: true, base: 0 };

        const forceOffsetMatch = /^F\s*([+-])\s*(\d+)$/i.exec(value);
        if (forceOffsetMatch) {
            const sign = forceOffsetMatch[1] === '-' ? -1 : 1;
            const amount = Number(forceOffsetMatch[2]) || 0;
            return { forceApplies: true, base: sign * amount };
        }

        return { forceApplies: false, base: Number(value) || 0 };
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const { name, powers } = jsonData;
        const qualities = jsonData.qualities || undefined;
        const optionalpowers = jsonData.optionalpowers || jsonData.bonus?.optionalpowers;
        const skills = jsonData.skills;

        const powerList = [...IH.getArray(powers?.power), ...IH.getArray(optionalpowers?.optionalpower)].map(i => i._TEXT);
        const qualityList = [
            ...IH.getArray(qualities?.positive?.quality),
            ...IH.getArray(qualities?.negative?.quality),
        ].map(i => i._TEXT);

        const skillList = IH.getArray(skills?.skill).map(s => s._TEXT);

        const allPowers = await IH.findItems('Critter_Power', powerList);
        const allQualities = await IH.findItems('Quality', qualityList);
        const allSkills = await IH.findItems('Skill', skillList);
        const spiritName = name._TEXT;

        return [
            ...this.getMetatypeItems(allSkills, skills?.skill, { type: 'Skill', critter: spiritName }),
            ...this.getMetatypeItems(allPowers, powers?.power, { type: 'Power', critter: spiritName }),
            ...this.getMetatypeItems(allQualities, qualities?.positive?.quality, { type: 'Power', critter: spiritName }),
            ...this.getMetatypeItems(allQualities, qualities?.negative?.quality, { type: 'Power', critter: spiritName }),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Optional Power', critter: spiritName }),
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
