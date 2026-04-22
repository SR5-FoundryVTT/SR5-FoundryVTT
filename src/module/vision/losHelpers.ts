import { FLAGS, SYSTEM_NAME } from '../constants';
import { ensureSR5PlaceablePlanes, SR5Plane } from '../environment/placeablePlanes';
import { getSR5TemplateFlags } from '../environment/templateFlags';

type PointLike = {
    x: number;
    y: number;
};

type VisionSourceLike = Parameters<foundry.canvas.perception.DetectionMode['_testLOS']>[0];

type WallLike = {
    document?: {
        id?: string;
        c?: number[];
        flags?: Record<string, unknown>;
    };
};

type PlaceableDocumentLike = {
    getFlag?(scope: string, key: string): unknown;
    flags?: Record<string, unknown>;
};

type PlaneAwarePlaceableLike = {
    document?: PlaceableDocumentLike;
};

type TemplateLike = {
    testPoint?(point: PointLike): boolean;
    document?: {
        flags?: Record<string, unknown>;
        getFlag?(scope: string, key: string): unknown;
    };
};

export type SR5WallSense = 'physical' | 'astral' | 'matrix';
export type SR5TemplateSense = 'lowlight' | 'thermographic' | 'astral' | 'matrix';

export type SR5WallType = 'standard' | 'window' | 'manaBarrier' | 'matrixBarrier';

const getWallType = (wall: WallLike): SR5WallType => {
    const wallFlags = wall.document?.flags ?? {};
    const sr5Flags = (wallFlags[SYSTEM_NAME] as Record<string, unknown> | undefined) ?? {};
    const matrixBlocked = sr5Flags[FLAGS.WallMatrixBlocked] === true;
    if (matrixBlocked) {
        return 'matrixBarrier';
    }

    const wallType = sr5Flags[FLAGS.WallType];
    if (wallType === 'window' || wallType === 'manaBarrier' || wallType === 'matrixBarrier') {
        return wallType;
    }

    return 'standard';
};

const shouldBlockSense = (wallType: SR5WallType, sense: SR5WallSense) => {
    if (sense === 'physical') {
        return wallType === 'standard' || wallType === 'window';
    }

    if (sense === 'matrix') {
        return wallType === 'matrixBarrier';
    }

    return wallType === 'standard' || wallType === 'window' || wallType === 'manaBarrier';
};

const getWallEndpoints = (wall: WallLike): [PointLike, PointLike] | null => {
    const coords = wall.document?.c;
    if (!Array.isArray(coords) || coords.length < 4) {
        return null;
    }

    const [x1, y1, x2, y2] = coords;
    if (![x1, y1, x2, y2].every(value => Number.isFinite(value))) {
        return null;
    }

    return [
        { x: Number(x1), y: Number(y1) },
        { x: Number(x2), y: Number(y2) },
    ];
};

const intersectsWall = (origin: PointLike, destination: PointLike, wall: WallLike) => {
    const endpoints = getWallEndpoints(wall);
    if (!endpoints) {
        return false;
    }

    const [start, end] = endpoints;
    return foundry.utils.lineSegmentIntersects(origin, destination, start, end);
};

const getSR5PlaceablePlanes = (document: PlaceableDocumentLike | undefined) => {
    const rawPlanes = document?.getFlag?.(SYSTEM_NAME, FLAGS.PlaceablePlanes)
        ?? (document?.flags?.[SYSTEM_NAME] as Record<string, unknown> | undefined)?.[FLAGS.PlaceablePlanes];
    return ensureSR5PlaceablePlanes(rawPlanes);
};

export const isSR5PlaceableOnPlane = (
    document: PlaceableDocumentLike | undefined,
    plane: SR5Plane,
) => getSR5PlaceablePlanes(document)[plane];

export const filterSR5PlaceablesByPlane = <T extends PlaneAwarePlaceableLike>(
    placeables: T[],
    plane: SR5Plane,
) => placeables.filter(placeable => isSR5PlaceableOnPlane(placeable.document, plane));

export const getSR5PlaneAwareLights = (
    plane: SR5Plane,
    lights: PlaneAwarePlaceableLike[] = ((canvas?.lighting?.placeables ?? []) as PlaneAwarePlaceableLike[]),
) => filterSR5PlaceablesByPlane(lights, plane);

export const getSR5PlaneAwareTiles = (
    plane: SR5Plane,
    tiles: PlaneAwarePlaceableLike[] = ((canvas?.tiles?.placeables ?? []) as PlaneAwarePlaceableLike[]),
) => filterSR5PlaceablesByPlane(tiles, plane);

export const isBlockedBySR5Walls = (
    origin: PointLike,
    destination: PointLike,
    sense: SR5WallSense,
    plane: SR5Plane,
    walls: WallLike[] = ((canvas?.walls?.placeables ?? []) as WallLike[]),
) => {
    if (!Number.isFinite(origin?.x) || !Number.isFinite(origin?.y) || !Number.isFinite(destination?.x) || !Number.isFinite(destination?.y)) {
        return false;
    }

    const planeAwareWalls = filterSR5PlaceablesByPlane(walls, plane);

    for (const wall of planeAwareWalls) {
        const wallType = getWallType(wall);
        if (!shouldBlockSense(wallType, sense)) {
            continue;
        }

        if (intersectsWall(origin, destination, wall)) {
            return true;
        }
    }

    return false;
};

const shouldBlockByTemplate = (sense: SR5TemplateSense, template: TemplateLike) => {
    const flags = getSR5TemplateFlags(template.document);

    if (sense === 'lowlight') {
        return flags.isVisualSmoke;
    }

    if (sense === 'thermographic') {
        return flags.isThermalSmoke;
    }

    return false;
};

const intersectsTemplate = (origin: PointLike, destination: PointLike, template: TemplateLike) => {
    if (typeof template.testPoint !== 'function') {
        return false;
    }

    const deltaX = destination.x - origin.x;
    const deltaY = destination.y - origin.y;
    const distance = Math.hypot(deltaX, deltaY);
    const sampleCount = Math.max(1, Math.ceil(distance / 20));

    for (let sample = 0; sample <= sampleCount; sample += 1) {
        const ratio = sample / sampleCount;
        const samplePoint = {
            x: origin.x + deltaX * ratio,
            y: origin.y + deltaY * ratio,
        };

        if (template.testPoint(samplePoint)) {
            return true;
        }
    }

    return false;
};

export const isBlockedBySR5Templates = (
    origin: PointLike,
    destination: PointLike,
    sense: SR5TemplateSense,
    templates: TemplateLike[] = ((canvas?.templates?.placeables ?? []) as TemplateLike[]),
) => {
    if (!Number.isFinite(origin?.x) || !Number.isFinite(origin?.y) || !Number.isFinite(destination?.x) || !Number.isFinite(destination?.y)) {
        return false;
    }

    for (const template of templates) {
        if (!shouldBlockByTemplate(sense, template)) {
            continue;
        }

        if (intersectsTemplate(origin, destination, template)) {
            return true;
        }
    }

    return false;
};

export const resolveVisionSourceOrigin = (visionSource: VisionSourceLike): PointLike => {
    const sourceObject = visionSource?.object as {
        center?: {
            x?: number;
            y?: number;
        };
    } | undefined;

    return {
        x: Number(visionSource?.x ?? visionSource?.data?.x ?? sourceObject?.center?.x ?? 0),
        y: Number(visionSource?.y ?? visionSource?.data?.y ?? sourceObject?.center?.y ?? 0),
    };
};
