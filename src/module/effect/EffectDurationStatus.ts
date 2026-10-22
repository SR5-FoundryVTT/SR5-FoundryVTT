import type { SR5ActiveEffect } from './SR5ActiveEffect';
import { unitToSeconds } from '../utils/timeUnits';

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
        // The combat-turn span is spent; the effect now waits for its trigger event.
        const { label, detail } = pendingTriggerText(rawDuration.expiry ?? null);

        return {
            ...base,
            state: 'pending',
            label,
            summary: label,
            detail,
            icon: 'fa-solid fa-hourglass-half',
        };
    }

    // Relabel Foundry rounds as Shadowrun Combat Turns.
    const remainingLabel = rawDuration.units === 'rounds'
        ? combatTurnLabel(effect)
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

/** Pending-state label + detail describing the trigger event an effect is waiting on. */
function pendingTriggerText(expiry: string | null): { label: string; detail: string } {
    const key = expiry ?? '';
    const labels: Record<string, { label: string; detail: string }> = {
        combatStart:      { label: 'SR5.ActiveEffect.Duration.AwaitingCombatStart',     detail: 'SR5.ActiveEffect.Duration.AwaitingCombatStartDetail' },
        combatEnd:        { label: 'SR5.ActiveEffect.Duration.AwaitingCombatEnd',       detail: 'SR5.ActiveEffect.Duration.AwaitingCombatEndDetail' },
        roundStart:       { label: 'SR5.ActiveEffect.Duration.AwaitingTurnStart',       detail: 'SR5.ActiveEffect.Duration.AwaitingTurnStartDetail' },
        roundEnd:         { label: 'SR5.ActiveEffect.Duration.AwaitingTurnEnd',         detail: 'SR5.ActiveEffect.Duration.AwaitingTurnEndDetail' },
        sr5MyActionStart: { label: 'SR5.ActiveEffect.Duration.AwaitingMyActionStart',   detail: 'SR5.ActiveEffect.Duration.AwaitingMyActionStartDetail' },
        sr5MyActionEnd:   { label: 'SR5.ActiveEffect.Duration.AwaitingMyActionEnd',     detail: 'SR5.ActiveEffect.Duration.AwaitingMyActionEndDetail' },
    };
    const entry = labels[key];
    if (entry) {
        return {
            label: game.i18n.localize(entry.label),
            detail: game.i18n.localize(entry.detail),
        };
    }
    return {
        label: game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTrigger'),
        detail: game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTriggerDetail'),
    };
}

/**
 * Shadowrun-flavoured remaining label for a rounds-based effect (Foundry "rounds" = SR Combat Turns).
 * Without a combat tracking its owner, Foundry prepares the duration as seconds, so convert those back.
 */
function combatTurnLabel(effect: SR5ActiveEffect): string {
    const { units, remaining, secondsRemaining } = effect.duration;
    const turnsLeft = units === 'seconds' && typeof secondsRemaining === 'number'
        ? secondsRemaining / unitToSeconds('rounds')
        : remaining;
    const turns = (typeof turnsLeft === 'number' && Number.isFinite(turnsLeft)) ? Math.max(0, Math.ceil(turnsLeft)) : 0;
    const key = turns === 1 ? 'SR5.ActiveEffect.Duration.CombatTurn' : 'SR5.ActiveEffect.Duration.CombatTurns';
    return game.i18n.format(key, { turns });
}
