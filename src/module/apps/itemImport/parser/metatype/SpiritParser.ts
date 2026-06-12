import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { normalizeSpiritTypeForPreset } from "@/module/data/SpiritSpritePresetProfiles";

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

        if (category === "Ritual") {
            system.attributes.edge.base = Number(jsonData.edgmin?._TEXT) || 0;
        }
        system.spiritType = normalizeSpiritTypeForPreset(name);

        system.half_value_skill = jsonData.skills?.skill?.some(s => s.$.rating === "F/2") ?? false;
        this.applyForceOffsetAttributes(system, jsonData);
        this.applyMovement(system, jsonData);
        this.parseInitiative(system, jsonData, { mode: 'meatspace', specialAttr: 'force' });

        return system;
    }

    private applyForceOffsetAttributes(system: ReturnType<typeof this.getBaseSystem>, jsonData: Metatype) {
        for (const [attributeId, metatypeAttributeId] of Object.entries(FORCE_OFFSET_ATTRIBUTE_MAP)) {
            const value = jsonData[metatypeAttributeId]._TEXT;
            const parsed = this.parseSpecialOffset(value);

            system.attributes[attributeId].applies_special = parsed.appliesSpecial;
            system.attributes[attributeId].base = parsed.base;
        }
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
        const naturalWeapons = this.getNaturalWeapons(
            this.mergeLists(powers?.power, optionalPowers), { actorName: spiritName }
        );

        return [
            ...naturalWeapons,
            ...this.getMetatypeItems(allSkills, skills?.skill, { type: 'Skill', critter: spiritName }),
            ...this.getMetatypeItems(allPowers, powers?.power, { type: 'Power', critter: spiritName }),
            ...this.getMetatypeItems(allQualities, qualities, { type: 'Quality', critter: spiritName }),
            ...this.getMetatypeItems(allSkills, skills?.group, { type: 'Skill Group', critter: spiritName }),
            ...this.getMetatypeItems(allPowers, optionalPowers, { type: 'Optional Power', critter: spiritName }),
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
