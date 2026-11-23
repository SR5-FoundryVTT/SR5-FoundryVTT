import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import type { PreviousTokenVision } from '@/module/vision/astralPerception/AstralPerceptionFlow';

interface ProjectionRestorationState extends PreviousTokenVision {
    initiativeMode: string;
    resumeAstralPerception: boolean;
}

export interface AstralProjectionBodyState {
    role: 'body';
    formTokenId: string;
    /** World actor of a linked body, which keeps projecting even if the token is pointed at another actor. */
    linkedActorId?: string;
    previous: ProjectionRestorationState;
}

export interface AstralProjectionFormState {
    role: 'form';
    bodyTokenId: string;
    previousInitiativeMode: string;
}

export type AstralProjectionState = AstralProjectionBodyState | AstralProjectionFormState;

type MaybeToken = TokenDocument | null | undefined;

/**
 * Read a token's projection state from its flags alone.
 *
 * Only token metadata is read, so this is safe while a token's synthetic actor is still being
 * materialized. It imports nothing but constants, so actor and token code can use it without cycles.
 */
export const getProjectionState = (token: MaybeToken): AstralProjectionState | undefined => {
    const state = token?.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as AstralProjectionState | undefined;
    return state?.role === 'body' || state?.role === 'form' ? state : undefined;
};

export const isAstralForm = (token: MaybeToken) => getProjectionState(token)?.role === 'form';

/** The body a form projects from, or the token itself when it isn't a form. Null for a form whose body is gone. */
export const getProjectionBody = (token: MaybeToken): TokenDocument | null => {
    const state = getProjectionState(token);
    if (state?.role !== 'form') return token ?? null;
    return token?.parent?.tokens.get(state.bodyTokenId) ?? null;
};

/** The form of a projecting body, if it still exists. Body and form always share a scene. */
export const getProjectionForm = (token: MaybeToken): TokenDocument | null => {
    const state = getProjectionState(token);
    if (state?.role !== 'body') return null;
    return token?.parent?.tokens.get(state.formTokenId) ?? null;
};
