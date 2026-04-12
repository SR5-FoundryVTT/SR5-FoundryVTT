type DetectionRangeParameters = Parameters<foundry.canvas.perception.DetectionMode['_testRange']>;

export const resolveDetectionModeRange = (
    visionSource: DetectionRangeParameters[0],
    mode: DetectionRangeParameters[1],
) => {
    const configuredRange = Number(mode?.range);
    if (Number.isFinite(configuredRange) && configuredRange > 0) {
        return configuredRange;
    }

    const sightRange = Number((visionSource?.object as any)?.document?.sight?.range);
    if (Number.isFinite(sightRange) && sightRange > 0) {
        return sightRange;
    }

    return 0;
};