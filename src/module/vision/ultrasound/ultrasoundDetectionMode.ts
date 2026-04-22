import { resolveDetectionModeRange } from '../detectionRange';
import { isBlockedBySR5Walls, resolveVisionSourceOrigin } from '../losHelpers';
import { isVisionSourceMode } from '../visionModeState';
import UltrasoundVisionFilter from './ultrasoundFilter';

export default class UltrasoundDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= UltrasoundVisionFilter.create());
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        if (!tgt || !tgt.actor) {
            return false;
        }

        const isAstralPerceiving = isVisionSourceMode(visionSource, 'astralPerception');
        if (isAstralPerceiving) {
            return false;
        }

        const sourceDocument = (visionSource?.object as { document?: { hasStatusEffect?: (statusId: string) => boolean } } | undefined)?.document;
        const sourceSilenced = sourceDocument?.hasStatusEffect?.('silenced') ?? false;
        const targetSilenced = tgt.hasStatusEffect?.('silenced') ?? false;
        return !sourceSilenced && !targetSilenced;
    }

    override _testRange(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testRange']>
    ) {
        const range = resolveDetectionModeRange(visionSource, mode);
        return super._testRange(visionSource, { ...mode, range }, target, test);
    }

    override _testLOS(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testLOS']>
    ) {
        const origin = resolveVisionSourceOrigin(visionSource);

        if (isBlockedBySR5Walls(origin, test.point, 'ultrasound')) {
            return false;
        }

        return this._testAngle(visionSource, mode, target, test);
    }
}
