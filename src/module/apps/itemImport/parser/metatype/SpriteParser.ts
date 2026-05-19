import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';

const LEVEL_OFFSET_ATTRIBUTE_MAP = {
    resonance: 'resmin',
    attack: 'chamin',
    sleaze: 'intmin',
    data_processing: 'logmin',
    firewall: 'wilmin',
} as const;

export class SpriteParser extends MetatypeParserBase<'sprite'> {
    protected readonly parseType = 'sprite';

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        system.spriteType = jsonData.name._TEXT.split(" ")[0];
        this.applyLevelOffsetAttributes(system, jsonData);

        return system;
    }

    private applyLevelOffsetAttributes(system: ReturnType<typeof this.getBaseSystem>, jsonData: Metatype) {
        for (const [attributeId, metatypeAttributeId] of Object.entries(LEVEL_OFFSET_ATTRIBUTE_MAP)) {
            const value = jsonData[metatypeAttributeId]._TEXT;
            const parsed = this.parseLevelOffsetValue(value);

            if (attributeId === 'resonance')
                system.attributes.resonance.applies_special = parsed.levelApplies;
            else
                system.matrix[attributeId].applies_special = parsed.levelApplies;

            if (attributeId === 'resonance')
                system.attributes.resonance.base = parsed.base;
            else
                system.matrix[attributeId].base = parsed.base;
        }
    }

    private parseLevelOffsetValue(raw: string): { levelApplies: boolean, base: number } {
        const value = (raw ?? '').trim();
        if (!value) return { levelApplies: false, base: 0 };

        if (/^F$/i.test(value))
            return { levelApplies: true, base: 0 };

        const levelOffsetMatch = /^F\s*([+-])\s*(\d+)$/i.exec(value);
        if (levelOffsetMatch) {
            const sign = levelOffsetMatch[1] === '-' ? -1 : 1;
            const amount = Number(levelOffsetMatch[2]) || 0;
            return { levelApplies: true, base: sign * amount };
        }

        return { levelApplies: false, base: Number(value) || 0 };
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const skills = jsonData.skills;

        const optionalpowers = {
            optionalpower: [
                jsonData.optionalpowers?.optionalpower,
                jsonData.bonus?.optionalpowers?.optionalpower
            ].flat().filter(obj => !!obj)
        };

        const powerList = [
            ...IH.getArray(jsonData.powers?.power),
            ...IH.getArray(optionalpowers?.optionalpower)
        ].map(i => i._TEXT);

        const skillList = [
            ...IH.getArray(skills?.skill),
            ...IH.getArray(skills?.group),
        ].map(s => s._TEXT);

        const allPowers = await IH.findItems('Critter_Power', powerList);
        const allSkills = await IH.findItems('Skill', skillList);
        const name = jsonData.name._TEXT;

        return [
            ...this.getMetatypeItems(allSkills, skills?.skill, { type: 'Skill', critter: name }),
            ...this.getMetatypeItems(allSkills, skills?.group, { type: 'Skill Group', critter: name }),
            ...this.getMetatypeItems(allPowers, jsonData.powers?.power, { type: 'Power', critter: name }),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Optional Power', critter: name }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const folderName = game.i18n.localize('TYPES.Actor.sprite');

        return IH.getFolder(compendiumKey, folderName);
    }
}
