import type { SR5Item } from '../item/SR5Item';

export type ScatterDirection = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ScatterRollResult {
    direction: ScatterDirection
    rolledDistance: number
    hits: number
    distance: number
}

export interface ScatterOffset {
    x: number
    y: number
}

/** 
 * Resolve an SR5 Scatter Diagram result and reduce its distance by test hits. 
 * 
 */
export function resolveScatterRoll(direction: number, rolledDistance: number, hits = 0): ScatterRollResult | undefined {
    if (!Number.isInteger(direction) || direction < 2 || direction > 12) return;
    if (!Number.isInteger(rolledDistance) || rolledDistance < 1) return;
    if (!Number.isInteger(hits) || hits < 0) return;

    return {
        direction: direction as ScatterDirection,
        rolledDistance,
        hits,
        distance: Math.max(rolledDistance - hits, 0),
    };
}

/**
 * Scatter diagram bearings (SR5#182) in degrees, measured clockwise from the throwing
 * direction itself (i.e. 0 means straight along the throw, not canvas north).
 */
const SCATTER_DIRECTION_BEARINGS: Record<ScatterDirection, number> = {
    2: 180,
    3: 225,
    4: 270,
    5: 300,
    6: 330,
    7: 0,
    8: 30,
    9: 60,
    10: 90,
    11: 135,
    12: 180,
};

/** All scatter directions of the 2d6 scatter diagram, in diagram order. */
export const SCATTER_DIRECTIONS: ScatterDirection[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Canvas angle (radians) a given scatter direction points towards, rotated on top of the
 * launch direction the same way a rolled scatter result would be.
 */
export function getScatterDirectionAngle(direction: ScatterDirection, launchAngle = -Math.PI / 2): number {
    const bearing = SCATTER_DIRECTION_BEARINGS[direction];
    return launchAngle + ((bearing * Math.PI) / 180);
}

/**
 * Convert a scatter result to canvas pixels around the original launch direction. 
 */
export function getScatterOffset(
    result: ScatterRollResult,
    distancePixels: number,
    launchAngle = -Math.PI / 2,
): ScatterOffset {
    const angle = getScatterDirectionAngle(result.direction, launchAngle);
    const distance = result.distance * distancePixels;

    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
    };
}

/**
 * Launch direction (radians) from a source token towards the template origin, matching the
 * angle scatter offsets are rotated around. Defaults to canvas north when no source is known.
 */
export function getScatterLaunchAngle(origin: ScatterOffset, sourceCenter?: ScatterOffset): number {
    if (!sourceCenter) return -Math.PI / 2;

    return Math.atan2(origin.y - sourceCenter.y, origin.x - sourceCenter.x);
}

/**
 * These scatter kinds have different kind of behavior across different rules.
 */
export type ScatterKind = 'grenade_standard' |  'grenade_aerodynamic' | 'grenade_launcher' | 'missile_launcher' | 'rocket_launcher' | 'spell';

/**
 * Determine the scatter kind (if any) for an item, according to SR5#182.
 * A grenade thrown by hand or an indirect combat spell can scatter on a failed test.
 */
export function getItemScatterKind(item: SR5Item | undefined): ScatterKind | undefined {
    if (item?.isGrenade()) return item.system.thrown.thrown_type as ScatterKind;
    if (item?.isCombatSpell() && item.system.combat.type === 'indirect') return 'spell';

    return undefined;
}

export const ScatterRules = {
    /**
     * Scatter dice according to SR5#182 'Determine Scatter'.
     * Will result in dice throws between 2 and 12, matching to scatter direction on canvas.
     */
    scatterDiceFormula: () => '2d6',

    /**
     * Distance dice according to SR5#182 'Scatter Table'.
     * Result is distance in meters.
     */
    distanceDiceFormula: (kind: ScatterKind) => {
        switch (kind) {
            case 'grenade_standard':
                return '1d6';
            case 'grenade_aerodynamic':
                return '2d6';
            case 'grenade_launcher':
                return '3d6';
            case 'rocket_launcher':
                return '4d6';
            case 'missile_launcher':
                return '5d6';
            // TODO: tamif/2005 check spell distance formula page reference
            case 'spell':
                return '2d6';
        }
    }
}
