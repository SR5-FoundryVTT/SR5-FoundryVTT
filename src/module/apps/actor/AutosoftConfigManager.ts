import { DeepPartial } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5 } from '@/module/config';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

const { fromUuidSync } = foundry.utils;

export interface AutosoftConfigManagerContext extends HandlebarsApplicationMixin.RenderContext {
    item: SR5Item<'program'>;
    autosoftType: string;
    autosoftTypes: Record<string, string>;
    targetActors: Array<{ uuid: string; name: string; img: string }>;
    selectedTargetActorUuid: string;
    targetWeapons: Array<{ uuid: string; name: string; img: string }>;
    selectedTargetWeaponUuid: string;
    targetModel: string;
    isTargeting: boolean;
    isModelRequired: boolean;
}

export class AutosoftConfigManager extends HandlebarsApplicationMixin(ApplicationV2)<AutosoftConfigManagerContext> {
    selectedTargetActorUuid: string = '';
    selectedTargetWeaponUuid: string = '';
    selectedAutosoftType: string = '';
    targetModel: string = '';

    constructor(
        private readonly sourceActor: SR5Actor,
        private readonly autosoftItem: SR5Item<'program'>,
        options = {}
    ) {
        super(options);
        const sys = autosoftItem.system as any;
        this.selectedAutosoftType = sys.autosoftType || 'clearsight';
        this.targetModel = sys.targetModel || '';
        this.selectedTargetWeaponUuid = sys.targetWeapon || '';

        // Default initial target actor if available
        const targets = this._getEligibleTargetActors();
        if (targets.length > 0) {
            this.selectedTargetActorUuid = targets[0].uuid;
        }
    }

    override get title() {
        return game.i18n.localize("SR5.AutosoftConfigManager.Title");
    }

    private _getEligibleTargetActors(): SR5Actor[] {
        // Drones/vehicles owned by player
        return game.actors.contents.filter(actor => {
            return actor.isType('vehicle') && actor.isOwner;
        }) as SR5Actor[];
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);
        context.item = this.autosoftItem;
        context.autosoftType = this.selectedAutosoftType;
        context.autosoftTypes = SR5.autosoftTypes;
        context.targetModel = this.targetModel;

        const eligibleActors = this._getEligibleTargetActors();
        context.targetActors = eligibleActors.map(a => ({
            uuid: a.uuid,
            name: a.name || '',
            img: a.img || ''
        }));
        context.selectedTargetActorUuid = this.selectedTargetActorUuid;

        // Populate weapons from selected target actor
        const targetActorDoc = eligibleActors.find(a => a.uuid === this.selectedTargetActorUuid);
        if (targetActorDoc) {
            const weapons = targetActorDoc.items.filter(i => i.isType('weapon'));
            context.targetWeapons = weapons.map(w => ({
                uuid: w.uuid,
                name: w.name || '',
                img: w.img || ''
            }));
            if (context.targetModel === '' && targetActorDoc.name) {
                context.targetModel = targetActorDoc.name;
                this.targetModel = targetActorDoc.name;
            }
        } else {
            context.targetWeapons = [];
        }
        context.selectedTargetWeaponUuid = this.selectedTargetWeaponUuid;

        context.isTargeting = this.selectedAutosoftType === 'targeting';
        context.isModelRequired = ['maneuvering', 'stealth', 'evasion'].includes(this.selectedAutosoftType);

        return context;
    }

    static async #submitTransfer(this: AutosoftConfigManager, event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const targetActor = fromUuidSync(this.selectedTargetActorUuid) as SR5Actor | null;
        if (!targetActor) {
            ui.notifications?.warn(game.i18n.localize("SR5.AutosoftConfigManager.NoDrones"));
            return;
        }

        // Prepare item data for update & transfer
        const itemData = this.autosoftItem.toObject();
        (itemData.system as any).autosoftType = this.selectedAutosoftType;
        (itemData.system as any).targetModel = this.targetModel;
        (itemData.system as any).targetWeapon = this.selectedTargetWeaponUuid;

        // Create on target actor
        await targetActor.createEmbeddedDocuments('Item', [itemData]);

        // Delete from source actor if sourceActor exists and owns the item
        if (this.sourceActor && this.autosoftItem.actorOwner?.uuid === this.sourceActor.uuid) {
            await this.autosoftItem.delete();
        }

        ui.notifications?.info(
            `${this.autosoftItem.name} transferred to ${targetActor.name}`
        );

        await this.close();
    }

    static #cancel(this: AutosoftConfigManager, event: Event) {
        event.preventDefault();
        void this.close();
    }

    override async _onRender(
        context: DeepPartial<AutosoftConfigManagerContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        const root = this.element;

        root.querySelector<HTMLSelectElement>('[name="autosoftType"]')?.addEventListener('change', (e: any) => {
            this.selectedAutosoftType = e.target.value;
            void this.render();
        });

        root.querySelector<HTMLSelectElement>('[name="targetActorUuid"]')?.addEventListener('change', (e: any) => {
            this.selectedTargetActorUuid = e.target.value;
            void this.render();
        });

        root.querySelector<HTMLSelectElement>('[name="targetWeaponUuid"]')?.addEventListener('change', (e: any) => {
            this.selectedTargetWeaponUuid = e.target.value;
        });

        root.querySelector<HTMLInputElement>('[name="targetModel"]')?.addEventListener('input', (e: any) => {
            this.targetModel = e.target.value;
        });

        return super._onRender(context, options);
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('actor/apps/autosoft-config-manager/details')
        },
        footer: {
            template: SheetFlow.templateBase('actor/apps/autosoft-config-manager/footer')
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'autosoft-config-manager'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: 450,
        },
        window: {
            resizable: true,
        },
        actions: {
            submitTransfer: AutosoftConfigManager.#submitTransfer,
            cancel: AutosoftConfigManager.#cancel,
        }
    }
}
