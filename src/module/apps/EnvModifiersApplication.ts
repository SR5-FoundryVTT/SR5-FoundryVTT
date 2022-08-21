import {SYSTEM_NAME} from "../constants";
import {Helpers} from "../helpers";
import {SR5Actor} from "../actor/SR5Actor";
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;
import {Modifiers} from "../rules/Modifiers";

export type ModifiableDocumentTypes = SR5Actor | Scene;

/** Helper window for easy overview and selection of environmental modifiers and their calculated total.
 *
 */
export class EnvModifiersApplication extends Application {
    target: ModifiableDocumentTypes;
    modifiers: Modifiers;

    constructor(target: ModifiableDocumentTypes) {
        super();

        this.target = target;
    }

    get template() {
        return 'systems/shadowrun5e/dist/templates/apps/env-modifiers.html';
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ['sr5', 'form-dialog'];
        options.id = 'env-modifiers-application';
        options.title = game.i18n.localize('SR5.EnvModifiersApplication.Title');
        // @ts-ignore
        options.width = 'auto'; // auto is important for differing i18n text length.
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    async getData(options?: object): Promise<any> {
        const data = super.getData(options) as any;

        this.modifiers = await this._getModifiers();

        data.active = this.modifiers.environmental.active;
        data.total = this.modifiers.environmental.total;

        data.levels = Modifiers.getEnvironmentalModifierLevels();

        data.targetType = this._getTargetTypeLabel();
        data.targetName = this.target.name;
        data.disableForm = this._disableInputsForUser();

        return data;
    }

    activateListeners(html: JQuery | HTMLElement) {
        $(html).find('button.env-modifier').on('click', this._handleModifierChange.bind(this));
        $(html).find('button.remove-modifiers-from-target').on('click', this._handleRemoveModifiersFromTarget.bind(this));
    }

    async _handleModifierChange(event: Event) {
        event.preventDefault();

        // Handle data retrieval from HTML datasets.
        const element = event.currentTarget as HTMLElement;

        if (!element.dataset.category || !element.dataset.value) return;

        const category = element.dataset.category as keyof EnvironmentalModifierCategories;
        const value = Number(element.dataset.value);

        // Handle modifier calculation
        this._toggleActiveModifierCategory(category, value);

        await this._clearModifiersOnTargetForNoSelection();
        await this._storeModifiersOnTarget();

        this._updateTokenHUDTotalDisplay();

        await this.render();
    }

    /** Updates opened tokenHUD modifier values.
     *
     * Doing it this way is just easier as relying on any update / hook workflow.
     */
    _updateTokenHUDTotalDisplay() {
        if (this.target instanceof SR5Actor) {
            $('.modifier-value-environmental').each((index, element) => {
                $(element).html(this.modifiers.environmental.total.toString());
            });
        }
    }

    async _handleRemoveModifiersFromTarget(event: Event) {
        event.preventDefault();

        await this.clearModifiersOnTarget();

        this._updateTokenHUDTotalDisplay();

        await this.render();
    }

    /**
     */
    _toggleActiveModifierCategory(category: keyof EnvironmentalModifierCategories, level: number) {
        this.modifiers.toggleEnvironmentalCategory(category, level);
    }

    /** Return the modifiers that best match the current target type
     */
    async _getModifiers(): Promise<Modifiers> {
        // Actor targets might have no personal modifiers, but still see the scene modifiers then, and use those
        // as a template for their local modifiers.
        if (this.target instanceof SR5Actor) {
            return await this.target.getModifiers();
        }
        // All other types are handled without special cases.
        return Modifiers.getModifiersFromEntity(this.target);
    }

    async _storeModifiersOnTarget() {
        await Modifiers.setModifiersOnEntity(this.target, this.modifiers.data);
    }

    /** Cleanup unused data in Entity flag.
     */
    async _clearModifiersOnTargetForNoSelection() {
        if (!this.modifiers.hasActiveEnvironmental) {
            this.modifiers = await Modifiers.clearEnvironmentalOnEntity(this.target);
        }
    }

    async _targetHasEnvironmentalModifiers() {
        const modifiers = Modifiers.getModifiersFromEntity(this.target);
        return !!modifiers.environmental;
    }

    async clearModifiersOnTarget() {
        await Modifiers.clearEnvironmentalOnEntity(this.target);
        // Refresh modifiers. This can be necessary for Actor targets without modifiers when Scene modifiers are present.
        this.modifiers = await this._getModifiers();
    }

    _getTargetTypeLabel(): string {
        if (this.target instanceof Scene) {
            return game.i18n.localize('DOCUMENT.Scene');
        }
        if (this.target instanceof SR5Actor) {
            return game.i18n.localize('DOCUMENT.Actor');
        }

        return '';
    }

    /** Only allow interactions for user with appropriate permissions
     *
     */
    _disableInputsForUser(): boolean {
        if (!game.user) return false;
        return !(game.user?.isGM || this.target.testUserPermission(game.user, 'OWNER'));
    }

    static async openForCurrentScene() {
        if (!canvas || !canvas.ready || !canvas.scene) return;
        await new EnvModifiersApplication(canvas.scene).render(true);
    }

    /** Part of the tokenHUD workflow makes it necessary to have the token id piped in
     *
     * @param tokenId
     */
    static openForTokenHUD(tokenId: string) {
        const token = Helpers.getToken(tokenId);

        // When the token hud control is activated, this inline handler will be called with it.
        return async (event) => {
            event.preventDefault();

            if (!token || !token.actor) return;
            await new EnvModifiersApplication(token.actor).render(true);
        }
    }

    /** Left side tool window control icon / interaction
     */
    static getControl() {
        return {
            name: 'environmental-modifiers-application',
            title: 'CONTROLS.SR5.EnvironmentalModifiers',
            icon: 'fas fa-list',
            onClick: EnvModifiersApplication.openForCurrentScene,
            button: true
        }
    }

    // TODO: Implement system wide token HUD management...
    static async addTokenHUDFields(app: TokenHUD, html: JQuery, data) {
        if (!data._id) return;

        console.log(`${SYSTEM_NAME} | Environmental Modifier HUD on renderTokenHUD`);

        const token = Helpers.getToken(data._id);
        if (!token) return;

        const actor = token.actor as SR5Actor;
        const modifiers = await actor.getModifiers();

        // Setup and connect tokenHUD elements.
        const container = $('<div class="col far-right sr-modifier-container"></div>');
        const column = $('<div class="col modifier-column"></div>');
        const modifier = $('<div class="modifier-row"></div>');
        const modifierValue = $(`<div class="modifier-value modifier-value-environmental">${modifiers.environmental.total}</div>`);
        const modifierDescription = $(`<div class="modifier-description open-environmental-modifier">${game.i18n.localize("SR5.EnvironmentModifier")}</div>`);
        modifierDescription.on('click', EnvModifiersApplication.openForTokenHUD(data._id));

        container.append(column);
        column.append(modifier);
        modifier.append(modifierValue);
        modifier.append(modifierDescription);

        // Connect SR-FoundryVTT tokenHUD elements to FoundryVTT tokenHUD column structure.
        html.find('.col.right').after(container);
    }
}