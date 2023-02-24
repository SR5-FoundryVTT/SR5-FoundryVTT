import { SR5Actor } from "../actor/SR5Actor";
import { SYSTEM_NAME } from "../constants";
import { Helpers } from "../helpers";
import { ModifiableDocumentTypes, DocumentSituationModifiers } from "../rules/DocumentSituationModifiers";

import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;


interface SituationalModifiersTemplateData extends FormApplication.Data<{}> {
    targetType: string
    targetName: string
    modifiers: DocumentSituationModifiers
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
     * Provide template data fields necessary for the extending modifier type to be added to a
     * general template data object.
     */
    getData(options?: object) {
        return {}
    };
    /**
     * Define what event listeners to register for the extending modifier type.
     */
    activateListeners(html: JQuery<HTMLElement>) {};
    /**
     * Define what token hud buttons to register for the extending modifier type.
     * 
     * NOTE: TypeScript doesn't support abstract static method definitions as of yet.
     */
    static addTokenHUDElements(modifierColumn: JQuery<HTMLElement>, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.error(`Shadowrun5e | Class ${this.constructor.name} must implement static method onRenderTokenHUD`);
    };
}

/**
 * Handle all sheet action for environmental modifiers.
 */
class EnvironmentalModifiersHandler extends ModifiersHandler {

    activateListeners(html: JQuery<HTMLElement>) {
        console.log(`Shadowrun5e | Registering modifier handler ${this.constructor.name} listeners`);
        $(html).find('button.env-modifier').on('click', this._handleModifierChange.bind(this));
    }

    static addTokenHUDElements(modifierColumn: JQuery<HTMLElement>, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Environmental modifier HUD on renderTokenHUD`);

        // Setup and connect tokenHUD elements.
        const modifier = $('<div class="modifier-row"></div>');
        const modifierValue = $(`<div class="modifier-value modifier-value-matrix">${modifiers.environmental.applied.total}</div>`);
        const modifierDescription = $(`<div class="modifier-description open-matrix-modifier">${game.i18n.localize("SR5.ModifierTypes.Environmental")}</div>`);
        modifierDescription.on('click', SituationModifiersApplication.openForTokenHUD(tokenId, 'environmental'));

        modifierColumn.append(modifier);
        modifier.append(modifierValue);
        modifier.append(modifierDescription);
    }

    async _handleModifierChange(event: Event) {
        event.preventDefault();

        // Retrieve data from HTML datasets.
        const element = event.currentTarget as HTMLElement;
        if (!element.dataset.category || !element.dataset.value) return;

        const category = element.dataset.category as keyof EnvironmentalModifierCategories;
        const value = Number(element.dataset.value);

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
    getData(options?: object | undefined) {
        return {}
    }

    activateListeners(html: JQuery<HTMLElement>) {
    }

    static addTokenHUDElements(modifierColumn: JQuery<HTMLElement>, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Matrix modifier HUD on renderTokenHUD`);

        // Setup and connect tokenHUD elements.
        const modifier = $('<div class="modifier-row"></div>');
        const modifierValue = $(`<div class="modifier-value modifier-value-matrix">${modifiers.noise.applied.total}</div>`);
        const modifierDescription = $(`<div class="modifier-description open-matrix-modifier">${game.i18n.localize("SR5.ModifierTypes.Noise")}</div>`);
        modifierDescription.on('click', SituationModifiersApplication.openForTokenHUD(tokenId, 'matrix'));

        modifierColumn.append(modifier);
        modifier.append(modifierValue);
        modifier.append(modifierDescription);
    }
}

class MagicModifiersHandler extends ModifiersHandler {
    getData(options?: object | undefined) {
        return {}
    }

    activateListeners(html: JQuery<HTMLElement>) {
        html.find('.remove-magical-from-target').on('click', this.handleClearMagicModifiers.bind(this));
    }

    static addTokenHUDElements(modifierColumn: JQuery<HTMLElement>, tokenId: string, actor: SR5Actor, modifiers: DocumentSituationModifiers): void {
        console.log(`${SYSTEM_NAME} | Magic modifier HUD on renderTokenHUD`);

        // Don't add awakend modifiers to token hud for mundane actors.
        if (!actor.isAwakened) return;

        // Setup and connect tokenHUD elements.
        const modifier = $('<div class="modifier-row"></div>');
        const modifierValue = $(`<div class="modifier-value modifier-value-magic">${modifiers.background_count.applied.total}</div>`);
        const modifierDescription = $(`<div class="modifier-description open-magic-modifier">${game.i18n.localize("SR5.ModifierTypes.BackgroundCount")}</div>`);
        modifierDescription.on('click', SituationModifiersApplication.openForTokenHUD(tokenId, 'magic'));

        modifierColumn.append(modifier);
        modifier.append(modifierValue);
        modifier.append(modifierDescription);
    }

    async handleClearMagicModifiers(event) {
        event.preventDefault();

        this.app.modifiers = await DocumentSituationModifiers.clearTypeOn(this.app.target, 'background_count');
        this.app.render();
    }
}


/**
 * Recoil Modifier is a physical combat modifier for Ranged Weapon Attacks.
 * 
 */
class RecoilModifiersHandler extends ModifiersHandler {
    getData(options?: object | undefined) {
        return {}
    }

    activateListeners(html: JQuery<HTMLElement>): void {
        html.find('.recoil-delta button').on('click', this.applyRecoilDelta.bind(this));
        html.find('button#modifiers-recoil-total').on('click', async event => {
            if (this.app.modifiers.documentIsScene) return;
            const actor = this.app.modifiers.document as SR5Actor;
            await actor.clearProgressiveRecoil();
            ui.notifications?.info('SR5.Infos.ResetProgressiveRecoil', {localize: true});

            this.app.render();
        })
    }

    /**
     * Apply actor system recoil data back to the actor.
     * 
     * A delta is a numerical difference to be applied onto the base value
     * 
     * This method is related to SituationModifierApplication#applyModifierDelta
     */
    async applyRecoilDelta(event) {
        event.preventDefault();

        if (!this.app.modifiers.documentIsActor) return;

        const actor = this.app.modifiers.document as SR5Actor;

        // Expect the element group to siblings.
        // Triggering DOMElement should contain the delta...
        const triggerElement = event.target;
        if (!triggerElement || !triggerElement.dataset.hasOwnProperty('delta')) 
            return console.error('Shadowrun5e | Expected a DOMElement with a different structure');

        const delta = Number(triggerElement.dataset['delta']);
        if (delta === 0) return;

        // Update source data and update display information.
        await actor.addRecoil(delta);

        this.app.modifiers.applyAll();
        this.app.render();
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
export class SituationModifiersApplication extends FormApplication {
    // Static Handlers contain the class references used for both static method calls and to setup the instance handlers.
    static _staticHandlers: typeof ModifiersHandler[] = [
        MatrixModifiersHandler, 
        MagicModifiersHandler,
        EnvironmentalModifiersHandler,
        RecoilModifiersHandler
    ];
    // The default sheet tab to open.
    static _defaultTabId: string = 'physical';
    
    // Manage modifiers stored on this target document. This might not be the document meant for those modifiers to be applied to.
    // While a scene can store modifiers, actors have them applied
    target: ModifiableDocumentTypes
    // The modifiers as stored onto the target document.
    modifiers: DocumentSituationModifiers
    // Instance handlers contain all functionality for modifier categories as not to clutter the general application.
    handlers: ModifiersHandler[]

    constructor(target: ModifiableDocumentTypes) {
        super(target);
        
        this.target = target;
        this.modifiers = this._getModifiers();
        this.handlers = this._prepareHandlers();
    }

    /**
     * Prepare all handlers used for the different modifer categories.
     */
    _prepareHandlers(): ModifiersHandler[] {
        //@ts-ignore The implementing class is used, not the abstract one.
        return SituationModifiersApplication._staticHandlers.map(staticHandler => new staticHandler(this));
    }

    get template() {
        return 'systems/shadowrun5e/dist/templates/apps/situational-modifiers.hbs';
    }

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = ['sr5'];
        options.id = 'situational-modifiers-application';
        options.title = game.i18n.localize('SR5.SituationalModifiersApplication.Title');

        //@ts-ignore
        options.width = 'auto';
        options.height = 'auto';
        options.resizable = false;

        options.tabs = [
            {
                navSelector: '.tabs',
                contentSelector: '.sheetbody',
                initial: SituationModifiersApplication._defaultTabId
            },
        ];

        options.submitOnChange = true;
        options.closeOnSubmit = false;

        return options;
    }

    async getData(options?: any): Promise<SituationalModifiersTemplateData> {
        // Update all modifiers before displaying.
        this.modifiers.applyAll();

        return {
            ...await super.getData(options),
            
            targetType: this._targetTypeLabel,
            targetName: this.target.name || 'Unkown target',

            modifiers: this.modifiers,
            environmentalLevels: this.modifiers.environmental.levels
        }
    }

    activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        this.handlers.forEach(handler => handler.activateListeners(html));

        html.find('.modifier-delta button').on('click', this.applyModifierDelta.bind(this));
        html.find('.remove-modifiers-from-target').on('click', this.clearModifierData.bind(this));
        html.find('.remove-token-modifiers-from-scene').on('click', this.clearTokenModifiersData.bind(this));
    }

    /**
     * Apply a formData change based on a custom numerical input element.
     */
    async applyModifierDelta(event) {
        event.preventDefault();

        // Expect the element group to siblings.
        // Triggering DOMElement should contain the delta...
        const triggerElement = event.target;
        if (!triggerElement || !triggerElement.dataset.hasOwnProperty('delta')) 
            return console.error('Shadowrun5e | Expected a DOMElement with a different structure');

        const delta = Number(triggerElement.dataset['delta']);
        if (delta === 0) return;

        // Value DOMElement should contain the data key...
        const valueElement = $(triggerElement).siblings().closest('input');
        if (!valueElement || !valueElement.attr('name')) 
            return console.error('Shadowrun5e | Expected a DOMElement with a name attribute');

        // Extract value from data using value DOMElement data key...
        const sourceKey = valueElement.attr('name') as string;
        const appliedKey = sourceKey.includes('source') ? sourceKey.replace('source', 'applied') : sourceKey;

        const currentValue = foundry.utils.getProperty(this, appliedKey) ?? 0;
        if (isNaN(currentValue)) 
            return console.error('Shadowrun5e | Expected data property is not a number', sourceKey, currentValue);
            
        const value = currentValue + delta;

        const formData = {
            [sourceKey]: value
        }
        
        // Update source data and update display information.
        await this._updateObject(event, formData);
        this.modifiers.applyAll();

        this.render();
    }

    /**
     * Clear all modifiers from this document
     */
    async clearModifierData() {
        await this.modifiers.clearAll();
        this.render(true);
    }

    /**
     * Clear all modifiers from all tokens on this scene.
     */
    async clearTokenModifiersData() {
        await this.modifiers.clearAllTokensOnScene();
        this.render(true);
    }

    async _updateObject(event: Event, formData?: object | undefined): Promise<void> {
            if (!formData) return;

            for (const [key, value] of Object.entries(formData)) {
                foundry.utils.setProperty(this, key, value);
            }

            // Save source selection
            await DocumentSituationModifiers.setDocumentModifiers(this.target, this.modifiers.source);
    }

    /**
     * Override _onChangeInput to include a render on changing modifier values.
     */
    async _onChangeInput(event) {
        await super._onChangeInput(event);
        this.render(true);
    }

    _getModifiers(): DocumentSituationModifiers {
        return DocumentSituationModifiers.fromDocument(this.target);
    }

    get _targetTypeLabel(): string {
        if (this.target instanceof Scene) {
            return game.i18n.localize('DOCUMENT.Scene');
        }
        if (this.target instanceof SR5Actor) {
            return game.i18n.localize('DOCUMENT.Actor');
        }

        return '';
    }

    static getControl() {
        return {
            name: 'situational-modifiers-application',
            title: 'CONTROLS.SR5.SituationalModifiers',
            icon: 'fas fa-list',
            onClick: SituationModifiersApplication.openForCurrentScene,
            button: true
        }
    }

    // TODO: Implement system wide token HUD management...
    /**
     * Add buttons to both show and open global modifiers currently applied to this token when showing the
     * tokenHUD.
     */
    static onRenderTokenHUD(app: TokenHUD, html: JQuery, data: any) {
        if (!data._id) return;

        // Generate general structure for ModifierHandlers to connect to.
        const token = Helpers.getToken(data._id);
        if (!token) return;

        const actor = token.actor as SR5Actor;
        const modifiers = actor.getSituationModifiers();
        modifiers.applyAll();

        // Setup and connect tokenHUD elements.
        const container = $('<div class="col far-right sr-modifier-container"></div>');
        const column = $('<div class="col modifier-column"></div>');

        container.append(column);

        // Connect SR-FoundryVTT tokenHUD elements to FoundryVTT tokenHUD column structure.
        html.find('.col.right').after(container);

        // Hand DOM element over and let ModifierHandlers add their TokenHUDElments.
        SituationModifiersApplication._staticHandlers.forEach(handler => handler.addTokenHUDElements(column, data._id, actor, modifiers));
    }

    static openForCurrentScene() {
        if (!canvas || !canvas.ready || !canvas.scene) return;
        new SituationModifiersApplication(canvas.scene).render(true);
    }

    /** 
     * Part of the tokenHUD workflow makes it necessary to have the token id piped in
     * @param tokenId
     */
    static openForTokenHUD(tokenId: string, tab?: string) {
        const token = Helpers.getToken(tokenId);

        // When the token hud control is activated, this inline handler will be called with it.
        return async (event) => {
            event.preventDefault();

            if (!token || !token.actor) return;
            const app = new SituationModifiersApplication(token.actor);
            // Use async render as activateTab needs tabs to bind to rendered result.
            await app._render(true);
            //@ts-ignore
            // if (tab) app.activateTab(tab);
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
        app.render(true);
    }
}