import { Helpers } from "../helpers";
import { SR5Actor } from "../actor/SR5Actor";
import { DeepPartial } from 'fvtt-types/utils';
import { SR5_APPV2_CSS_CLASS, SYSTEM_NAME } from "../constants";
import { ModifiableDocumentTypes, DocumentSituationModifiers } from "../rules/DocumentSituationModifiers";

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;


interface SituationalModifiersTemplateData extends HandlebarsApplicationMixin.RenderContext {
    targetType: string
    targetName: string
    modifiers: Record<string, unknown>
    environmentalLevels: EnvironmentalModifierLevels
}

/**
 * General abstract handler for sheet actions for a specific situational modifier category.
 */
class ModifiersHandler {
    app: SituationModifiersApplication

    constructor(situationModifiersApp: SituationModifiersApplication) {
        this.app = situationModifiersApp;
    }

    /**
     * Define what token hud buttons to register for the extending modifier type.
     * 
     * NOTE: TypeScript doesn't support abstract static method definitions as of yet.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static addTokenHUDElements(modifierColumn: HTMLElement, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.error(`Shadowrun5e | Class ${this.constructor.name} must implement static method onRenderTokenHUD`);
    };
}

/**
 * Handle all sheet action for environmental modifiers.
 */
class EnvironmentalModifiersHandler extends ModifiersHandler {

    static override addTokenHUDElements(modifierColumn: HTMLElement, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Environmental modifier HUD on renderTokenHUD`);

        // Setup and connect tokenHUD elements.
        const modifier = document.createElement('div');
        modifier.className = 'modifier-row';

        const modifierValue = document.createElement('div');
        modifierValue.className = 'modifier-value modifier-value-matrix';
        modifierValue.innerText = String(modifiers.environmental.applied.total);

        const modifierDescription = document.createElement('div');
        modifierDescription.className = 'modifier-description open-matrix-modifier';
        modifierDescription.innerText = game.i18n.localize('SR5.ModifierTypes.Environmental');
        modifierDescription.addEventListener('click', event => {
            void SituationModifiersApplication.openForTokenHUD(tokenId)(event);
        });

        modifier.append(modifierValue, modifierDescription);
        modifierColumn.append(modifier);
    }

    async _handleModifierChange(event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        // Retrieve data from HTML datasets.
        const element = target?.closest<HTMLElement>('button.env-modifier[data-category][data-value]')
            ?? (event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('button.env-modifier[data-category][data-value]') : null);
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


class MatrixModifiersHandler extends ModifiersHandler {
    static override addTokenHUDElements(modifierColumn: HTMLElement, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Matrix modifier HUD on renderTokenHUD`);

        // Setup and connect tokenHUD elements.
        const modifier = document.createElement('div');
        modifier.className = 'modifier-row';

        const modifierValue = document.createElement('div');
        modifierValue.className = 'modifier-value modifier-value-matrix';
        modifierValue.innerText = String(modifiers.noise.applied.total);

        const modifierDescription = document.createElement('div');
        modifierDescription.className = 'modifier-description open-matrix-modifier';
        modifierDescription.innerText = game.i18n.localize('SR5.ModifierTypes.Noise');
        modifierDescription.addEventListener('click', event => {
            void SituationModifiersApplication.openForTokenHUD(tokenId)(event);
        });

        modifier.append(modifierValue, modifierDescription);
        modifierColumn.append(modifier);
    }
}

class MagicModifiersHandler extends ModifiersHandler {
    static override addTokenHUDElements(modifierColumn: HTMLElement, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Magic modifier HUD on renderTokenHUD`);

        // Don't add awakened modifiers to token hud for mundane actors.
        if (!actor.isAwakened()) return;

        // Setup and connect tokenHUD elements.
        const modifier = document.createElement('div');
        modifier.className = 'modifier-row';

        const modifierValue = document.createElement('div');
        modifierValue.className = 'modifier-value modifier-value-magic';
        modifierValue.innerText = String(modifiers.background_count.applied.total);

        const modifierDescription = document.createElement('div');
        modifierDescription.className = 'modifier-description open-magic-modifier';
        modifierDescription.innerText = game.i18n.localize('SR5.ModifierTypes.BackgroundCount');
        modifierDescription.addEventListener('click', event => {
            void SituationModifiersApplication.openForTokenHUD(tokenId)(event);
        });

        modifier.append(modifierValue, modifierDescription);
        modifierColumn.append(modifier);
    }

    async handleClearMagicModifiers(event: Event) {
        event.preventDefault();

        this.app.modifiers = await DocumentSituationModifiers.clearTypeOn(this.app.target, 'background_count');
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
            ?? (event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-delta]') : null);
        if (!triggerElement || !Object.hasOwn(triggerElement.dataset, 'delta'))
            return console.error('Shadowrun5e | Expected a DOMElement with a different structure');

        const delta = Number(triggerElement.dataset['delta']);
        if (delta === 0) return;

        // Update source data and update display information.
        await actor.addRecoil(delta);

        this.app.modifiers.applyAll();
        await this.app.render();
    }

    static override addTokenHUDElements(modifierColumn: HTMLElement, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Recoil modifier HUD on renderTokenHUD`);

        // Setup and connect tokenHUD elements.
        const modifier = document.createElement('div');
        modifier.className = 'modifier-row';

        const modifierValue = document.createElement('div');
        modifierValue.className = 'modifier-value modifier-value-recoil';
        modifierValue.innerText = String(modifiers.recoil.applied.total);

        const modifierDescription = document.createElement('div');
        modifierDescription.className = 'modifier-description open-recoil-modifier';
        modifierDescription.innerText = game.i18n.localize('SR5.ModifierTypes.Recoil');
        modifierDescription.addEventListener('click', event => {
            void SituationModifiersApplication.openForTokenHUD(tokenId)(event);
        });

        modifier.append(modifierValue, modifierDescription);
        modifierColumn.append(modifier);
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
        MatrixModifiersHandler, 
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
    
    // Manage modifiers stored on this target document. This might not be the document meant for those modifiers to be applied to.
    // While a scene can store modifiers, actors have them applied
    target: ModifiableDocumentTypes
    // The modifiers as stored onto the target document.
    modifiers: DocumentSituationModifiers
    // Instance handlers contain all functionality for modifier categories as not to clutter the general application.
    handlers: ModifiersHandler[]

    constructor(target: ModifiableDocumentTypes, options = {}) {
        super(options);
        
        this.target = target;
        this.modifiers = this._getModifiers();
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
            environmentalLevels: this.modifiers.environmental.levels
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

        if (!(event.currentTarget instanceof HTMLInputElement)) return;

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
            ?? (event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-delta]') : null);
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
        return DocumentSituationModifiers.fromDocument(this.target);
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
            onClick: SituationModifiersApplication.openForCurrentScene.bind(SituationModifiersApplication),
            button: true
        }
    }

    // TODO: Implement system wide token HUD management...
    /**
     * Add buttons to both show and open global modifiers currently applied to this token when showing the
     * tokenHUD.
     */
    static onRenderTokenHUD(
        _app: foundry.applications.hud.TokenHUD,
        html: HTMLElement,
        // On fvtt-types this is still a stub
        context: foundry.applications.hud.TokenHUD.RenderContext & { _id?: string },
        _options: foundry.applications.hud.TokenHUD.RenderOptions
    ) {
        if (!context._id) return;

        // Generate general structure for ModifierHandlers to connect to.
        const token = Helpers.getToken(context._id);
        if (!token) return;

        const actor = token.actor as SR5Actor;
        const modifiers = actor.getSituationModifiers();
        modifiers.applyAll();

        // Setup and connect tokenHUD elements.
        const container = document.createElement('div');
        container.className = 'col far-right sr-modifier-container';

        const column = document.createElement('div');
        column.className = 'col modifier-column';
        container.append(column);

        // Connect SR-FoundryVTT tokenHUD elements to FoundryVTT tokenHUD column structure.
        const rightColumn = html.querySelector<HTMLElement>('.col.right');
        if (!rightColumn) return;
        rightColumn.after(container);

        // Hand DOM element over and let ModifierHandlers add their TokenHUDElements.
        SituationModifiersApplication._staticHandlers.forEach(handler => handler.addTokenHUDElements(column, context._id!, actor, modifiers));
    }

    static openForCurrentScene() {
        if (!canvas || !canvas.ready || !canvas.scene) return;
        void new SituationModifiersApplication(canvas.scene).render({ force: true });
    }

    /** 
     * Part of the tokenHUD workflow makes it necessary to have the token id piped in
     * @param tokenId
     */
    static openForTokenHUD(tokenId: string) {
        const token = Helpers.getToken(tokenId);

        // When the token hud control is activated, this inline handler will be called with it.
        return async (event: Event) => {
            event.preventDefault();

            if (!token?.actor) return;
            const app = new SituationModifiersApplication(token.actor);
            await app.render({ force: true });
        }
    }

    /**
     * Open the application when the system registered keybinding has been pressed.
     * 
     * If the user is a player => open selection or character
     * If the user is a gm => open selection or scene
     */
    static openForKeybinding() {
        console.debug(`Shadowrun 5e | Trying to open ${this.name}`);

        let document: ModifiableDocumentTypes|null = null;

        const controlledActors = Helpers.getControlledTokenActors();
        // Only open on selection for a single token.
        if (controlledActors.length === 1) document = controlledActors[0];
        
        // For GMs try scene for no selection.
        if (!document && game.user?.isGM) {
            document = canvas.scene;
        } 

        // Try user character as last fallback.
        if (!document) {
            document = game.user?.character as SR5Actor;
        }

        if (!document) return console.debug(`Shadowrun 5e | ...aborting, as no suitable document could be found`);
        console.debug(`Shadowrun 5e | ...opening with document ${document.uuid}`, document);

        const app = new SituationModifiersApplication(document);
        // Force, as it may already be open.
        void app.render({ force: true });
    }
}
