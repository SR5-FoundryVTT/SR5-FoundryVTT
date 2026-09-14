import { SR5Actor } from '@/module/actor/SR5Actor';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import { PerceptionResolver } from '@/module/vision/PerceptionResolver';

export const ASTRAL_PERCEPTION_STATUS = 'sr5astralPerception';
export const ASTRAL_PERCEPTION_VISION_MODE = 'astralPerception';

export interface PreviousTokenVision {
    sight: Record<string, unknown>;
    detectionModes: Record<string, { enabled: boolean; range: number | null }>;
}

export class AstralPerceptionFlow {
    static canPerceive(actor: SR5Actor) {
        return PerceptionResolver.resolve(actor).capabilities.astral.perception;
    }

    static isActive(token: TokenDocument) {
        return !!token.getFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision);
    }

    static async toggle(token: TokenDocument) {
        return this.isActive(token) ? this.disable(token) : this.enable(token);
    }

    static async enable(token: TokenDocument) {
        const actor = token.actor as SR5Actor | null;
        if (!actor || !this.canPerceive(actor)) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotPerceiveAstrally'));
            return false;
        }
        if (this.isActive(token)) return true;

        const source = token.toObject();
        const previous: PreviousTokenVision = {
            sight: foundry.utils.deepClone(source.sight) as Record<string, unknown>,
            detectionModes: foundry.utils.deepClone(source.detectionModes),
        };
        const range = Math.max(token.sight.range ?? 0, 10000);

        await actor.toggleStatusEffect(ASTRAL_PERCEPTION_STATUS, { active: true });
        await token.setFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision, previous);
        await token.update({
            sight: {
                ...source.sight,
                enabled: true,
                range,
                visionMode: ASTRAL_PERCEPTION_VISION_MODE,
            },
            detectionModes: PerceptionFlow.detectionModeUpdate(
                source.detectionModes,
                PerceptionFlow.reconcileAstralDetectionModes(source.detectionModes, range),
            ) as any,
        });
        return true;
    }

    static async disable(token: TokenDocument) {
        const previous = token.getFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision) as PreviousTokenVision | undefined;
        if (!previous) return false;

        await token.update({
            sight: previous.sight,
            detectionModes: PerceptionFlow.detectionModeUpdate(
                token.toObject().detectionModes,
                previous.detectionModes,
            ) as any,
        });
        await token.unsetFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision);
        PerceptionFlow.refreshTokenSource(token);

        const actor = token.actor as SR5Actor | null;
        if (actor && !this.activeTokensFor(actor).length) {
            await actor.toggleStatusEffect(ASTRAL_PERCEPTION_STATUS, { active: false });
        }
        return false;
    }

    private static activeTokensFor(actor: SR5Actor) {
        return game.scenes.reduce<TokenDocument[]>((tokens, scene) => {
            tokens.push(...scene.tokens.filter(token => token.actor === actor && this.isActive(token)));
            return tokens;
        }, []);
    }
}
