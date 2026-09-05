import { WorldTimeFlow } from '@/module/flows/WorldTimeFlow';
import { AlchemyRules } from '@/module/rules/AlchemyRules';

export type PreparationPotencyState = 'full' | 'decaying' | 'expired' | 'spent';

export interface PreparationPotencyStatus {
    state: PreparationPotencyState;
    currentPotency: number;
    basePotency: number;
    progressValue: number;
    progressMax: number;
    decayThresholdPercent: number;
    decayStartsAt: number;
    expiresAt: number;
    remainingSeconds: number;
    tooltip: string;
}

/**
 * Build the common lifetime presentation used by preparation sheets and actor lists.
 */
export function preparePreparationPotencyStatus(
    system: Item.SystemOfType<'preparation'>,
    worldTime: number = game.time.worldTime
): PreparationPotencyStatus {
    const basePotency = Math.max(Number(system.potency.base) || 0, 0);
    const createdAt = system.created.worldTime;
    const decayStartsAt = createdAt + AlchemyRules.fullPotencyDuration(basePotency);
    const expiresAt = AlchemyRules.expiresAt(basePotency, createdAt);
    const totalSeconds = Math.max(expiresAt - createdAt, 0);
    const progressMax = Math.max(totalSeconds, 1);
    const remainingSeconds = basePotency > 0 ? Math.max(0, expiresAt - worldTime) : 0;
    const progressValue = Math.min(remainingSeconds, progressMax);
    const decayDuration = Math.max(expiresAt - decayStartsAt, 0);
    const decayThresholdPercent = totalSeconds > 0 ? decayDuration / totalSeconds * 100 : 0;
    const currentPotency = AlchemyRules.currentPotency(basePotency, createdAt, worldTime);

    let state: PreparationPotencyState;
    let tooltip: string;
    if (basePotency <= 0) {
        state = 'spent';
        tooltip = game.i18n.localize('SR5.Preparation.Spent');
    } else if (currentPotency <= 0) {
        state = 'expired';
        tooltip = game.i18n.format('SR5.Preparation.ExpiredAt', { time: WorldTimeFlow.format(expiresAt) });
    } else {
        state = worldTime > decayStartsAt ? 'decaying' : 'full';
        const components = game.time.calendar.difference(expiresAt, worldTime);
        const duration = foundry.data.CalendarData.formatDuration(
            game.time.calendar,
            components,
            { style: 'short', maxTerms: 2 }
        );
        const remaining = game.i18n.format('SR5.Preparation.ExpiresIn', { duration });
        const expiration = game.i18n.format('SR5.Preparation.ExpiresAt', { time: WorldTimeFlow.format(expiresAt) });
        tooltip = `${remaining} — ${expiration}`;
    }

    return {
        state,
        currentPotency,
        basePotency,
        progressValue,
        progressMax,
        decayThresholdPercent,
        decayStartsAt,
        expiresAt,
        remainingSeconds,
        tooltip,
    };
}
