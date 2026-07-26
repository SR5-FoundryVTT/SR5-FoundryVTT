/**
 * Create / edit dialog for managed extended test records.
 */
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { ExtendedTestFlow } from '@/module/flows/ExtendedTestFlow';
import { ExtendedTestRules } from '@/module/rules/ExtendedTestRules';
import { ExtendedTestStorage } from '@/module/storage/ExtendedTestStorage';
import { FolderSelectOption, documentSelectOptions } from '@/module/utils/folderOptions';
import {
    ExtendedIntervalUnit,
    ExtendedTestRecord,
    ExtendedTestVisibility,
} from '@/module/types/flows/ExtendedTest';

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface ExtendedTestConfigContext extends HandlebarsApplicationMixin.RenderContext {
    record: Partial<ExtendedTestRecord>;
    isCreate: boolean;
    canManage: boolean;
    // Records registered from a real roll take their pool from the test snapshot, so the
    // dicePool field would be a no-op and accumulated hits are shown instead.
    // See ExtendedTestRules.nextPool.
    poolFromSnapshot: boolean;
    actorOptions: FolderSelectOption[];
    userOptions: { id: string; name: string; visible: boolean; edit: boolean; roll: boolean }[];
    visibilityOptions: { value: string; label: string; selected: boolean }[];
}

export class ExtendedTestConfigDialog extends HandlebarsApplicationMixin(ApplicationV2)<ExtendedTestConfigContext> {
    #record?: ExtendedTestRecord;
    #resolve?: () => void;

    constructor(record?: ExtendedTestRecord, options = {}) {
        super(options);
        this.#record = record;
    }

    /**
     * Open the dialog to create a new record. Resolves when the dialog closes.
     */
    static async create(): Promise<void> {
        return ExtendedTestConfigDialog.#show();
    }

    /**
     * Open the dialog to edit an existing record. Resolves when the dialog closes.
     */
    static async edit(id: string): Promise<void> {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;
        if (!ExtendedTestRules.canEdit(record, game.user)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoEditPermission', { localize: true });
            return;
        }
        return ExtendedTestConfigDialog.#show(record);
    }

    static async #show(record?: ExtendedTestRecord): Promise<void> {
        const dialog = new ExtendedTestConfigDialog(record);
        void dialog.render({ force: true });
        return new Promise(resolve => { dialog.#resolve = resolve; });
    }

    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/dialogs/extended-test-config.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        id: 'extended-test-config',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'extended-test-config'],
        tag: 'form',
        form: {
            handler: ExtendedTestConfigDialog.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: true,
        },
        position: {
            width: 480,
            height: 'auto' as const,
        },
        window: {
            resizable: true,
        },
        actions: {
            cancel: ExtendedTestConfigDialog.#onCancel,
        }
    }

    override get title() {
        return game.i18n.localize(this.#record
            ? 'SR5.ExtendedTestManager.EditTest'
            : 'SR5.ExtendedTestManager.CreateTest');
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);

        const record = this.#record;
        context.record = record ?? {
            name: '',
            notes: '',
            dicePool: 8,
            threshold: 4,
            accumulatedHits: 0,
            interval: { value: 1, unit: 'minutes' },
            cumulativeModifier: true,
            advanceTimeOnRoll: false,
        };
        context.isCreate = !record;
        // Rules and permissions of an existing record are the owners business only.
        context.canManage = !record || ExtendedTestRules.canManage(record, game.user!);
        context.poolFromSnapshot = !!record?.testData;

        // Actors the user may associate: owned actors (GM sees all), under their folders.
        context.actorOptions = documentSelectOptions(
            game.actors!.filter(actor => actor.isOwner), record?.actorUuid);

        context.userOptions = game.users!
            .filter(user => !user.isGM)
            .map(user => ({
                id: user.id!,
                name: user.name ?? '',
                visible: record?.permissions.visibleUsers.includes(user.id!) ?? false,
                edit: record?.permissions.editUsers.includes(user.id!) ?? false,
                roll: record?.permissions.rollUsers.includes(user.id!) ?? false,
            }));

        const visibility = record?.permissions.visibility ?? 'gmAndOwner';
        context.visibilityOptions = (['public', 'gmAndOwner', 'selectedUsers', 'gmOnly'] as ExtendedTestVisibility[]).map(value => ({
            value,
            label: game.i18n.localize(`SR5.ExtendedTestManager.Visibility.${value}` as Parameters<typeof game.i18n.localize>[0]),
            selected: visibility === value,
        }));

        return context;
    }

    static async #onSubmit(this: ExtendedTestConfigDialog, event: Event | SubmitEvent, form: HTMLFormElement, formData: foundry.applications.ux.FormDataExtended) {
        const data = formData.object as Record<string, any>;

        const readUsers = (prefix: string): string[] =>
            Object.entries(data)
                .filter(([key, value]) => key.startsWith(`${prefix}.`) && value)
                .map(([key]) => key.slice(prefix.length + 1));

        const changes = {
            name: String(data.name ?? '').trim(),
            notes: String(data.notes ?? ''),
            actorUuid: String(data.actorUuid ?? '') || undefined,
            // Only one of the two is rendered: the starting pool while it still matters, the
            // accumulated hits once the record rolls from its snapshot. Don't zero the other.
            ...(data.dicePool === undefined ? {} : { dicePool: Math.max(Number(data.dicePool) || 0, 0) }),
            ...(data.accumulatedHits === undefined ? {} : { accumulatedHits: Math.max(Number(data.accumulatedHits) || 0, 0) }),
            threshold: Math.max(Number(data.threshold) || 0, 0),
            interval: {
                value: Math.max(Number(data['interval.value']) || 0, 0),
                unit: (data['interval.unit'] ?? 'minutes') as ExtendedIntervalUnit,
            },
            cumulativeModifier: Boolean(data.cumulativeModifier),
            advanceTimeOnRoll: Boolean(data.advanceTimeOnRoll),
            permissions: {
                visibility: (data.visibility ?? 'gmAndOwner') as ExtendedTestVisibility,
                visibleUsers: readUsers('visibleUsers'),
                editUsers: readUsers('editUsers'),
                rollUsers: readUsers('rollUsers'),
            },
        };

        if (this.#record) {
            await ExtendedTestFlow.update(this.#record.id, changes);
        } else {
            // New records are never snapshot backed, so the pool field is always present.
            await ExtendedTestFlow.create({ dicePool: 0, ...changes });
        }
    }

    static #onCancel(this: ExtendedTestConfigDialog, event: Event) {
        event.preventDefault();
        void this.close();
    }

    protected override _onClose(options: Parameters<ApplicationV2['_onClose']>[0]) {
        this.#resolve?.();
        return super._onClose(options);
    }
}
