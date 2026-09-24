import { Helpers } from "../helpers";
import { SR5Actor } from "../actor/SR5Actor";
import { DeepPartial } from 'fvtt-types/utils';
import { SR5_APPV2_CSS_CLASS } from "../constants";
import { ModifiableDocumentTypes, DocumentSituationModifiers } from "../rules/DocumentSituationModifiers";
import { isElementInstance } from '@/module/utils/dom';
import type { RegionalPhysicalEnvironment } from '@/module/vision/environmentalRegions/EnvironmentalRegionFlow';

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;


interface SituationalModifiersTemplateData extends HandlebarsApplicationMixin.RenderContext {
    targetType: string
    targetName: string
    modifiers: Record<string, unknown>
    environmentalLevels: EnvironmentalModifierLevels
    regionalModifiers: {
        noise: number
        background_count: number
        environmental: RegionalPhysicalEnvironment
    }
}

/**
 * General abstract handler for sheet actions for a specific situational modifier category.
 */
class ModifiersHandler {
    app: SituationModifiersApplication

    constructor(situationModifiersApp: SituationModifiersApplication) {
        this.app = situationModifiersApp;
    }
}

/**
 * Handle all sheet action for environmental modifiers.
 */
class EnvironmentalModifiersHandler extends ModifiersHandler {
    async _handleModifierChange(event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        // Retrieve data from HTML datasets.
        const element = target?.closest<HTMLElement>('button.env-modifier[data-category][data-value]')
            ?? (isElementInstance(event.target, HTMLElement) ? event.target.closest<HTMLElement>('button.env-modifier[data-category][data-value]') : null);
        if (!element) return;

        const categoryData = element.dataset.category;
        const valueData = element.dataset.value;
        if (!categoryData || !valueData) return;

        const category = categoryData as keyof EnvironmentalModifierCategories;
        const value = Number(valueData);

        this.app.modifiers.environmental.toggleSelection(category, value);
        await this.app.modifiers.updateDocument();

        await this.app.render();
    }

    async _handleRemoveModifiersFromTarget(event: Event) {
        event.preventDefault();

        this.app.modifiers.environmental.clear();
        await this.clearModifiersOnTarget();

        await this.app.render();
    }

    async clearModifiersOnTarget() {
        await DocumentSituationModifiers.clearTypeOn(this.app.target, 'environmental');
        // Refresh modifiers. This can be necessary for Actor targets without modifiers when Scene modifiers are present.
        this.app.modifiers = this.app._getModifiers();
    }
}

class MagicModifiersHandler extends ModifiersHandler {
    async handleClearMagicModifiers(event: Event) {
        event.preventDefault();

        this.app.modifiers = await DocumentSituationModifiers.clearTypeOn(
            this.app.target,
            'background_count',
            this.app.modifiers.sourceToken,
        );
        await this.app.render();
    }
}


/**
 * Recoil Modifier is a physical combat modifier for Ranged Weapon Attacks.
 * 
 */
class RecoilModifiersHandler extends ModifiersHandler {
    /**
     * Apply actor system recoil data back to the actor.
     * 
     * A delta is a numerical difference to be applied onto the base value
     * 
     * This method is related to SituationModifierApplication#applyModifierDelta
     */
    async applyRecoilDelta(event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.app.modifiers.documentIsActor) return;

        const actor = this.app.modifiers.document as SR5Actor;

        // Expect the element group to siblings.
        // Triggering DOMElement should contain the delta...
        const triggerElement = target?.closest<HTMLElement>('[data-delta]')
            ?? (isElementInstance(event.target, HTMLElement) ? event.target.closest<HTMLElement>('[data-delta]') : null);
        if (!triggerElement || !Object.hasOwn(triggerElement.dataset, 'delta'))
            return console.error('Shadowrun5e | Expected a DOMElement with a different structure');

        const delta = Number(triggerElement.dataset['delta']);
        if (delta === 0) return;

        // Update source data and update display information.
        await actor.addRecoil(delta);

        this.app.modifiers.applyAll();
        await this.app.render();
    }
}

/**
 * Give a GM and user access all situational modifiers.
 * 
 * A situational modifiers is anything that doesn't directly depend on the actor but what 'situation' that actor is in:
 * - matrix noise
 * - magic background noise
 * - environmental
 * - ...
 */
export class SituationModifiersApplication extends HandlebarsApplicationMixin(ApplicationV2)<SituationalModifiersTemplateData> {
    // Static Handlers contain the class references used for both static method calls and to setup the instance handlers.
    static _staticHandlers: typeof ModifiersHandler[] = [
        MagicModifiersHandler,
        EnvironmentalModifiersHandler,
        RecoilModifiersHandler
    ];
    // The default sheet tab to open.
    static _defaultTabId = 'physical';

    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/situational-modifiers.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        id: 'situational-modifiers-application',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'situational-modifiers-application'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            height: 'auto' as const,
        },
        window: {
            resizable: false,
        },
        actions: {
            applyModifierDelta(this: SituationModifiersApplication, event: Event, target: HTMLElement) {
                void this.applyModifierDelta(event, target);
            },
            applyRecoilDelta(this: SituationModifiersApplication, event: Event, target: HTMLElement) {
                const handler = this._getHandler(RecoilModifiersHandler);
                if (!handler) return;

                void handler.applyRecoilDelta(event, target);
            },
            clearModifierData(this: SituationModifiersApplication, event: Event) {
                event.preventDefault();
                event.stopPropagation();

                void this.clearModifierData();
            },
            clearTokenModifiersData(this: SituationModifiersApplication, event: Event) {
                event.preventDefault();
                event.stopPropagation();

                void this.clearTokenModifiersData();
            },
            toggleEnvironmentalModifier(this: SituationModifiersApplication, event: Event, target: HTMLElement) {
                const handler = this._getHandler(EnvironmentalModifiersHandler);
                if (!handler) return;

                void handler._handleModifierChange(event, target);
            },
        }
    }

    static open() {
        const target = this._getDefaultTarget();
        if (!target) {
            ui.notifications?.warn('Select a token, assign a character, or create a scene first.');
            return;
        }

        const sourceToken = target instanceof SR5Actor ? target.getToken() : null;
        void new SituationModifiersApplication(target, {}, sourceToken).render({ force: true });
    }
    
    // Manage modifiers stored on this target document. This might not be the document meant for those modifiers to be applied to.
    // While a scene can store modifiers, actors have them applied
    target: ModifiableDocumentTypes
    // The modifiers as stored onto the target document.
    modifiers: DocumentSituationModifiers
    // Instance handlers contain all functionality for modifier categories as not to clutter the general application.
    handlers: ModifiersHandler[]

    constructor(target: ModifiableDocumentTypes, options = {}, sourceToken?: TokenDocument | null) {
        super(options);
        
        this.target = target;
        this.modifiers = DocumentSituationModifiers.fromDocument(this.target, sourceToken);
        this.handlers = this._prepareHandlers();
    }

    override get title() {
        return game.i18n.localize('SR5.SituationalModifiersApplication.Title');
    }

    /**
     * Prepare all handlers used for the different modifier categories.
     */
    _prepareHandlers(): ModifiersHandler[] {
        return SituationModifiersApplication._staticHandlers.map(staticHandler => new staticHandler(this));
    }

    _getHandler<T extends ModifiersHandler>(handlerType: new (app: SituationModifiersApplication) => T): T | undefined {
        return this.handlers.find(handler => handler instanceof handlerType) as T | undefined;
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]): Promise<SituationalModifiersTemplateData> {
        // Update all modifiers before displaying.
        this.modifiers.applyAll();

        const baseData = await super._prepareContext(options);

        return {
            ...(baseData as HandlebarsApplicationMixin.RenderContext),

            targetType: this._targetTypeLabel,
            targetName: this.target.name || 'Unknown target',

            modifiers: this.modifiers as unknown as Record<string, unknown>,
            environmentalLevels: this.modifiers.environmental.levels,
            regionalModifiers: {
                noise: this.modifiers.regionalModifierFor('noise'),
                background_count: this.modifiers.regionalModifierFor('background_count'),
                environmental: this.modifiers.regional.physical,
            },
        };
    }

    override async _onRender(
        context: DeepPartial<SituationalModifiersTemplateData>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        this.element.querySelectorAll<HTMLInputElement>('input[name^="modifiers.source."]').forEach(input => {
            input.addEventListener('change', event => {
                void this._handleSourceInputChange(event);
            });
        });

        return super._onRender(context, options);
    }

    async _handleSourceInputChange(event: Event) {
        event.preventDefault();

        if (!isElementInstance(event.currentTarget, HTMLInputElement)) return;

        const sourceKey = event.currentTarget.name;
        if (!sourceKey) {
            return console.error('Shadowrun5e | Expected a DOMElement with a name attribute');
        }

        const currentValue = Number(event.currentTarget.value);
        if (isNaN(currentValue)) {
            return console.error('Shadowrun5e | Expected input value to be a number', sourceKey, event.currentTarget.value);
        }

        await this._applyFormData({ [sourceKey]: currentValue });

        this.modifiers.applyAll();
        await this.render();
    }

    /**
     * Apply a formData change based on a custom numerical input element.
     */
    async applyModifierDelta(event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        // Expect the element group to siblings.
        // Triggering DOMElement should contain the delta...
        const triggerElement = target?.closest<HTMLElement>('[data-delta]')
            ?? (isElementInstance(event.target, HTMLElement) ? event.target.closest<HTMLElement>('[data-delta]') : null);
        if (!triggerElement || !Object.hasOwn(triggerElement.dataset, 'delta'))
            return console.error('Shadowrun5e | Expected a DOMElement with a different structure');

        const delta = Number(triggerElement.dataset['delta']);
        if (delta === 0) return;

        // Value DOMElement should contain the data key...
        const valueElement = triggerElement
            .closest<HTMLElement>('.modifier-delta, .recoil-delta')
            ?.querySelector<HTMLInputElement>('input[name]');
        if (!valueElement?.name) 
            return console.error('Shadowrun5e | Expected a DOMElement with a name attribute');

        // Extract value from data using value DOMElement data key...
        const sourceKey = valueElement.name;
        const appliedKey = sourceKey.includes('source') ? sourceKey.replace('source', 'applied') : sourceKey;

        const currentValue = foundry.utils.getProperty(this, appliedKey) as number ?? 0;
        if (isNaN(currentValue)) 
            return console.error('Shadowrun5e | Expected data property is not a number', sourceKey, currentValue);

        const formData = {
            [sourceKey]: Number(currentValue) + delta
        }

        // Update source data and update display information.
        await this._applyFormData(formData);
        this.modifiers.applyAll();

        await this.render();
    }

    /**
     * Clear all modifiers from this document
     */
    async clearModifierData() {
        await this.modifiers.clearAll();
        await this.render();
    }

    /**
     * Clear all modifiers from all tokens on this scene.
     */
    async clearTokenModifiersData() {
        await this.modifiers.clearAllTokensOnScene();
        await this.render();
    }

    async _applyFormData(formData?: Record<string, unknown>): Promise<void> {
        if (!formData) return;

        for (const [key, value] of Object.entries(formData)) {
            foundry.utils.setProperty(this, key, value);
        }

        // Save source selection
        await DocumentSituationModifiers.setDocumentModifiers(this.target, this.modifiers.source);
    }

    _getModifiers(): DocumentSituationModifiers {
        return DocumentSituationModifiers.fromDocument(this.target, this.modifiers?.sourceToken);
    }

    get _targetTypeLabel(): string {
        if (this.target instanceof Scene) {
            return game.i18n.localize('SR5.FOUNDRY.Scene');
        }
        if (this.target instanceof SR5Actor) {
            return game.i18n.localize('SR5.FOUNDRY.Actor');
        }

        return '';
    }

    static getControl() {
        return {
            name: 'situational-modifiers-application',
            title: 'CONTROLS.SR5.SituationalModifiers',
            icon: 'fas fa-list',
            onChange: (_event: Event, active: boolean) => {
                if (!active) return;
                SituationModifiersApplication.open();
            },
            button: true
        }
    }

    static openForCurrentScene() {
        SituationModifiersApplication.open();
    }

    /**
     * Open the application when the system registered keybinding has been pressed.
     * 
     * If the user is a player => open selection or character
     * If the user is a gm => open selection or scene
     */
    static openForKeybinding() {
        SituationModifiersApplication.open();
    }

    static _getDefaultTarget(): ModifiableDocumentTypes | null {
        const controlledActors = Helpers.getControlledTokenActors();
        if (controlledActors.length === 1) return controlledActors[0];

        if (game.user?.isGM && canvas?.ready && canvas.scene) {
            return canvas.scene;
        }

        if (game.user?.character instanceof SR5Actor) {
            return game.user.character;
        }

        const firstActor = game.actors?.contents.find(actor => actor instanceof SR5Actor);
        return (firstActor as SR5Actor | undefined) ?? null;
    }
}
