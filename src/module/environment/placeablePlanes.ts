import { FLAGS } from '../constants';

export type SR5Plane = 'physical' | 'astral' | 'matrix';

export type SR5PlaceablePlanes = Record<SR5Plane, boolean>;

export const SR5_DEFAULT_PLACEABLE_PLANES: SR5PlaceablePlanes = {
    physical: true,
    astral: true,
    matrix: false,
};

const coercePlane = (value: unknown, fallback: boolean): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }

    return fallback;
};

export const ensureSR5PlaceablePlanes = (value: unknown): SR5PlaceablePlanes => {
    const source = (value ?? {}) as Record<string, unknown>;

    return {
        physical: coercePlane(source[FLAGS.PlanePhysical], SR5_DEFAULT_PLACEABLE_PLANES.physical),
        astral: coercePlane(source[FLAGS.PlaneAstral], SR5_DEFAULT_PLACEABLE_PLANES.astral),
        matrix: coercePlane(source[FLAGS.PlaneMatrix], SR5_DEFAULT_PLACEABLE_PLANES.matrix),
    };
};

export const areSR5PlaceablePlanesEqual = (left: SR5PlaceablePlanes, right: SR5PlaceablePlanes) => {
    return left.physical === right.physical
        && left.astral === right.astral
        && left.matrix === right.matrix;
};