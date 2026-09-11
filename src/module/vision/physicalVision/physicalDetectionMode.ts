type DetectionTarget = Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[1];

export const getPhysicalTargetActor = (target: DetectionTarget) => {
    const document = (target as { document?: { actor?: Actor.Implementation | null } } | null)?.document;
    return document?.actor ?? null;
};

export const hasPhysicalPresence = (target: DetectionTarget) => {
    const actor = getPhysicalTargetActor(target);
    return !actor || actor.system.visibilityChecks.targets.physical.active !== false;
};

export const isInvisiblePhysicalTarget = (target: DetectionTarget) => {
    return getPhysicalTargetActor(target)?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE) ?? false;
};

export const isAstralVisionSource = (
    visionSource: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[0],
) => visionSource?.visionMode?.id === 'astralPerception';

export class PhysicalSightDetectionMode extends foundry.canvas.perception.DetectionMode {
    override _canDetect(...args: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>) {
        return !isAstralVisionSource(args[0])
            && hasPhysicalPresence(args[1])
            && !isInvisiblePhysicalTarget(args[1])
            && super._canDetect(...args);
    }
}

export class PhysicalLightPerceptionDetectionMode extends PhysicalSightDetectionMode {
    override _testPoint(
        ...args: Parameters<foundry.canvas.perception.DetectionMode['_testPoint']>
    ) {
        return super._testPoint(...args) && canvas.effects.testInsideLight(args[3].point);
    }
}
