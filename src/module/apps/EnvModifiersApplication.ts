import {SYSTEM_NAME} from "../constants";
import {Helpers} from "../helpers";
import {SR5Actor} from "../actor/SR5Actor";
import {Modifiers} from "../sr5/Modifiers";
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;
import SituationModifiers = Shadowrun.SituationModifiers;

export type EnvModifiersTarget = Scene|SR5Actor;

/** Helper window for easy overview and selection of environmental modifiers and their calculated total.
 *
 */
// TODO: Call / receive an 'update token' hook to propagate changes immediately.
// TODO: Add env modifier button to token context menu
// TODO: Add env modifier button to scene context menu
// TODO: Show Scene modifier total in token app
// TODO: Modifiers target hierarchy
// TODO: Give a input to display meters for an active weapon in the range column
// TODO: Toggle display of the range column (scene type)
// TODO: Update display for all users when a change is made
export class EnvModifiersApplication extends Application {
    target: EnvModifiersTarget;
    modifiers: Modifiers;

    constructor(target: EnvModifiersTarget) {
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
        options.width = 'auto'; // auto is important for differing i18n text length.
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    async getData(options?: object): Promise<any> {
        const data = super.getData(options);

        this.modifiers = await this._getModifiers();

        data.active = this.modifiers.environmental.active;
        data.total = this.modifiers.environmental.total;

        data.levels = Modifiers.getEnvironmentalModifierLevels();

        data.targetType = this._getTargetTypeLabel();
        data.targetName = this.target.name;
        data.disableForm = this._disableInputsForUser();

        return data;
    }

    protected activateListeners(html: JQuery | HTMLElement) {
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

        await this.render();
    }

    async _handleRemoveModifiersFromTarget(event: Event) {
        event.preventDefault();

        await this.clearModifiersOnTarget();

        await this.render();
    }

    /**
     */
    _toggleActiveModifierCategory(category: keyof EnvironmentalModifierCategories, level: number) {
        this.modifiers.toggleEnvironmentalCategory(category, level);
    }

    async _getModifiers(): Promise<Modifiers> {
        return await Modifiers.getModifiersFromEntity(this.target);
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
        const modifiers = await Modifiers.getModifiersFromEntity(this.target);
        return !!modifiers.environmental;
    }

    async clearModifiersOnTarget() {
        this.modifiers = await Modifiers.clearEnvironmentalOnEntity(this.target);
    }

    _getTargetTypeLabel(): string {
        if (this.target instanceof Scene) {
            return game.i18n.localize('ENTITY.Scene');
        }
        if (this.target instanceof SR5Actor) {
            return game.i18n.localize('ENTITY.Actor');
        }

        return '';
    }

    /** Only allow interactions for user with appropriate permissions
     *
     */
    _disableInputsForUser(): boolean {
        const entity = this.target instanceof SR5Actor ? this.target : this.target;
        return !(game.user.isGM || entity.owner);
    }

    static async openForCurrentScene() {
        if (!canvas.scene) return;
        await new EnvModifiersApplication(canvas.scene).render(true);
    }

    // TODO: Check if tokenId is giveen via hook data
    static openForTokenHUD(tokenId: string) {
        const token = Helpers.getToken(tokenId);

        // Create an anonymous event handler
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

    static addTokenHUDFields(app: TokenHUD, html: JQuery, data) {
        console.log(`${SYSTEM_NAME} | Environmental Modifier HUD on renderTokenHUD`);

        // TODO: Implement system wide token HUD management...
        // let srTokenHUD = $('<div class="sr5-token-hud-container">Test</div>');
        const controlIcon = $('<div class="control-icon sr5-environmental-modifier"><i class="fas fa-list" title="Environmental Modifiers"></i></div>');
        html.find('.control-icon.combat').after(controlIcon);
        html.find('.sr5-environmental-modifier').on('click', EnvModifiersApplication.openForTokenHUD(data._id));
    }
}