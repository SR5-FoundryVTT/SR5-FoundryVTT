/** Vision mode of a perceiving body: the astral plane overlaid on the physical one (SR5#312). */
export const ASTRAL_PERCEPTION_VISION_MODE = 'astralPerception';

/** Vision mode of a projected form, which sees only the astral plane (SR5#313). */
export const ASTRAL_PROJECTION_VISION_MODE = 'astralProjection';

/** Whether a vision mode senses the astral plane. */
export const isAstralVisionMode = (mode: string | null | undefined) =>
    mode === ASTRAL_PERCEPTION_VISION_MODE || mode === ASTRAL_PROJECTION_VISION_MODE;
