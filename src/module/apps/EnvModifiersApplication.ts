import {FLAGS, SYSTEM_NAME} from "../constants";
import {Modifiers} from "../sr5/Modifiers";

export type EnvModifiersTarget = Scene|Token;

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
export class EnvModifiersApplication extends Application {
    target: EnvModifiersTarget;
    modifiers;

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
        this.modifiers = await this.getModifiers();

        data.active = this.modifiers.environmental.active;
        data.total = this.modifiers.environmental.total;

        data.levels = Modifiers.getEnvironmentalModifierLevels();

        data.targetType = this._getTargetTypeLabel();
        data.targetName = this.target.name;

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

        await this.clearModifiersOnTargetForNoSelection();
        await this.storeModifiersOnTarget();

        await this.render();
    }

    async _handleRemoveModifiersFromTarget(event: Event) {
        event.preventDefault();

        await this.clearModifiersOnTarget();

        await this.render();
    }

    // TODO: Move into separate shadowrun rule area
    _toggleActiveModifierCategory(category: string, value: number) {
        if (this._modifierIsActive(category, value)) {
            this._setModifierAsInactive(category);
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

    resetActiveModifiers() {
        Object.keys(this.modifiers.environmental.active).forEach(category => delete this.modifiers.environmental.active[category]);
    }

    /** Count the amount each value appears in the array of modifiers
     */
    _countModifierValues(values: Number[]) {
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
        const manual = this.modifiers.environmental.active.value;
        if (manual && manual !== 0) {
            this.resetActiveModifiers();
            this.modifiers.environmental.active.value = manual;
            this.modifiers.environmental.total = manual;

            return;
        }

        // Calculation based on active modifier categories, excluding manual selection (to avoid unexpected results)
        // TODO: Add typing to modifiers.env and remove local typing
        const active = Object.values(this.modifiers.environmental.active).filter(category => category !== 'value') as Number[];

        const count = this._countModifierValues(active);

        const modifiers = Modifiers.getEnvironmentalModifierLevels();

        // TODO: Add typing to modifiers.env and remove ts-ignore
        //@ts-ignore
        if (count.extreme > 0 || count.heavy >= 2) {
            this.modifiers.environmental.total = modifiers.extreme;
        }
        //@ts-ignore
        else if (count.heavy === 1 || count.moderate >= 2) {
            this.modifiers.environmental.total = modifiers.heavy;
        }
        //@ts-ignore
        else if (count.moderate === 1 || count.light >= 2) {
            this.modifiers.environmental.total = modifiers.moderate;
        }
        //@ts-ignore
        else if (count.light === 1) {
            this.modifiers.environmental.total = modifiers.light;
        } else {
            this.modifiers.environmental.total = modifiers.good;
        }
    }

    async getModifiers() {
        if (await this.targetHasEnvironmentalModifiers()) {
            return await this.getModifiersFromTarget();
        } else {
            return Modifiers.getDefaultModifiers();
        }
    }

    async getModifiersFromTarget() {
        return await this.target.getFlag(SYSTEM_NAME, FLAGS.Modifier);
    }

    async storeModifiersOnTarget() {
        // TODO: Add modifier typing
        const modifiers = await this.getModifiersFromTarget();

        modifiers.environmental = this.modifiers.environmental;

        // TODO: Ask league about unsetFlag behavoir...
        // NOTE: Check if JSON stringifier works or not.
        await this.target.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await this.target.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);

    }

    async targetHasEnvironmentalModifiers() {
        const modifiers = await this.getModifiersFromTarget();
        return modifiers && modifiers.environmental;
    }

    /** Cleanup unused data in Entity flag.
     */
    async clearModifiersOnTargetForNoSelection() {
        if (Object.keys(this.modifiers.environmental.active).length === 0) {
            await this.clearModifiersOnTarget();
        }
    }

    async clearModifiersOnTarget() {
        const modifiers = await this.getModifiersFromTarget();

        delete modifiers.environmental;

        await this.target.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await this.target.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
    }

    _getTargetTypeLabel(): string {
        if (this.target instanceof Scene) {
            return game.i18n.localize('ENTITY.Scene');
        }
        if (this.target instanceof Token) {
            return game.i18n.localize('Token');
        }

        return '';
    }
}