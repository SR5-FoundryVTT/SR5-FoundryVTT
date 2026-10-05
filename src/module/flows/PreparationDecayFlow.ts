import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { AlchemyRules } from "../rules/AlchemyRules";
import { TestCreator } from "../tests/TestCreator";
import { PreparationTriggerTest } from "../tests/PreparationTriggerTest";
import { intervalToSeconds } from "../utils/timeUnits";

const TRIGGER_DUE_TEMPLATE = 'systems/shadowrun5e/dist/templates/chat/preparation-trigger-due-message.hbs';

/**
 * React to world time passing for alchemical preparations.
 *
 * The current potency itself is derived during item data preparation (see PreparationPrep), so
 * this flow never has to write it. What it does is handle the side effects of time passing:
 * refreshing sheets that show stale potency and announcing when preparations come due or run out.
 *
 * See SR5#305 'The Finished Preparation'.
 */
export const PreparationDecayFlow = {
    // Repeated clicks on a due card must not start the same timed preparation twice while its
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

        const triggerWorldTime = AlchemyRules.triggerAt(system.created.worldTime, intervalToSeconds(system.triggerTime));
        if (triggerWorldTime > AlchemyRules.expiresAt(system.potency.base, system.created.worldTime)) return false;

        return worldTime >= triggerWorldTime;
    },

    /**
     * Did advancing world time make this timed preparation due?
     */
    crossedTrigger(
        system: Item.SystemOfType<'preparation'>,
        previousWorldTime: number,
        worldTime: number
    ): boolean {
        return PreparationDecayFlow.isTimeTriggerDue(system, worldTime)
            && !PreparationDecayFlow.isTimeTriggerDue(system, previousWorldTime);
    },

    /**
     * Release a timed preparation at its scheduled potency, however late it is rolled.
     */
    async triggerTimedPreparation(
        preparation: SR5Item<'preparation'>,
        options: { showDialog?: boolean, showMessage?: boolean } = {}
    ): Promise<PreparationTriggerTest | undefined> {
        const owner = preparation.actor;
        const uuid = preparation.uuid;
        if (!owner || !uuid || preparation.system.potency.base <= 0
            || PreparationDecayFlow.triggering.has(uuid)) return;

        PreparationDecayFlow.triggering.add(uuid);
        try {
            const test = await TestCreator.fromItem(preparation, owner, {
                showDialog: options.showDialog ?? true,
                showMessage: options.showMessage ?? true,
            });
            if (!(test instanceof PreparationTriggerTest)) return;

            test.data.triggeredWorldTime = AlchemyRules.triggerAt(
                preparation.system.created.worldTime, intervalToSeconds(preparation.system.triggerTime));
            await test.execute();
            return test;
        } finally {
            PreparationDecayFlow.triggering.delete(uuid);
        }
    },

    /**
     * Announce newly due timed triggers and newly expired preparations, and refresh their displays.
     * Only the active GM creates chat messages.
     */
    async onWorldTimeChange() {
        const worldTime = game.time.worldTime;
        const previousWorldTime = PreparationDecayFlow.previousWorldTime ?? worldTime;
        PreparationDecayFlow.previousWorldTime = worldTime;

        const preparations = PreparationDecayFlow.preparations();
        if (!preparations.length) return;

        if (game.users?.activeGM?.isSelf) {
            for (const preparation of preparations) {
                // A due trigger still rolls at its scheduled potency, so it isn't also announced
                // as expired when one time jump crosses both.
                if (PreparationDecayFlow.crossedTrigger(
                    preparation.system, previousWorldTime, worldTime
                )) {
                    await PreparationDecayFlow.announceTrigger(preparation);
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
     * The players owning this actor, or the GM alone when there are none.
     */
    ownerWhisper(owner: SR5Actor): string[] {
        const whisper = game.users
            ?.filter(user => !user.isGM && owner.testUserPermission(user, 'OWNER'))
            .map(user => user.id as string) ?? [];

        // Without an audience a message would go out publicly, so keep it to the GM instead.
        return whisper.length ? whisper : [game.user.id as string];
    },

    /**
     * Whisper the owners a card to roll a timed preparation that just came due.
     */
    async announceTrigger(preparation: SR5Item<'preparation'>) {
        const owner = preparation.actor;
        if (!owner) return;

        const content = await foundry.applications.handlebars.renderTemplate(TRIGGER_DUE_TEMPLATE, {
            preparation,
            actor: owner,
        });

        await ChatMessage.create({
            content,
            whisper: PreparationDecayFlow.ownerWhisper(owner),
            speaker: { alias: owner.name ?? undefined },
        });
    },

    /**
     * Whisper the owners that a preparation lost its spell.
     */
    async announceExpiry(preparation: SR5Item<'preparation'>) {
        const owner = preparation.actor;
        if (!owner) return;

        await ChatMessage.create({
            content: `<p>${game.i18n.format('SR5.Preparation.ExpiredMessage', { name: preparation.name })}</p>`,
            whisper: PreparationDecayFlow.ownerWhisper(owner),
            speaker: { alias: owner.name ?? undefined },
        });
    },

    /**
     * Register listeners for the due card's roll button.
     *
     * Needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     */
    chatMessageListeners(_message: ChatMessage, html) {
        $(html).find('[data-action="preparation-trigger-roll"]').on('click', async event => {
            event.preventDefault();
            const preparation = await fromUuid(event.currentTarget.dataset.uuid) as SR5Item<'preparation'> | null;
            if (!preparation?.isOwner) return;

            await PreparationDecayFlow.triggerTimedPreparation(preparation);
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
            // Resetting re-runs data preparation, which derives potency for the new world time.
            preparation.reset();
            preparation.render(false);

            const owner = preparation.actor;
            if (owner) owners.add(owner);
        }

        for (const owner of owners) owner.render(false);
    }
}
