import type { SR5ActiveEffect } from './SR5ActiveEffect';

export type EffectDurationStatusState = 'permanent' | 'active' | 'pending' | 'expired' | 'restart-pending';

export type EffectDurationStatus = {
    state: EffectDurationStatusState;
    label: string;
    detail: string;
    summary: string;
    icon: string;
    showRestart: boolean;
};

type EffectDurationStatusOptions = {
    restartPending?: boolean;
};

/**
 * Build the common, state-aware duration presentation used by effect configuration and document sheets.
 */
export function prepareEffectDurationStatus(
    effect: SR5ActiveEffect,
    { restartPending = false }: EffectDurationStatusOptions = {},
): EffectDurationStatus {
    const rawDuration = effect.toObject().duration;
    const hasFiniteDuration = rawDuration.value !== null && rawDuration.value !== undefined
        && Number.isFinite(Number(rawDuration.value));
    const base = {
        detail: '',
        showRestart: false,
    };

    if (!hasFiniteDuration) {
        const label = game.i18n.localize('SR5.ActiveEffect.Duration.DoesNotExpire');
        return {
            ...base,
            state: 'permanent',
            label,
            summary: label,
            icon: 'fa-solid fa-infinity',
        };
    }

    if (restartPending) {
        const label = game.i18n.localize('SR5.ActiveEffect.Duration.RestartPending');
        return {
            ...base,
            state: 'restart-pending',
            label,
            summary: label,
            detail: game.i18n.localize('SR5.ActiveEffect.Duration.RestartPendingDetail'),
            icon: 'fa-solid fa-rotate-right',
        };
    }

    if (rawDuration.expired) {
        const label = game.i18n.localize('SR5.ActiveEffect.Duration.Expired');
        return {
            ...base,
            state: 'expired',
            label,
            summary: label,
            detail: game.i18n.localize('SR5.ActiveEffect.Duration.ExpiredDetail'),
            icon: 'fa-solid fa-hourglass-end',
            showRestart: true,
        };
    }

    const remaining = effect.duration.remaining;
    if (typeof remaining === 'number' && Number.isFinite(remaining) && remaining <= 0) {
        const label = game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingBoundary');
        return {
            ...base,
            state: 'pending',
            label,
            summary: label,
            detail: game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingBoundaryDetail'),
            icon: 'fa-solid fa-hourglass-half',
        };
    }

    // Relabel Foundry rounds as Shadowrun Combat Turns.
    const remainingLabel = rawDuration.units === 'rounds'
        ? combatTurnLabel(effect.duration.remaining)
        : (effect.duration.label ?? '');
    return {
        ...base,
        state: 'active',
        label: game.i18n.localize('SR5.ActiveEffect.Duration.Active'),
        summary: remainingLabel || game.i18n.localize('SR5.ActiveEffect.Duration.Active'),
        detail: remainingLabel
            ? game.i18n.format('SR5.ActiveEffect.Duration.RemainingDetail', { remaining: remainingLabel })
            : game.i18n.localize('SR5.ActiveEffect.Duration.ActiveDetail'),
        icon: 'fa-solid fa-hourglass-start',
    };
}

/** Shadowrun-flavoured remaining label for combat durations (Foundry "rounds" = SR Combat Turns). */
function combatTurnLabel(remaining: number | null | undefined): string {
    const turns = (typeof remaining === 'number' && Number.isFinite(remaining)) ? Math.max(0, Math.ceil(remaining)) : 0;
    const key = turns === 1 ? 'SR5.ActiveEffect.Duration.CombatTurn' : 'SR5.ActiveEffect.Duration.CombatTurns';
    return game.i18n.format(key, { turns });
}
