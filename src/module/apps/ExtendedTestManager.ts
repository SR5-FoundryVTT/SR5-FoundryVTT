/**
 * A world global manager application for Shadowrun 5e extended tests.
 */
import { DeepPartial } from "fvtt-types/utils";
import { FLAGS, SR5_APPV2_CSS_CLASS, SYSTEM_NAME } from '@/module/constants';
import { ExtendedTestFlow } from '@/module/flows/ExtendedTestFlow';
import { ExtendedTestRules } from '@/module/rules/ExtendedTestRules';
import { ExtendedTestStorage } from '@/module/storage/ExtendedTestStorage';
import { WorldTimeFlow, WorldTimePreset } from '@/module/flows/WorldTimeFlow';
import { intervalToSeconds, unitLabel } from '@/module/utils/timeUnits';
import { ExtendedTestRecord, ExtendedTestStatus } from '@/module/types/flows/ExtendedTest';
import { ExtendedTestConfigDialog } from '@/module/apps/dialogs/ExtendedTestConfigDialog';

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface ExtendedTestRowContext {
    record: ExtendedTestRecord;
    statusLabel: string;
    visibilityLabel: string;
    actorName?: string;
    creatorName: string;
    progress?: number;
    nextPool: number;
    intervalLabel: string;
    intervalsElapsed: number;
    isDue: boolean;
    createdGameTime: string;
    updatedRealTime: string;
    canRoll: boolean;
    // Rolling is only blocked by the elapsed game time, everything else would allow it.
    rollBlockedByInterval: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canContinue: boolean;
    isActive: boolean;
    isPaused: boolean;
    expanded: boolean;
    rolls: {
        index: number;
        hits: number;
        glitch: boolean;
        criticalGlitch: boolean;
        poolUsed: number;
        realTime: string;
        gameTime: string;
        messageUuid?: string;
        userName: string;
    }[];
    log: {
        actionLabel: string;
        detail?: string;
        realTime: string;
        userName: string;
    }[];
}

interface ExtendedTestManagerContext extends HandlebarsApplicationMixin.RenderContext {
    rows: ExtendedTestRowContext[];
    filters: ExtendedTestManager['filterState'];
    statusOptions: { value: string; label: string }[];
    periodOptions: { value: string; label: string }[];
    sortOptions: { value: string; label: string }[];
    actorOptions: { uuid: string; name: string }[];
    isGM: boolean;
    currentTime: string;
    timePresets: (WorldTimePreset & { label: string })[];
}

const STATUS_FILTERS = ['all', 'active', 'completed', 'failed', 'paused', 'cancelled'] as const;
const PERIODS: Record<string, number> = {
    hour: 3600_000,
    day: 86400_000,
    week: 604800_000,
    month: 2592000_000,
};

type SortKey = 'name' | 'createdAt' | 'updatedAt' | 'createdWorldTime' | 'threshold'
    | 'accumulatedHits' | 'progress' | 'rollCount' | 'status' | 'interval';

export class ExtendedTestManager extends HandlebarsApplicationMixin(ApplicationV2)<ExtendedTestManagerContext> {
    static open() {
        // Reuse an open manager, a second instance would share its DOM id and orphan the first.
        const existing = foundry.applications.instances.get('extended-test-manager');
        if (existing instanceof ExtendedTestManager) {
            void existing.render({ force: true });
            return;
        }

        void new ExtendedTestManager().render({ force: true });
    }

    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/extended-test-manager.hbs',
            // Keep the list position across the frequent re-renders caused by storage and time changes.
            scrollable: ['.etm-list']
        }
    }

    static override DEFAULT_OPTIONS = {
        id: 'extended-test-manager',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'extended-test-manager'],
        position: {
            width: 900,
            height: 640,
        },
        window: {
            resizable: true,
        },
        actions: {
            createTest: ExtendedTestManager.#onCreateTest,
            editTest: ExtendedTestManager.#onEditTest,
            rollTest: ExtendedTestManager.#onRollTest,
            pauseTest: ExtendedTestManager.#onPauseTest,
            resumeTest: ExtendedTestManager.#onResumeTest,
            completeTest: ExtendedTestManager.#onCompleteTest,
            cancelTest: ExtendedTestManager.#onCancelTest,
            deleteTest: ExtendedTestManager.#onDeleteTest,
            toggleDetails: ExtendedTestManager.#onToggleDetails,
            openActor: ExtendedTestManager.#onOpenActor,
            openMessage: ExtendedTestManager.#onOpenMessage,
            toggleSortDir: ExtendedTestManager.#onToggleSortDir,
            timePreset: ExtendedTestManager.#onTimePreset,
        }
    }

    filterState = {
        status: 'all' as typeof STATUS_FILTERS[number],
        mine: false,
        actorUuid: '',
        visibility: 'all' as 'all' | 'public' | 'private',
        search: '',
        createdWithin: 'any',
        updatedWithin: 'any',
        sortBy: 'updatedAt' as SortKey,
        sortDir: 'desc' as 'asc' | 'desc',
    };

    #expanded = new Set<string>();

    // Only re-render for changes to the extended test section of the global storage.
    #onStorageChanged = (changedKeys: string[]) => {
        if (!changedKeys.includes(ExtendedTestStorage.key)) return;
        void this.render();
    };
    #onUpdateWorldTime = () => { void this.render(); };
    // Typing in the search field shouldn't rebuild the list on every keystroke.
    #onSearchInput = foundry.utils.debounce(() => { void this.render(); }, 200);

    override get title() {
        return game.i18n.localize('SR5.ExtendedTestManager.Title');
    }

    protected override _onFirstRender(context: DeepPartial<ExtendedTestManagerContext>, options: DeepPartial<ApplicationV2.RenderOptions>) {
        Hooks.on('sr5e.storageChanged', this.#onStorageChanged);
        Hooks.on('updateWorldTime', this.#onUpdateWorldTime);
        return super._onFirstRender(context, options);
    }

    protected override _onClose(options: DeepPartial<ApplicationV2.RenderOptions>) {
        Hooks.off('sr5e.storageChanged', this.#onStorageChanged);
        Hooks.off('updateWorldTime', this.#onUpdateWorldTime);
        return super._onClose(options);
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);

        const user = game.user!;
        const records = Object.values(ExtendedTestStorage.getAll())
            // The privacy layer: only show records the current user may view.
            .filter(record => ExtendedTestRules.canView(record, user));

        const filtered = records.filter(record => this.#matchesFilters(record, user));
        filtered.sort(this.#comparator());

        context.rows = filtered.map(record => this.#prepareRow(record, user));
        context.filters = this.filterState;
        context.isGM = user.isGM;

        context.statusOptions = STATUS_FILTERS.map(value => ({
            value,
            label: game.i18n.localize(value === 'all'
                ? 'SR5.ExtendedTestManager.Filters.AllStatuses'
                : `SR5.ExtendedTestManager.Status.${value}` as Parameters<typeof game.i18n.localize>[0]),
        }));
        context.periodOptions = ['any', ...Object.keys(PERIODS)].map(value => ({
            value,
            label: game.i18n.localize(`SR5.ExtendedTestManager.Periods.${value}` as Parameters<typeof game.i18n.localize>[0]),
        }));
        context.sortOptions = (['name', 'createdAt', 'updatedAt', 'createdWorldTime', 'threshold',
            'accumulatedHits', 'progress', 'rollCount', 'status', 'interval'] as SortKey[]).map(value => ({
            value,
            label: game.i18n.localize(`SR5.ExtendedTestManager.Sort.${value}` as Parameters<typeof game.i18n.localize>[0]),
        }));

        // Actors referenced by any visible record, for the actor filter.
        const actorOptions = new Map<string, string>();
        for (const record of records) {
            if (!record.actorUuid) continue;
            const actor = fromUuidSync(record.actorUuid);
            if (actor) actorOptions.set(record.actorUuid, (actor as { name?: string }).name ?? record.actorUuid);
        }
        context.actorOptions = [...actorOptions.entries()].map(([uuid, name]) => ({ uuid, name }));

        // GM time strip.
        context.currentTime = WorldTimeFlow.format();
        context.timePresets = WorldTimeFlow.PRESETS.map(preset => ({
            ...preset,
            label: game.i18n.localize(preset.labelKey as Parameters<typeof game.i18n.localize>[0]),
        }));

        return context;
    }

    #matchesFilters(record: ExtendedTestRecord, user: User): boolean {
        const filters = this.filterState;

        if (filters.status !== 'all' && record.status !== filters.status) return false;

        if (filters.mine && record.creatorUserId !== user.id && !ExtendedTestRules.isActorOwner(record, user)) return false;

        if (filters.actorUuid && record.actorUuid !== filters.actorUuid) return false;

        if (filters.visibility === 'public' && record.permissions.visibility !== 'public') return false;
        if (filters.visibility === 'private' && record.permissions.visibility === 'public') return false;

        if (filters.createdWithin !== 'any' && Date.now() - record.createdAt > PERIODS[filters.createdWithin]) return false;
        if (filters.updatedWithin !== 'any' && Date.now() - record.updatedAt > PERIODS[filters.updatedWithin]) return false;

        if (filters.search) {
            const search = filters.search.toLowerCase();
            const haystack = `${record.name} ${record.description}`.toLowerCase();
            if (!haystack.includes(search)) return false;
        }

        return true;
    }

    #comparator(): (a: ExtendedTestRecord, b: ExtendedTestRecord) => number {
        const { sortBy, sortDir } = this.filterState;
        const direction = sortDir === 'asc' ? 1 : -1;

        const value = (record: ExtendedTestRecord): number | string => {
            switch (sortBy) {
                case 'name': return record.name.toLowerCase();
                case 'progress': return ExtendedTestRules.progress(record) ?? -1;
                case 'interval': return intervalToSeconds(record.interval);
                case 'status': return record.status;
                default: return record[sortBy] ?? 0;
            }
        };

        return (a, b) => {
            const va = value(a);
            const vb = value(b);
            if (va < vb) return -direction;
            if (va > vb) return direction;
            return 0;
        };
    }

    #prepareRow(record: ExtendedTestRecord, user: User): ExtendedTestRowContext {
        const worldTime = game.time.worldTime;
        const actor = record.actorUuid ? fromUuidSync(record.actorUuid) : null;
        const enforceInterval = game.settings.get(SYSTEM_NAME, FLAGS.EnforceExtendedTestInterval) as boolean;
        const intervalAllowsRoll = !enforceInterval || ExtendedTestRules.intervalAllowsRoll(record, worldTime);
        const rollAllowed = record.status === 'active'
            && ExtendedTestRules.canRoll(record, user)
            && ExtendedTestRules.canContinue(record);
        const canRoll = rollAllowed && intervalAllowsRoll;

        const userName = (id: string) => game.users?.get(id)?.name ?? '?';
        const expanded = this.#expanded.has(record.id);

        return {
            record,
            statusLabel: game.i18n.localize(`SR5.ExtendedTestManager.Status.${record.status}` as Parameters<typeof game.i18n.localize>[0]),
            visibilityLabel: game.i18n.localize(`SR5.ExtendedTestManager.Visibility.${record.permissions.visibility}` as Parameters<typeof game.i18n.localize>[0]),
            actorName: (actor as { name?: string } | null)?.name,
            creatorName: userName(record.creatorUserId),
            progress: ExtendedTestRules.progress(record),
            nextPool: ExtendedTestRules.nextPool(record),
            intervalLabel: `${record.interval.value} ${unitLabel(record.interval.unit)}`,
            intervalsElapsed: ExtendedTestRules.intervalsElapsed(record, worldTime),
            isDue: ExtendedTestRules.isDue(record, worldTime),
            createdGameTime: WorldTimeFlow.format(record.createdWorldTime),
            updatedRealTime: new Date(record.updatedAt).toLocaleString(),
            canRoll,
            rollBlockedByInterval: rollAllowed && !intervalAllowsRoll,
            canEdit: ExtendedTestRules.canEdit(record, user),
            canDelete: ExtendedTestRules.canDelete(record, user),
            canContinue: ExtendedTestRules.canContinue(record),
            isActive: record.status === 'active',
            isPaused: record.status === 'paused',
            expanded,
            rolls: expanded ? record.rolls.map((roll, index) => ({
                index: index + 1,
                hits: roll.hits,
                glitch: roll.glitch,
                criticalGlitch: roll.criticalGlitch,
                poolUsed: roll.poolUsed,
                realTime: new Date(roll.timestamp).toLocaleString(),
                gameTime: WorldTimeFlow.format(roll.worldTime),
                messageUuid: roll.messageUuid,
                userName: userName(roll.userId),
            })) : [],
            log: expanded ? record.log.map(entry => ({
                actionLabel: game.i18n.localize(`SR5.ExtendedTestManager.Log.${entry.action}` as Parameters<typeof game.i18n.localize>[0]),
                detail: entry.detail,
                realTime: new Date(entry.timestamp).toLocaleString(),
                userName: userName(entry.userId),
            })) : [],
        };
    }

    override async _onRender(
        context: DeepPartial<ExtendedTestManagerContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        // Filter inputs re-render the list on change.
        this.element.querySelectorAll<HTMLElement>('[data-filter]').forEach(element => {
            const filter = element.dataset.filter!;
            const isSearch = filter === 'search';
            element.addEventListener(isSearch ? 'input' : 'change', () => {
                this.#readFilter(filter, element);
                if (isSearch) this.#onSearchInput();
                else void this.render();
            });
        });

        // GM time strip custom shift.
        this.element.querySelector<HTMLElement>('[data-action-custom-shift]')?.addEventListener('change', event => {
            const input = event.currentTarget as HTMLInputElement;
            const minutes = Number(input.value);
            if (!minutes || Number.isNaN(minutes)) return;
            input.value = '';
            void WorldTimeFlow.shift(minutes * 60);
        });

        return super._onRender(context, options);
    }

    #readFilter(filter: string, element: HTMLElement) {
        const value = (element as HTMLInputElement | HTMLSelectElement).value;
        switch (filter) {
            case 'status': this.filterState.status = value as typeof STATUS_FILTERS[number]; break;
            case 'mine': this.filterState.mine = (element as HTMLInputElement).checked; break;
            case 'actorUuid': this.filterState.actorUuid = value; break;
            case 'visibility': this.filterState.visibility = value as 'all' | 'public' | 'private'; break;
            case 'search': this.filterState.search = value; break;
            case 'createdWithin': this.filterState.createdWithin = value; break;
            case 'updatedWithin': this.filterState.updatedWithin = value; break;
            case 'sortBy': this.filterState.sortBy = value as SortKey; break;
        }
    }

    static #recordId(event: Event, target?: HTMLElement): string | undefined {
        const actionTarget = target ?? (event.target instanceof HTMLElement ? event.target : null);
        return actionTarget?.closest<HTMLElement>('[data-record-id]')?.dataset.recordId;
    }

    static async #onCreateTest(this: ExtendedTestManager, event: Event) {
        event.preventDefault();
        await ExtendedTestConfigDialog.create();
        await this.render();
    }

    static async #onEditTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (!id) return;
        await ExtendedTestConfigDialog.edit(id);
        await this.render();
    }

    static async #onRollTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (!id) return;
        await ExtendedTestFlow.roll(id);
        await this.render();
    }

    static async #onPauseTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (id) await ExtendedTestFlow.pause(id);
        await this.render();
    }

    static async #onResumeTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (id) await ExtendedTestFlow.resume(id);
        await this.render();
    }

    static async #onCompleteTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (id) await ExtendedTestFlow.complete(id);
        await this.render();
    }

    static async #onCancelTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (id) await ExtendedTestFlow.cancel(id);
        await this.render();
    }

    static async #onDeleteTest(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (!id) return;

        const record = ExtendedTestStorage.get(id);
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize('SR5.ExtendedTestManager.Actions.Delete') },
            content: game.i18n.format('SR5.ExtendedTestManager.ConfirmDelete', { name: record?.name ?? '' }),
        });
        if (!confirmed) return;

        await ExtendedTestFlow.remove(id);
        this.#expanded.delete(id);
        await this.render();
    }

    static async #onToggleDetails(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        if (!id) return;
        if (this.#expanded.has(id)) this.#expanded.delete(id);
        else this.#expanded.add(id);
        await this.render();
    }

    static async #onOpenActor(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const id = ExtendedTestManager.#recordId(event, target);
        const record = id ? ExtendedTestStorage.get(id) : undefined;
        if (!record?.actorUuid) return;
        const actor = await fromUuid(record.actorUuid);
        (actor as { sheet?: { render: (force: boolean) => void } } | null)?.sheet?.render(true);
    }

    static async #onOpenMessage(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const uuid = target?.dataset.messageUuid;
        if (!uuid) return;
        const message = await fromUuid(uuid);
        if (!(message instanceof ChatMessage)) return;
        void new foundry.applications.sidebar.apps.ChatPopout({ message: message as never }).render({ force: true });
    }

    static async #onToggleSortDir(this: ExtendedTestManager, event: Event) {
        event.preventDefault();
        this.filterState.sortDir = this.filterState.sortDir === 'asc' ? 'desc' : 'asc';
        await this.render();
    }

    static async #onTimePreset(this: ExtendedTestManager, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const seconds = Number(target?.dataset.seconds ?? 0);
        await WorldTimeFlow.shift(seconds);
    }
}
