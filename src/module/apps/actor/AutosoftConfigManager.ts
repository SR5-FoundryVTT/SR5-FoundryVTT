import { DeepPartial } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5 } from '@/module/config';
import { AutosoftType, ProgramSkill } from '@/module/types/item/Program';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

const { fromUuidSync } = foundry.utils;

export interface AutosoftConfigManagerContext extends HandlebarsApplicationMixin.RenderContext {
    autosoftType: AutosoftType;
    autosoftTypes: Record<string, string>;
    activeSkills: Record<string, string>;
    selectedSkill: ProgramSkill;
    targetActors: Array<{ uuid: string; name: string; img: string }>;
    selectedTargetActorUuid: string;
    targetWeapons: Array<{ uuid: string; name: string; img: string }>;
    selectedTargetWeaponUuid: string;
    targetModel: string;
    isTargeting: boolean;
    isModelRequired: boolean;
}

export class AutosoftConfigManager extends HandlebarsApplicationMixin(ApplicationV2)<AutosoftConfigManagerContext> {
    selectedTargetActorUuid = '';
    selectedTargetWeaponUuid = '';
    selectedAutosoftType: AutosoftType = '';
    selectedSkill: ProgramSkill = '';
    targetModel = '';

    constructor(
        private readonly sourceActor: SR5Actor,
        private readonly autosoftItem: SR5Item<'program'>,
        options = {}
    ) {
        super(options);
        const sys = autosoftItem.system;
        this.selectedAutosoftType = (sys.autosoftType as AutosoftType) || 'clearsight';
        this.selectedSkill = (sys.skill as ProgramSkill) || '';
        this.targetModel = sys.targetModel || '';
        this.selectedTargetWeaponUuid = sys.targetWeapon || '';

        // Default initial target actor or RCC device if available
        const masterUuid = sys.technology?.master || '';
        const rccDevices = this._getEligibleRccDevices();
        const targets = this._getEligibleTargetActors();
        if (masterUuid && (rccDevices.some(r => r.uuid === masterUuid) || targets.some(t => t.uuid === masterUuid))) {
            this.selectedTargetActorUuid = masterUuid;
        } else if (rccDevices.length > 0) {
            this.selectedTargetActorUuid = rccDevices[0].uuid ?? '';
        } else if (targets.length > 0) {
            this.selectedTargetActorUuid = targets[0].uuid ?? '';
        }
    }

    override get title() {
        return game.i18n.localize("SR5.AutosoftConfigManager.Title");
    }

    private _getEligibleRccDevices(): SR5Item<'device'>[] {
        if (this.sourceActor.isType('vehicle')) return [];
        return (this.sourceActor.itemsForType.get('device') ?? []).filter(
            (item): item is SR5Item<'device'> => item.isType('device') && item.system.category === 'rcc'
        );
    }

    private _getEligibleTargetActors(): SR5Actor<'vehicle'>[] {
        if (this.sourceActor.isType('vehicle')) {
            return [this.sourceActor];
        }

        return (game.actors as unknown as SR5Actor[]).filter((actor): actor is SR5Actor<'vehicle'> => {
            if (!actor.isType('vehicle') || actor.compendium) return false;
            return ActorOwnershipFlow._isOwnerOfActor(this.sourceActor, actor)
                || actor.getVehicleDriver()?.uuid === this.sourceActor.uuid
                || actor.master?.actorOwner?.uuid === this.sourceActor.uuid;
        });
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);
        context.autosoftType = this.selectedAutosoftType;
        context.autosoftTypes = SR5.autosoftTypes;
        context.activeSkills = SR5.activeSkills;
        context.selectedSkill = this.selectedSkill;
        context.targetModel = this.targetModel;

        const rccDevices = this._getEligibleRccDevices();
        const eligibleActors = this._getEligibleTargetActors();
        context.targetActors = [
            ...rccDevices.map(rcc => ({
                uuid: rcc.uuid ?? '',
                name: rcc.name || '',
                img: rcc.img || ''
            })),
            ...eligibleActors.map(a => ({
                uuid: a.uuid ?? '',
                name: a.name || '',
                img: a.img || ''
            }))
        ];
        context.selectedTargetActorUuid = this.selectedTargetActorUuid;

        // Populate weapons from selected target actor (or all eligible drones if an RCC is selected)
        const targetActorDoc = eligibleActors.find(a => a.uuid === this.selectedTargetActorUuid);
        if (targetActorDoc) {
            const weapons = targetActorDoc.itemsForType.get('weapon') ?? [];
            context.targetWeapons = weapons.map(w => ({
                uuid: w.uuid ?? '',
                name: w.name || '',
                img: w.img || ''
            }));
            if (context.targetModel === '') {
                const defaultModel = targetActorDoc.system.model || targetActorDoc.name || '';
                context.targetModel = defaultModel;
                this.targetModel = defaultModel;
            }
        } else {
            context.targetWeapons = eligibleActors.flatMap(a =>
                (a.itemsForType.get('weapon') ?? []).map(w => ({
                    uuid: w.uuid ?? '',
                    name: a.name ? `${w.name || ''} (${a.name})` : (w.name || ''),
                    img: w.img || ''
                }))
            );
        }
        context.selectedTargetWeaponUuid = this.selectedTargetWeaponUuid;

        context.isTargeting = this.selectedAutosoftType === 'targeting';
        context.isModelRequired = ['maneuvering', 'stealth', 'evasion'].includes(this.selectedAutosoftType);

        return context;
    }

    static async #saveConfig(this: AutosoftConfigManager, event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const targetDoc = this.selectedTargetActorUuid ? fromUuidSync(this.selectedTargetActorUuid) : null;
        const isRccTarget = targetDoc instanceof SR5Item && targetDoc.isType('device') && targetDoc.system.category === 'rcc';
        const masterVehicleDoc = targetDoc instanceof SR5Actor && targetDoc.isType('vehicle') ? targetDoc : null;
        const resolvedMasterUuid = isRccTarget
            ? this.selectedTargetActorUuid
            : (masterVehicleDoc?.system.master || this.autosoftItem.system.technology?.master || '');

        await this.autosoftItem.update({
            system: {
                autosoftType: this.selectedAutosoftType,
                skill: this.selectedSkill,
                targetModel: this.targetModel,
                targetWeapon: this.selectedTargetWeaponUuid,
                ...(resolvedMasterUuid ? { technology: { master: resolvedMasterUuid } } : {}),
            }
        });

        ui.notifications?.info(
            game.i18n.format("SR5.AutosoftConfigManager.Configured", { name: this.autosoftItem.name })
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

        root.querySelector<HTMLSelectElement>('[name="autosoftType"]')?.addEventListener('change', (e: Event) => {
            if (e.target instanceof HTMLSelectElement) {
                this.selectedAutosoftType = e.target.value as AutosoftType;
                void this.render();
            }
        });

        root.querySelector<HTMLSelectElement>('[name="skill"]')?.addEventListener('change', (e: Event) => {
            if (e.target instanceof HTMLSelectElement) {
                this.selectedSkill = e.target.value as ProgramSkill;
            }
        });

        root.querySelector<HTMLSelectElement>('[name="targetActorUuid"]')?.addEventListener('change', (e: Event) => {
            if (e.target instanceof HTMLSelectElement) {
                this.selectedTargetActorUuid = e.target.value;
                void this.render();
            }
        });

        root.querySelector<HTMLSelectElement>('[name="targetWeaponUuid"]')?.addEventListener('change', (e: Event) => {
            if (e.target instanceof HTMLSelectElement) {
                this.selectedTargetWeaponUuid = e.target.value;
            }
        });

        root.querySelector<HTMLInputElement>('[name="targetModel"]')?.addEventListener('input', (e: Event) => {
            if (e.target instanceof HTMLInputElement) {
                this.targetModel = e.target.value;
            }
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
            saveConfig: AutosoftConfigManager.#saveConfig,
            cancel: AutosoftConfigManager.#cancel,
        }
    }
}
