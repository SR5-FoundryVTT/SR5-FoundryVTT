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
        return PerceptionResolver.resolve(actor).astral.perception;
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
        const { sight, detectionModes } = this.astralVision(token, source);

        await actor.toggleStatusEffect(ASTRAL_PERCEPTION_STATUS, { active: true });
        await token.setFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision, this.captureVision(source));
        await token.update({
            sight,
            detectionModes: PerceptionFlow.detectionModeUpdate(source.detectionModes, detectionModes) as any,
        });
        return true;
    }

    static async disable(token: TokenDocument) {
        const previous = token.getFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision) as PreviousTokenVision | undefined;
        if (!previous) return false;

        await this.restoreVision(token, previous, {
            [`flags.${SYSTEM_NAME}.-=${FLAGS.AstralPerceptionVision}`]: null,
        });

        const actor = token.actor as SR5Actor | null;
        if (actor && !this.activeTokensFor(actor).length) {
            await actor.toggleStatusEffect(ASTRAL_PERCEPTION_STATUS, { active: false });
        }
        return false;
    }

    /** Keep the sight and detection modes a token had before switching to astral sight. */
    static captureVision(source: Token.Source): PreviousTokenVision {
        return {
            sight: foundry.utils.deepClone(source.sight) as Record<string, unknown>,
            detectionModes: foundry.utils.deepClone(source.detectionModes),
        };
    }

    /** Sight and detection modes of a token seeing astrally, based on the given token source. */
    static astralVision(token: TokenDocument, source: Token.Source) {
        const range = PerceptionFlow.senseRange(token);
        return {
            sight: { ...source.sight, enabled: true, range, visionMode: ASTRAL_PERCEPTION_VISION_MODE },
            detectionModes: PerceptionFlow.reconcileAstralDetectionModes(source.detectionModes, range),
        };
    }

    /**
     * Put back the vision captured by captureVision and reconcile automatic senses.
     *
     * @param changes Further token changes to apply in the same update.
     */
    static async restoreVision(token: TokenDocument, previous: PreviousTokenVision, changes: Record<string, unknown> = {}) {
        await token.update({
            sight: previous.sight,
            detectionModes: PerceptionFlow.detectionModeUpdate(
                token.toObject().detectionModes,
                previous.detectionModes,
            ) as any,
            ...changes,
        });
        PerceptionFlow.refreshTokenSource(token);
    }

    private static activeTokensFor(actor: SR5Actor) {
        return game.scenes.contents.flatMap(scene =>
            scene.tokens.filter(token => token.actor === actor && this.isActive(token)));
    }
}
