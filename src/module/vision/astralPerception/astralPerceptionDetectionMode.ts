import { AstralRegionFlow } from '../astralRegions/AstralRegionFlow';
import { isAstralVisionSource } from '../physicalVision/physicalDetectionMode';
import { AstralAuraFilter } from './astralAuraFilter';
import { getAstralTier } from './astralSignature';

/**
 * Astral perception sees everything that has a place on the astral plane: auras and astral forms, and non-living
 * things as grey shadows (SR5#312). Invisibility spells leave the aura visible, so they aren't checked.
 */
export default class AstralPerceptionDetectionMode extends foundry.canvas.perception.DetectionMode {
    /**
     * Marks a token as detected astrally. SR5Token swaps it for the filter of the token's own astral tier, see
     * SenseFilterResolver.
     */
    static override getDetectionFilter() {
        return AstralAuraFilter.forSignature('aura');
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        return isAstralVisionSource(visionSource) && getAstralTier(target) !== null;
    }

    override _testPoint(...args: Parameters<foundry.canvas.perception.DetectionMode['_testPoint']>) {
        if (!super._testPoint(...args)) return false;
        const [visionSource, , target, test] = args;
        return !AstralRegionFlow.blocksDetection(visionSource, target, test);
    }
}
