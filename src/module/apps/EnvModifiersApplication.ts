import {FLAGS, SYSTEM_NAME} from "../constants";
import {Helpers} from "../helpers";
import {SR5Actor} from "../actor/SR5Actor";
import {Modifiers} from "../sr5/Modifiers";
import SituationModifiers = Shadowrun.SituationModifiers;

export type EnvModifiersTarget = Scene|SR5Actor;

/** Helper window for easy overview and selection of environmental modifiers and their calculated total.
 *
 */
// TODO: Add ways of modifying different category levels by steps up / down (infrared) or to specific levels.
// TODO: Not editable mode for GM only enitities
// TODO: Set top row of modifiers to make sure it's CLEAR there is a modifier set, even if it's zero all the way
// TODO: Check template for hardcoded labels
// TODO: Add env modifier button to token context menu
// TODO: Add env modifier button to scene context menu
// TODO: Show Scene modifier total in token app
// TODO: Modifiers target hierarchy
// TODO: Give a input to display meters for an active weapon in the range column
// TODO: Toggle display of the range column (scene type)
// TODO: Update display for all users when a change is made
export class EnvModifiersApplication extends Application {
    target: EnvModifiersTarget;
    modifiers: SituationModifiers;

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

        // TODO: getData is a bit unreadable.
        // TODO: SheetData for EnvModifiersApplication typing?

        // Try target or fallback on default.
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

        const category = element.dataset.category;
        const value = Number(element.dataset.value);

        // Handle modifier calculation
        this._toggleActiveModifierCategory(category, value);
        this._calcActiveModifierTotal();

        await this._clearModifiersOnTargetForNoSelection();
        await this._storeModifiersOnTarget();

        await this.render();
    }

    async _handleRemoveModifiersFromTarget(event: Event) {
        event.preventDefault();

        await this.clearModifiersOnTarget();

        await this.render();
    }

    // TODO: Move into separate shadowrun rule area
    /**
     *
     * @param category
     * @param value
     */
    _toggleActiveModifierCategory(category: string, value: number) {
        if (this._modifierIsActive(category, value)) {
            this._setModifierAsInactive(category);
        } else if (category === 'value') {
          this._setOverwriteModifierAsActive(value);
        } else {
            this._setModifierAsActive(category, value);
        }

        // Remove the manual overwrite, when the level is derived from selection of individual modifiers.
        if (category !== 'value') {
            this._setOverwriteModifierAsInactive();
        }
    }

    _modifierIsActive(category: string, value: number): boolean {
        return this.modifiers.environmental.active[category] === value;
    }

    _setOverwriteModifierAsActive(value: number) {
        this._resetActiveModifiers();
        this._setModifierAsActive('value', value);
    }

    _setOverwriteModifierAsInactive() {
        this._setModifierAsInactive('value');
    }

    /** Only one category selection can be active at any time.
     *
     * @param category The environmental modifier category (wind, ...)
     * @param value The modifier value (-1, 0, 10)
     */
    _setModifierAsActive(category: string, value: number) {
         this.modifiers.environmental.active[category] = value;
    }

    /** Only one category selection can be active at any time.
     *
     * @param category The environmental modifier category (wind, ...)
     */
    _setModifierAsInactive(category: string) {
        // Remove the inactive category instead of setting it zero, as a zero modifier is a valid choice!
        delete this.modifiers.environmental.active[category];
    }

    _setTotal(value: number) {
        this.modifiers.environmental.total = value;
    }

    get _hasActiveOverwriteModifier(): boolean {
        return this.modifiers.environmental.active.value !== undefined;
    }

    _getActiveOverwriteModifier(): number|undefined {
        return this.modifiers.environmental.active.value;
    }

    _resetActiveModifiers() {
        Object.keys(this.modifiers.environmental.active).forEach(category => delete this.modifiers.environmental.active[category]);
    }

    /** Count the amount each level (modifier value) appears in the array of modifiers
     *
     * @param values Active environmental modifiers
     */
    _countActiveModifierLevels(values: Number[]) {
        const modifiers = Modifiers.getEnvironmentalModifierLevels();

        return {
            light: values.reduce((count: number, value: number) => (value === modifiers.light ? count + 1 : count), 0),
            moderate: values.reduce((count: number, value: number) => (value === modifiers.moderate ? count + 1 : count), 0),
            heavy: values.reduce((count: number, value: number) => (value === modifiers.heavy ? count + 1 : count), 0),
            extreme: values.reduce((count: number, value: number) => (value === modifiers.extreme ? count + 1 : count), 0)
        }
    }

    // TODO: Move into separate shadowrun rule area
    /** Active modifiers
     *
     */
    _calcActiveModifierTotal() {
        // Manual selection will overwrite all else...
        if (this._hasActiveOverwriteModifier) {
            const modifier = this._getActiveOverwriteModifier();

            if (modifier === undefined) {
                console.error('An active overwrite modifier was returned as undefined');
                return;
            }

            this._resetActiveModifiers();
            this._setOverwriteModifierAsActive(modifier);
            this._setTotal(modifier);

        } else {
            // Calculation based on active modifier categories, excluding manual overwrite.
            const activeCategories = Object.entries(this.modifiers.environmental.active).filter(([category, level]) => category !== 'value');
            // Should an active category miss a level set, ignore and fail gracefully.
            const activeLevels = activeCategories.map(([category, level]) => level ? level : 0);

            const count = this._countActiveModifierLevels(activeLevels);

            const modifiers = Modifiers.getEnvironmentalModifierLevels();

            if (count.extreme > 0 || count.heavy >= 2) {
                this._setTotal(modifiers.extreme);
            }
            else if (count.heavy === 1 || count.moderate >= 2) {
                this._setTotal(modifiers.heavy);
            }
            else if (count.moderate === 1 || count.light >= 2) {
                this._setTotal(modifiers.moderate);
            }
            else if (count.light === 1) {
                this._setTotal(modifiers.light);
            } else {
                this._setTotal(modifiers.good);
            }
        }
    }

    async _getModifiers() {
        if (await this._targetHasEnvironmentalModifiers()) {
            return await this._getModifiersFromTarget();
        } else {
            return Modifiers.getDefaultModifiers();
        }
    }

    async _getModifiersFromTarget() {
        return await this.target.getFlag(SYSTEM_NAME, FLAGS.Modifier);
    }

    async _storeModifiersOnTarget() {
        // TODO: Add modifier typing
        const modifiers = await this._getModifiers();

        modifiers.environmental = this.modifiers.environmental;

        // TODO: Ask league about unsetFlag behavoir...
        // NOTE: Check if JSON stringifier works or not.
        await this.target.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await this.target.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);

    }

    async _targetHasEnvironmentalModifiers() {
        const modifiers = await this._getModifiersFromTarget();
        return modifiers && modifiers.environmental;
    }

    /** Cleanup unused data in Entity flag.
     */
    async _clearModifiersOnTargetForNoSelection() {
        if (Object.keys(this.modifiers.environmental.active).length === 0) {
            await this.clearModifiersOnTarget();
        }
    }

    async clearModifiersOnTarget() {
        const modifiers = await this._getModifiersFromTarget();

        delete modifiers.environmental;

        await this.target.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await this.target.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
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

    static async openForActiveScene() {
        console.error(game.scenes.active);
        if (!game.scenes.active) return;
        await new EnvModifiersApplication(game.scenes.active).render(true);
    }

    // TODO: The premise between openForActiveScene and openForTokenHUD is vastly different, but both methods have the
    //       same naming scheme... Quite confusing
    static openForTokenHUD(tokenId: string) {
        const token = Helpers.getToken(tokenId);

        // Create an anonymous event handler
        return (event) => {
            event.preventDefault();

            if (!token || !token.actor) return;

            new EnvModifiersApplication(token.actor).render(true);
        }
    }

    /** Left side tool window control icon / interaction
     */
    static getControl() {
        return {
            name: 'environmental-modifiers-application',
            title: 'CONTROLS.SR5.EnvironmentalModifiers',
            icon: 'fas fa-list',
            onClick: EnvModifiersApplication.openForActiveScene,
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