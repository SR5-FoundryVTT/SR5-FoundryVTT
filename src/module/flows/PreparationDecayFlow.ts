import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { AlchemyRules } from "../rules/AlchemyRules";
import { TestCreator } from "../tests/TestCreator";
import { PreparationTriggerTest } from "../tests/PreparationTriggerTest";
import { intervalToSeconds } from "../utils/timeUnits";

const TRIGGER_DUE_TEMPLATE = 'systems/shadowrun5e/dist/templates/chat/preparation-trigger-due-message.hbs';

/**
 * Side effects of world time passing for alchemical preparations: announcing due triggers and
 * expirations, and refreshing sheets. Potency itself is derived in PreparationPrep. SR5#305.
 */
export const PreparationDecayFlow = {
    // Guards against a double click rolling the same preparation twice.
    triggering: new Set<string>(),

    // Last world time seen, to detect trigger and expiry crossings.
    previousWorldTime: undefined as number | undefined,

    // Uuids of preparations seen during data preparation. Stale entries are pruned in preparations().
    known: new Set<string>(),

    /**
     * Remember a preparation. Called from data preparation, which every live preparation runs.
     */
    track(item: SR5Item<'preparation'>) {
        // Compendium entries and temporary copies aren't live preparations.
        if (item.pack || !item.id || !item.uuid) return;
        PreparationDecayFlow.known.add(item.uuid);
    },

    /**
     * An unlinked token's copy of a preparation inherited from its base actor.
     */
    isInheritedTokenCopy(item: SR5Item): boolean {
        const actor = item.parent;
        if (!(actor instanceof SR5Actor) || !actor.isToken) return false;
        return !actor.token?.delta?.items.manages(item.id!);
    },

    /**
     * Every live preparation: in the Items directory, on an actor, or on an unlinked token.
     * Forgets deleted ones, as deleting an actor, token or scene doesn't announce its items.
     */
    preparations(): SR5Item<'preparation'>[] {
        const preparations: SR5Item<'preparation'>[] = [];

        for (const uuid of PreparationDecayFlow.known) {
            const item = fromUuidSync(uuid);
            if (!(item instanceof SR5Item) || !item.isType('preparation')
                || PreparationDecayFlow.isInheritedTokenCopy(item)) {
                PreparationDecayFlow.known.delete(uuid);
                continue;
            }
            preparations.push(item);
        }

        return preparations;
    },

    /**
     * Did advancing world time cross this preparation's expiration?
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
     * The world time at which the time trigger fires.
     */
    triggerWorldTime(system: Item.SystemOfType<'preparation'>): number {
        return AlchemyRules.triggerAt(system.created.worldTime, intervalToSeconds(system.triggerTime));
    },

    /**
     * Whether a valid timed preparation has reached its trigger time.
     */
    isTimeTriggerDue(system: Item.SystemOfType<'preparation'>, worldTime: number): boolean {
        if (system.trigger !== 'time' || system.potency.base <= 0) return false;

        const triggerWorldTime = PreparationDecayFlow.triggerWorldTime(system);
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
     * Roll a timed preparation at its scheduled potency, however late.
     */
    async triggerTimedPreparation(
        preparation: SR5Item<'preparation'>,
        options: { showDialog?: boolean, showMessage?: boolean } = {}
    ): Promise<PreparationTriggerTest | undefined> {
        const uuid = preparation.uuid;
        if (!uuid || preparation.system.potency.base <= 0
            || PreparationDecayFlow.triggering.has(uuid)) return;

        PreparationDecayFlow.triggering.add(uuid);
        try {
            // Without an actor for preparations in the Items directory.
            const test = await TestCreator.fromItem(preparation, preparation.actor, {
                showDialog: options.showDialog ?? true,
                showMessage: options.showMessage ?? true,
            });
            if (!(test instanceof PreparationTriggerTest)) return;

            test.data.triggeredWorldTime = PreparationDecayFlow.triggerWorldTime(preparation.system);
            await test.execute();
            return test;
        } finally {
            PreparationDecayFlow.triggering.delete(uuid);
        }
    },

    /**
     * Announce due triggers and expirations (active GM only), and refresh displays.
     */
    async onWorldTimeChange() {
        const worldTime = game.time.worldTime;
        const previousWorldTime = PreparationDecayFlow.previousWorldTime ?? worldTime;
        PreparationDecayFlow.previousWorldTime = worldTime;

        const preparations = PreparationDecayFlow.preparations();
        if (!preparations.length) return;

        if (game.users?.activeGM?.isSelf) {
            for (const preparation of preparations) {
                // A due trigger rolls at its scheduled potency, so skip its expiry announcement.
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
     * The players owning this actor, falling back to the GM so nothing goes out publicly.
     */
    ownerWhisper(owner: SR5Actor | null): string[] {
        const whisper = game.users
            ?.filter(user => !user.isGM && !!owner?.testUserPermission(user, 'OWNER'))
            .map(user => user.id as string) ?? [];

        return whisper.length ? whisper : [game.user.id as string];
    },

    /**
     * Whisper to the owners of this actor, speaking as the actor if there is one.
     */
    async whisperToOwners(owner: SR5Actor | null, content: string) {
        await ChatMessage.create({
            content,
            whisper: PreparationDecayFlow.ownerWhisper(owner),
            speaker: owner ? { alias: owner.name ?? undefined } : undefined,
        });
    },

    /**
     * Whisper a card to roll a timed preparation that came due.
     */
    async announceTrigger(preparation: SR5Item<'preparation'>) {
        const owner = preparation.actor;

        const content = await foundry.applications.handlebars.renderTemplate(TRIGGER_DUE_TEMPLATE, {
            preparation,
            actor: owner,
        });
        await PreparationDecayFlow.whisperToOwners(owner, content);
    },

    /**
     * Whisper that a preparation lost its spell.
     */
    async announceExpiry(preparation: SR5Item<'preparation'>) {
        const content = `<p>${game.i18n.format('SR5.Preparation.ExpiredMessage', { name: preparation.name })}</p>`;
        await PreparationDecayFlow.whisperToOwners(preparation.actor, content);
    },

    /**
     * Roll button listener of the due card, for the 'renderChatMessage' hook.
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
     * Re-derive potency and re-render open sheets. render(false) skips closed ones.
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
