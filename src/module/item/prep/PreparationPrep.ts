import { AlchemyRules } from '../../rules/AlchemyRules';

/**
 * Alchemical preparation item data preparation.
 */
export const PreparationPrep = {
    prepareBaseData(system: Item.SystemOfType<'preparation'>) {
        PreparationPrep.preparePotency(system);
    },

    /**
     * Derive the current potency from the potency at creation and the elapsed world time.
     *
     * Potency is derived rather than stored so it can't drift out of sync with the world clock and
     * stays correct when the GM rewinds time. See SR5#305 'The Finished Preparation'.
     */
    preparePotency(system: Item.SystemOfType<'preparation'>) {
        if (system.inert) {
            system.potency.value = 0;
            return;
        }

        system.potency.value = AlchemyRules.currentPotency(
            system.potency.base,
            system.created.worldTime,
            game.time.worldTime
        );
    }
}
