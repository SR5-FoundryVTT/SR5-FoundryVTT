export class EnvModifiersApplication extends Application {
    target: Entity;
    modifiers;

    constructor(target: Entity) {
        super();

        this.target = target;
        this.modifiers = {
            environmental: {
                total: 0,
                active: {
                    visibility: 0,
                    light: 0,
                    wind: 0,
                    range: 0,
                    value: 0,
                },
                // TODO: Is .value still needed here?
                levels: {
                    good: {value: 0},
                    light: {value: -1},
                    moderate: {value: -3},
                    heavy: {value: -6},
                    extreme: {value: -10},
                }

            }
        }

    }

    get template() {
        return 'systems/shadowrun5e/dist/templates/apps/env-modifiers.html';
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ['sr5', 'form-dialog'];
        options.id = 'env-modifiers-application';
        options.title = game.i18n.localize('SR5.EnvModifiersApplication.Title');
        options.width = 'auto';
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    getData(options?: object): any {
        const data = super.getData(options);

        console.error('getData', this.modifiers.environmental.active);

        data.modifiers = this.modifiers.environmental.levels;
        data.active = this.modifiers.environmental.active;
        data.total = this.modifiers.environmental.total;

        return data;
    }

    protected activateListeners(html: JQuery | HTMLElement) {
        $(html).find('button.env-modifier').on('click', this._handleModifierChange.bind(this));
    }

    async _handleModifierChange(event: Event) {
        event.preventDefault();
        const element = event.currentTarget as HTMLElement;

        if (!element.dataset.category || !element.dataset.value) return;

        const category = element.dataset.category;
        const value = Number(element.dataset.value);

        this._toggleActiveModifierCategory(category, value);
        this._calcActiveModifierTotal();

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
        return {
            light: values.reduce((count: number, value: number) => (value === this.modifiers.environmental.levels.light.value ? count + 1 : count), 0),
            moderate: values.reduce((count: number, value: number) => (value === this.modifiers.environmental.levels.moderate.value ? count + 1 : count), 0),
            heavy: values.reduce((count: number, value: number) => (value === this.modifiers.environmental.levels.heavy.value ? count + 1 : count), 0),
            extreme: values.reduce((count: number, value: number) => (value === this.modifiers.environmental.levels.extreme.value ? count + 1 : count), 0)
        }
    }

    // TODO: Move into separate shadowrun rule area
    _calcActiveModifierTotal() {
        console.error('calculation', this.modifiers.environmental.active);

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

        // TODO: Move this into a clean little function as to not burden the reader
        const count = this._countModifierValues(active);

        // TODO: Add typing to modifiers.env and remove ts-ignore
        //@ts-ignore
        if (count.extreme > 0 || count.heavy >= 2) {
            this.modifiers.environmental.total = this.modifiers.environmental.levels.extreme.value;
        }
        //@ts-ignore
        else if (count.heavy === 1 || count.moderate >= 2) {
            this.modifiers.environmental.total = this.modifiers.environmental.levels.heavy.value;
        }
        //@ts-ignore
        else if (count.moderate === 1 || count.light >= 2) {
            this.modifiers.environmental.total = this.modifiers.environmental.levels.moderate.value;
        }
        //@ts-ignore
        else if (count.light === 1) {
            this.modifiers.environmental.total = this.modifiers.environmental.levels.light.value;
        } else {
            this.modifiers.environmental.total = this.modifiers.environmental.levels.good.value;
        }
    }

    async storeModifiersOnTarget() {

    }

}