import { FLAGS, SYSTEM_NAME } from "../constants";
import { ExtendedTestFlow } from "./ExtendedTestFlow";
import { ExtendedTestManager } from "../apps/ExtendedTestManager";
import { ExtendedTestRules } from "../rules/ExtendedTestRules";
import { ExtendedTestStorage } from "../storage/ExtendedTestStorage";
import { unitLabel } from "../utils/timeUnits";
import { ExtendedTestRecord } from "../types/flows/ExtendedTest";

const TEMPLATE = 'systems/shadowrun5e/dist/templates/chat/extended-test-due-message.hbs';

/**
 * Announce managed extended tests that game time has made rollable again.
 *
 * The manager only shows a 'Due' badge, which nobody sees with the application closed.
 * This whispers a card with the test state and a roll button to everyone allowed to roll it.
 *
 * NOTE: This is independent of the EnforceExtendedTestInterval setting. That one decides
 * whether the roll is allowed, this one only reports that the interval has passed.
 */
export const ExtendedTestDueFlow = {
    /**
     * Should this record be announced right now?
     *
     * Pure over record and time, so the rule can be unit tested.
     */
    shouldAnnounce(record: ExtendedTestRecord, worldTime: number): boolean {
        if (record.status !== 'active') return false;
        if (!ExtendedTestRules.isDue(record, worldTime)) return false;
        // A record that already met its threshold is done, not ready to continue.
        if (!ExtendedTestRules.canContinue(record)) return false;

        // Announced once per roll, so re-advancing rewound world time stays quiet.
        return record.dueAnnouncedRollCount !== record.rollCount;
    },

    /**
     * The users allowed to roll this record, as the whisper audience.
     *
     * Offline users are included on purpose, a whisper waits for them in the chat log.
     */
    recipients(record: ExtendedTestRecord): string[] {
        return game.users
            ?.filter(user => ExtendedTestRules.canRoll(record, user))
            .map(user => user.id) ?? [];
    },

    /**
     * Announce every record game time has made due.
     *
     * Runs on the active GM alone, so a second connected GM can't post the card twice.
     */
    async announceDue() {
        if (!game.users?.activeGM?.isSelf) return;
        if (!game.settings.get(SYSTEM_NAME, FLAGS.ExtendedTestDueMessage)) return;

        const worldTime = game.time.worldTime;

        for (const record of Object.values(ExtendedTestStorage.getAll())) {
            if (!ExtendedTestDueFlow.shouldAnnounce(record, worldTime)) continue;

            const whisper = ExtendedTestDueFlow.recipients(record);
            // Without an audience the message would go out publicly. Leave the record
            // unmarked instead, so it can still be announced later.
            if (!whisper.length) continue;

            await ExtendedTestDueFlow.post(record, whisper, worldTime);

            record.dueAnnouncedRollCount = record.rollCount;
            await ExtendedTestFlow._persist(record);
        }
    },

    /**
     * Create the whispered due card for a single record.
     */
    async post(record: ExtendedTestRecord, whisper: string[], worldTime: number) {
        const actor = record.actorUuid ? fromUuidSync(record.actorUuid) as { name?: string, img?: string } | null : null;
        const intervalsElapsed = ExtendedTestRules.intervalsElapsed(record, worldTime);

        const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, {
            record,
            actorName: actor?.name,
            actorImg: actor?.img,
            nextPool: ExtendedTestRules.nextPool(record),
            intervalsElapsed,
            // Saying 'one interval elapsed' on a card that only appears then is noise.
            overdue: intervalsElapsed > 1,
            intervalUnitLabel: unitLabel(record.interval.unit),
        });

        await ChatMessage.create({
            content,
            whisper,
            speaker: { alias: game.i18n.localize('SR5.ExtendedTestManager.Title') },
        });
    },

    /**
     * Register listeners for the due card buttons.
     *
     * Needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     */
    async chatMessageListeners(_message: ChatMessage, html) {
        // The card is only a shortcut into the flow. ExtendedTestFlow.roll re-checks
        // permission, status, pool and interval, and warns about whatever it refuses.
        $(html).find('[data-action="extended-test-roll"]').on('click', event => {
            event.preventDefault();
            const id = (event.currentTarget as HTMLElement).dataset.recordId;
            if (id) void ExtendedTestFlow.roll(id);
        });

        $(html).find('[data-action="extended-test-open"]').on('click', event => {
            event.preventDefault();
            ExtendedTestManager.open();
        });
    },
}
