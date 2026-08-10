export interface BlastTemplateData {
    radius: number
    dropoff: number
    damageValue?: number
    damageType?: string
}

export type BlastCircleLayout = {
    distance: number
    radius: number
};

export const getBlastCircleLayout = (
    blast: BlastTemplateData,
    distancePixels: number,
): BlastCircleLayout[] => {
    const dropoff = Math.abs(blast.dropoff);
    const damageValue = blast.damageValue ?? 0;
    if (dropoff === 0 || damageValue <= 0 || blast.radius <= 0) return [];

    const effectiveRadius = Math.min(blast.radius, Math.floor(damageValue / dropoff));
    return Array.from({ length: effectiveRadius }, (_, index) => {
        const distance = index + 1;
        const radius = distance * distancePixels;
        return {
            distance,
            radius,
        };
    });
};

export const getBlastDamageAtDistance = (blast: BlastTemplateData, distance: number): number | undefined => {
    const dropoff = Math.abs(blast.dropoff);
    const damageValue = blast.damageValue ?? 0;
    if (dropoff === 0 || damageValue <= 0 || distance < 0 || distance > blast.radius) return undefined;

    const damage = damageValue - (Math.floor(distance) * dropoff);
    return damage > 0 ? damage : undefined;
};
