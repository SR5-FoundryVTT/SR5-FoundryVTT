import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../ActorSchema";
import { ImportOptionsType } from "../characterImporter/CharacterImporter";
import { ActorSkillImport } from "../ActorSkillImport";
import { ActorImportUtil, type BlankImportedActor } from "../ActorImportUtil";
import {
    DEFAULT_LEVEL_APPLIES,
    PRESET_SPRITE_PROFILES,
    SPRITE_MATRIX_ATTRIBUTE_IDS,
    humanizePresetTypeKey,
    normalizeSpriteTypeForPreset,
} from "@/module/data/SpiritSpritePresetProfiles";

export type BlankSprite = BlankImportedActor<'sprite'>;

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class SpriteImporter {
    private static inferLevel(chummerData: ActorSchema, sprite: BlankSprite): number {
        const intTotal = ActorImportUtil.getChummerAttributeTotal(chummerData, 'int');
        const sleazeBase = Number(sprite.system.matrix.sleaze.base) || 0;
        const level = sprite.system.level_applies.sleaze ? (intTotal ?? 0) - sleazeBase : (intTotal ?? 0);

        return Math.max(0, level);
    }

    private static setRuntimeValues(sprite: BlankSprite, chummerData: ActorSchema) {
        sprite.system.level = this.inferLevel(chummerData, sprite);
        sprite.system.attributes.edge.base = ActorImportUtil.getChummerAttributeTotal(chummerData, 'edg') ?? 0;
    }

    private static async importFromSeed(
        chummerData: ActorSchema,
        importOptions: ImportOptionsType,
        applySeed: (sprite: BlankSprite) => void,
    ): Promise<SR5Actor<'sprite'> | null> {
        const sprite = await ActorImportUtil.createBaseActor('sprite', chummerData, importOptions);
        applySeed(sprite);

        await ActorSkillImport.importSkills(sprite, chummerData);
        this.setRuntimeValues(sprite, chummerData);

        return ActorImportUtil.sanitizeAndCreateActor(sprite, CONFIG.Actor.dataModels.sprite.schema, chummerData);
    }

    static async findSpriteByGuid(metatypeGuid: string) {
        return ActorImportUtil.findActorTemplateByGuid(metatypeGuid, 'sprite');
    }

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     */
    static async import(
        chummerData: ActorSchema,
        spriteTemplate: Actor.Stored<'sprite'>,
        importOptions: ImportOptionsType
    ): Promise<SR5Actor<'sprite'> | null> {
        return this.importFromSeed(chummerData, importOptions, (sprite) => {
            sprite.system.spriteType = spriteTemplate.system.spriteType;
            sprite.system.skillset = spriteTemplate.system.skillset;
            sprite.system.level_applies = foundry.utils.deepClone(spriteTemplate.system.level_applies);
            sprite.system.attributes.resonance.base = Number(spriteTemplate.system.attributes.resonance.base) || 0;
            sprite.system.matrix.attack.base = Number(spriteTemplate.system.matrix.attack.base) || 0;
            sprite.system.matrix.sleaze.base = Number(spriteTemplate.system.matrix.sleaze.base) || 0;
            sprite.system.matrix.data_processing.base = Number(spriteTemplate.system.matrix.data_processing.base) || 0;
            sprite.system.matrix.firewall.base = Number(spriteTemplate.system.matrix.firewall.base) || 0;
        });
    }

    static async importFromPresetProfile(
        chummerData: ActorSchema,
        importOptions: ImportOptionsType,
    ): Promise<SR5Actor<'sprite'> | null> {
        const spriteTypeKey = normalizeSpriteTypeForPreset(chummerData.metatype_english ?? '');
        const profile = PRESET_SPRITE_PROFILES[spriteTypeKey];
        if (!profile)
            return null;

        return this.importFromSeed(chummerData, importOptions, (sprite) => {
            sprite.system.spriteType = humanizePresetTypeKey(spriteTypeKey);
            sprite.system.level_applies = ActorImportUtil.buildToggleMap(DEFAULT_LEVEL_APPLIES, profile.levelOff);
            sprite.system.attributes.resonance.base = profile.offsets?.resonance ?? 0;

            for (const attributeId of SPRITE_MATRIX_ATTRIBUTE_IDS)
                sprite.system.matrix[attributeId].base = profile.offsets?.[attributeId] ?? 0;

            sprite.system.modifiers.matrix_initiative += profile.init ?? 0;
        });
    }
}

