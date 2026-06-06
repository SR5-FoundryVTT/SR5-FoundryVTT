import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { normalizeSpriteTypeForPreset } from "@/module/data/SpiritSpritePresetProfiles";

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

        system.spriteType = normalizeSpriteTypeForPreset(jsonData.name._TEXT);
        this.applyLevelOffsetAttributes(system, jsonData);
        this.parseInitiative(system, jsonData, { mode: 'matrix', specialAttr: 'level' });

        return system;
    }

    private applyLevelOffsetAttributes(system: ReturnType<typeof this.getBaseSystem>, jsonData: Metatype) {
        for (const [attributeId, metatypeAttributeId] of Object.entries(LEVEL_OFFSET_ATTRIBUTE_MAP)) {
            const value = jsonData[metatypeAttributeId]._TEXT;
            const parsed = this.parseSpecialOffset(value);

            if (attributeId === 'resonance')
                system.attributes.resonance.applies_special = parsed.appliesSpecial;
            else
                system.matrix[attributeId].applies_special = parsed.appliesSpecial;

            if (attributeId === 'resonance')
                system.attributes.resonance.base = parsed.base;
            else
                system.matrix[attributeId].base = parsed.base;
        }
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const { skills, name, powers } = jsonData;
        const optionalPowers = this.mergeLists(
            jsonData.optionalpowers?.optionalpower,
            jsonData.bonus?.optionalpowers?.optionalpower
        );

        const powerList = this.getNamedList(powers?.power, optionalPowers);
        const skillList = this.getNamedList(skills?.skill, skills?.group);

        const allSkills = await IH.findItems('Skill', skillList);
        const allPowers = await IH.findItems('Critter_Power', powerList);

        const spriteName = name._TEXT;
        return [
            ...this.getMetatypeItems(allSkills, skills?.skill, { type: 'Skill', critter: spriteName }),
            ...this.getMetatypeItems(allPowers, powers?.power, { type: 'Power', critter: spriteName }),
            ...this.getMetatypeItems(allSkills, skills?.group, { type: 'Skill Group', critter: spriteName }),
            ...this.getMetatypeItems(allPowers, optionalPowers, { type: 'Optional Power', critter: spriteName }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const folderName = game.i18n.localize('TYPES.Actor.sprite');

        return IH.getFolder(compendiumKey, folderName);
    }
}
