import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { AlchemyRules } from "../rules/AlchemyRules";

/**
 * React to world time passing for alchemical preparations.
 *
 * The current potency itself is derived during item data preparation (see PreparationPrep), so
 * this flow never has to write it. What it does is handle the side effects of time passing:
 * refreshing sheets that show a now stale potency, and retiring preparations that ran out.
 *
 * See SR5#305 'The Finished Preparation'.
 */
export const PreparationDecayFlow = {
    /**
     * Every preparation item carried by an actor.
     *
     * Unowned preparations in the Items directory are left alone on purpose. Those are templates
     * rather than live preparations, and retiring them behind the GM's back would be surprising.
     */
    preparations(): SR5Item<'preparation'>[] {
        const preparations: SR5Item<'preparation'>[] = [];

        for (const actor of game.actors ?? []) {
            for (const item of (actor as SR5Actor).items) {
                if (item.type !== 'preparation') continue;
                preparations.push(item as SR5Item<'preparation'>);
            }
        }

        return preparations;
    },

    /**
     * Has this preparation run out of potency without being marked inert yet?
     *
     * Pure over the item data and time, so the rule can be unit tested.
     */
    hasExpired(system: Item.SystemOfType<'preparation'>, worldTime: number): boolean {
        if (system.inert) return false;
        if (system.potency.base <= 0) return false;

        return AlchemyRules.currentPotency(system.potency.base, system.created.worldTime, worldTime) <= 0;
    },

    /**
     * Retire every preparation whose potency reached 0 and refresh anything showing one.
     *
     * The write runs on the active GM alone, so a second connected GM can't retire them twice.
     * Preparations are never deleted: the lynchpin is still an ordinary object once the magic
     * is gone.
     */
    async onWorldTimeChange() {
        const worldTime = game.time.worldTime;
        const preparations = PreparationDecayFlow.preparations();
        if (!preparations.length) return;

        if (game.users?.activeGM?.isSelf) {
            for (const preparation of preparations) {
                if (!PreparationDecayFlow.hasExpired(preparation.system, worldTime)) continue;

                await preparation.update({ system: { inert: true } });
                await PreparationDecayFlow.announceExpiry(preparation);
            }
        }

        PreparationDecayFlow.refreshSheets(preparations);
    },

    /**
     * Whisper the owners that a preparation lost its spell.
     */
    async announceExpiry(preparation: SR5Item<'preparation'>) {
        const owner = preparation.actor;
        if (!owner) return;

        const whisper = game.users
            ?.filter(user => !user.isGM && owner.testUserPermission(user, 'OWNER'))
            .map(user => user.id as string) ?? [];

        // Without an audience this would go out publicly, so keep it to the GM instead.
        await ChatMessage.create({
            content: `<p>${game.i18n.format('SR5.Preparation.ExpiredMessage', { name: preparation.name })}</p>`,
            whisper: whisper.length ? whisper : [game.user.id as string],
            speaker: { alias: owner.name ?? undefined },
        });
    },

    /**
     * Re-render open sheets showing a preparation, as their derived potency just changed.
     *
     * Rendering with force false only touches sheets a user actually has open.
     */
    refreshSheets(preparations: SR5Item<'preparation'>[]) {
        const owners = new Set<SR5Actor>();

        for (const preparation of preparations) {
            preparation.reset();
            preparation.render(false);

            const owner = preparation.actor;
            if (owner) owners.add(owner);
        }

        for (const owner of owners) owner.render(false);
    }
}
