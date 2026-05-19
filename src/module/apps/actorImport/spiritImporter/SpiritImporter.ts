import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../ActorSchema";
import { ImportOptionsType } from "../characterImporter/CharacterImporter";
import { ActorSkillImport } from "../ActorSkillImport";
import { ActorImportUtil, type BlankImportedActor } from "../ActorImportUtil";
import {
    PRESET_INITIATIVE_DEFAULTS,
    PRESET_SPIRIT_PROFILES,
    SPIRIT_ATTRIBUTE_IDS,
    type SpiritProfileInitiative,
    humanizePresetTypeKey,
    normalizeSpiritTypeForPreset,
} from "@/module/data/SpiritSpritePresetProfiles";

export type BlankSpirit = BlankImportedActor<'spirit'>;

export class SpiritImporter {
    private static initFormulaBuild(multiplier: number, constant: number, dice: number) {
        return {
            attribute_a: multiplier >= 2 ? 'force' : '',
            attribute_b: multiplier >= 1 ? 'force' : '',
            constant,
            dice
        } as const;
    }

    private static applyProfileInitiativeFormulae(
        spirit: BlankSpirit,
        initiative: Partial<SpiritProfileInitiative> | undefined,
    ) {
        const profile: SpiritProfileInitiative = { ...PRESET_INITIATIVE_DEFAULTS, ...initiative };

        spirit.system.initiative.meatspace.formula = this.initFormulaBuild(profile.init_mult, profile.init, profile.init_dice);
        spirit.system.initiative.astral.formula = this.initFormulaBuild(profile.astral_init_mult, profile.astral_init, profile.astral_init_dice);
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
            spirit.system.initiative.astral.formula = foundry.utils.deepClone(spiritTemplate.system.initiative.astral.formula);
            spirit.system.initiative.meatspace.formula = foundry.utils.deepClone(spiritTemplate.system.initiative.meatspace.formula);
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
            spirit.system.spiritType = humanizePresetTypeKey(spiritTypeKey);
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
