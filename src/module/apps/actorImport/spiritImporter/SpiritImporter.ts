import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../ActorSchema";
import { ImportOptionsType } from "../characterImporter/CharacterImporter";
import { MugshotImport } from "../MugshotImport";
import { ActorSkillImport } from "../ActorSkillImport";
import { ActorImportUtil, type BlankImportedActor } from "../ActorImportUtil";
import {
    PRESET_INITIATIVE_DEFAULTS,
    PRESET_SPIRIT_PROFILES,
    SPIRIT_ATTRIBUTE_IDS,
    type SpiritProfileInitiative,
    normalizeSpiritTypeForPreset,
} from "@/module/data/SpiritSpritePresetProfiles";

export type BlankSpirit = BlankImportedActor<'spirit'>;

export class SpiritImporter {

    private static applyProfileInitiativeFormulae(
        spirit: BlankSpirit,
        initiative: Partial<SpiritProfileInitiative> | undefined,
    ) {
        const { meatspace, astral } = spirit.system.initiative;
        const profile: SpiritProfileInitiative = { ...PRESET_INITIATIVE_DEFAULTS, ...initiative };

        meatspace.constant.base = profile.init;
        meatspace.dice.base = profile.init_dice;
        meatspace.attribute_a = profile.init_mult >= 2 ? 'force' : '';
        meatspace.attribute_b = profile.init_mult >= 1 ? 'force' : '';

        astral.constant.base = profile.astral_init;
        astral.dice.base = profile.astral_init_dice;
        astral.attribute_a = profile.astral_init_mult >= 2 ? 'force' : '';
        astral.attribute_b = profile.astral_init_mult >= 1 ? 'force' : '';
    }

    private static setRuntimeValues(spirit: BlankSpirit, chummerData: ActorSchema) {
        spirit.system.attributes.edge.base = ActorImportUtil.getChummerAttributeTotal(chummerData, 'edg') ?? 0;
        spirit.system.attributes.force.base = ActorImportUtil.getChummerAttributeTotal(chummerData, 'mag') ?? 1;
    }

    private static async importFromSeed(
        chummerData: ActorSchema,
        importOptions: ImportOptionsType,
        applySeed: (spirit: BlankSpirit) => void,
    ): Promise<SR5Actor<'spirit'> | null> {
        const spirit = await ActorImportUtil.createBaseActor('spirit', chummerData, importOptions);
        applySeed(spirit);

        if (importOptions.mugshots) {
            const mugshotPaths = await MugshotImport.importImages(chummerData, spirit.name);
            if (mugshotPaths.length > 0)
                spirit.img = mugshotPaths[0];
        }

        await ActorSkillImport.importSkills(spirit, chummerData);
        this.setRuntimeValues(spirit, chummerData);

        return ActorImportUtil.sanitizeAndCreateActor(spirit, CONFIG.Actor.dataModels.spirit.schema, chummerData);
    }

    static async findSpiritByGuid(metatypeGuid: string) {
        return ActorImportUtil.findActorTemplateByGuid(metatypeGuid, 'spirit');
    }

    static async import(
        chummerData: ActorSchema,
        spiritTemplate: Actor.Stored<'spirit'>,
        importOptions: ImportOptionsType,
    ): Promise<SR5Actor<'spirit'> | null> {
        return this.importFromSeed(chummerData, importOptions, (spirit) => {
            for (const attributeId of Object.keys(spiritTemplate.system.attributes)) {
                spirit.system.attributes[attributeId].base = spiritTemplate.system.attributes[attributeId].base;
                spirit.system.attributes[attributeId].applies_special = !!spiritTemplate.system.attributes[attributeId].applies_special;
            }

            spirit.system.skillset = spiritTemplate.system.skillset;
            spirit.system.spiritType = spiritTemplate.system.spiritType;
            spirit.system.half_value_skill = spiritTemplate.system.half_value_skill;
            spirit.system.initiative = foundry.utils.deepClone(spiritTemplate.system.initiative);
        });
    }

    static async importFromPresetProfile(
        chummerData: ActorSchema,
        importOptions: ImportOptionsType,
    ): Promise<SR5Actor<'spirit'> | null> {
        const spiritTypeKey = normalizeSpiritTypeForPreset(chummerData.metatype_english ?? '');
        const profile = PRESET_SPIRIT_PROFILES[spiritTypeKey];
        if (!profile)
            return null;

        return this.importFromSeed(chummerData, importOptions, (spirit) => {
            spirit.system.spiritType = spiritTypeKey;
            const forceOff = new Set(profile.forceOff ?? []);

            const offsets = profile.attributes ?? {};
            for (const attributeId of SPIRIT_ATTRIBUTE_IDS) {
                spirit.system.attributes[attributeId].applies_special = !forceOff.has(attributeId);
                if (!spirit.system.attributes[attributeId].applies_special) continue;
                spirit.system.attributes[attributeId].base = offsets[attributeId] ?? 0;
            }

            spirit.system.half_value_skill = profile.halfValueSkill ?? false;
            this.applyProfileInitiativeFormulae(spirit, profile.initiative);
        });
    }
}
