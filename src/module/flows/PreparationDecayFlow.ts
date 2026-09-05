import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { AlchemyRules } from "../rules/AlchemyRules";
import { TestCreator } from "../tests/TestCreator";
import { PreparationTriggerTest } from "../tests/PreparationTriggerTest";

/**
 * React to world time passing for alchemical preparations.
 *
 * The current potency itself is derived during item data preparation (see PreparationPrep), so
 * this flow never has to write it. What it does is handle the side effects of time passing:
 * refreshing sheets that show stale potency and announcing when preparations run out.
 *
 * See SR5#305 'The Finished Preparation'.
 */
export const PreparationDecayFlow = {
    // A burst of world-time updates must not start the same timed preparation twice while its
    // asynchronous roll is still resolving.
    triggering: new Set<string>(),

    // Last world time processed by this client. This detects expiry boundary crossings without
    // persisting lifecycle state on every preparation.
    previousWorldTime: undefined as number | undefined,

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
     * Has this preparation run out of potency?
     *
     * Pure over the item data and time, so the rule can be unit tested.
     */
    hasExpired(system: Item.SystemOfType<'preparation'>, worldTime: number): boolean {
        if (system.potency.base <= 0) return false;

        return AlchemyRules.currentPotency(system.potency.base, system.created.worldTime, worldTime) <= 0;
    },

    /**
     * Did advancing world time cross this preparation's expiration boundary?
     */
    crossedExpiry(
        system: Item.SystemOfType<'preparation'>,
        previousWorldTime: number,
        worldTime: number
    ): boolean {
        if (system.potency.base <= 0 || worldTime <= previousWorldTime) return false;

        const expiresAt = AlchemyRules.expiresAt(system.potency.base, system.created.worldTime);
        return previousWorldTime < expiresAt && worldTime >= expiresAt;
    },

    /**
     * Whether a valid timed preparation has reached its scheduled activation instant.
     */
    isTimeTriggerDue(system: Item.SystemOfType<'preparation'>, worldTime: number): boolean {
        if (system.trigger !== 'time' || system.potency.base <= 0) return false;

        const triggerWorldTime = system.created.worldTime + Math.max(system.triggerTime, 0);
        if (triggerWorldTime > AlchemyRules.expiresAt(system.potency.base, system.created.worldTime)) return false;

        return worldTime >= triggerWorldTime;
    },

    /**
     * Release a timed preparation at its scheduled instant without borrowing the GM's selected
     * targets. The resulting chat card can then be opposed by the actual affected actor(s).
     */
    async triggerTimedPreparation(
        preparation: SR5Item<'preparation'>,
        options: { showMessage?: boolean } = {}
    ): Promise<PreparationTriggerTest | undefined> {
        const owner = preparation.actor;
        const uuid = preparation.uuid;
        if (!owner || !uuid || preparation.system.potency.base <= 0
            || PreparationDecayFlow.triggering.has(uuid)) return;

        PreparationDecayFlow.triggering.add(uuid);
        try {
            const test = await TestCreator.fromItem(preparation, owner, {
                showDialog: false,
                showMessage: options.showMessage ?? true,
            });
            if (!(test instanceof PreparationTriggerTest)) return;

            test.data.triggeredWorldTime = preparation.system.created.worldTime
                + Math.max(preparation.system.triggerTime, 0);
            test.data.targetUuids = [];
            await test.execute();
            return test;
        } finally {
            PreparationDecayFlow.triggering.delete(uuid);
        }
    },

    /**
     * Resolve timed triggers, announce newly expired preparations, and refresh their displays.
     * Only the active GM creates rolls and chat messages.
     */
    async onWorldTimeChange() {
        const worldTime = game.time.worldTime;
        const previousWorldTime = PreparationDecayFlow.previousWorldTime ?? worldTime;
        PreparationDecayFlow.previousWorldTime = worldTime;

        const preparations = PreparationDecayFlow.preparations();
        if (!preparations.length) return;

        if (game.users?.activeGM?.isSelf) {
            for (const preparation of preparations) {
                if (PreparationDecayFlow.isTimeTriggerDue(preparation.system, worldTime)) {
                    await PreparationDecayFlow.triggerTimedPreparation(preparation);
                    continue;
                }
                if (PreparationDecayFlow.crossedExpiry(
                    preparation.system, previousWorldTime, worldTime
                )) await PreparationDecayFlow.announceExpiry(preparation);
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
            // DataModel#reset only restores persisted source values. Run document preparation so
            // PreparationPrep derives potency for the new world time before sheets or tests read it.
            preparation.prepareData();
            preparation.render(false);

            const owner = preparation.actor;
            if (owner) owners.add(owner);
        }

        for (const owner of owners) owner.render(false);
    }
}
