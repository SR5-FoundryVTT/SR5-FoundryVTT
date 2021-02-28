import {FLAGS, SYSTEM_NAME} from "../constants";
import {Modifiers} from "../sr5/Modifiers";

export type EnvModifiersTarget = Scene|Token;

// TODO: Add ways of modifying different category levels by steps up / down (infrared) or to specific levels.
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
        // Toggle active on/off based on last value.
        if (this.modifiers.environmental.active[category] === value) {
            this.modifiers.environmental.active[category] = 0;
        } else {
            this.modifiers.environmental.active[category] = value;
        }

        // Remove manual value selection on category selection.
        if (category !== 'value') {
            this.modifiers.environmental.active['value'] = 0;
        }
    }

    resetActiveModifiers() {
        Object.keys(this.modifiers.environmental.active).forEach(category => this.modifiers.environmental.active[category] = 0);
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
    _calcActiveModifierTotal() {
        // Manual selection will overwrite all else...
        const manual = this.modifiers.environmental.active.value;
        if (manual !== 0) {
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