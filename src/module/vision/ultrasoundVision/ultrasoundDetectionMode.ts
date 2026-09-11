import { hasPhysicalPresence } from '@/module/vision/physicalVision/physicalDetectionMode';

export const ULTRASOUND_RANGE_METERS = 50;

export default class UltrasoundDetectionMode extends foundry.canvas.perception.DetectionMode {
    override _canDetect(
        ...[, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        return hasPhysicalPresence(target);
    }

    override _testLOS(
        ...[visionSource, , , test]: Parameters<foundry.canvas.perception.DetectionMode['_testLOS']>
    ) {
        return !UltrasoundDetectionMode._testCollision(visionSource, test, {
            ...visionSource.los?.config,
            type: 'move',
            angle: 360,
        });
    }
}
