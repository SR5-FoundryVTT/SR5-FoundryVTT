import {FLAGS, SR, SYSTEM_NAME} from "../constants";
import SituationModifiers = Shadowrun.SituationModifiers;
import EnvironmentalModifiers = Shadowrun.EnvironmentalModifiers;
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;

export class Modifiers {
    data: SituationModifiers;

    constructor(data: SituationModifiers) {
        // Fail gracefully for no modifiers given.
        // This can happen as Foundry returns empty objects for no flags set.
        if (!data || Object.keys(data).length === 0) {
            data = Modifiers.getDefaultModifiers();
        }

        this.data = data;
    }

    get hasActiveEnvironmental(): boolean {
        return Object.keys(this.data.environmental.active).length > 0;
    }

    get modifiers(): SituationModifiers {
        return this.data;
    }

    get environmental(): EnvironmentalModifiers {
        return this.data.environmental;
    }

    _setEnvironmentalCategoryActive(category: keyof EnvironmentalModifierCategories, level: number) {
        this.environmental.active[category] = level;
    }

    _setEnvironmentalCategoryInactive(category: keyof EnvironmentalModifierCategories) {
        delete this.environmental.active[category];
    }

    _disableEnvironmentalOverwrite() {
        this._setEnvironmentalCategoryInactive('value');
    }

    /** Actiavte a environmental modifier category (wind) with a value and recalculate the total modifier
     *
     * @param category
     * @param level
     */
    activateEnvironmentalCategory(category: keyof EnvironmentalModifierCategories, level: number) {
        console.error(category, level);
        if (!this._environmentalCategoryIsOverwrite(category)) {
            this._disableEnvironmentalOverwrite();
        }

        this._setEnvironmentalCategoryActive(category, level);
        this.calcEnvironmentalTotal();
        console.error(this.environmental);
    }

    calcEnvironmentalTotal() {
        // Manual selection will overwrite all else...
        if (this._hasActiveOverwriteModifier) {
            const modifier = this._activeEnvironmentalOverwrite;

            if (modifier === undefined) {
                console.error('An active overwrite modifier was returned as undefined');
                return;
            }

            this._resetEnvironmental();
            this._setOverwriteModifierAsActive(modifier);
            this._setEnvironmentalTotal(modifier);

        } else {
            // Calculation based on active modifier categories, excluding manual overwrite.
            const activeCategories = Object.entries(this.environmental.active).filter(([category, level]) => category !== 'value');
            // Should an active category miss a level set, ignore and fail gracefully.
            const activeLevels = activeCategories.map(([category, level]) => level ? level : 0);

            const count = this._countActiveModifierLevels(activeLevels);

            const modifiers = Modifiers.getEnvironmentalModifierLevels();

            if (count.extreme > 0 || count.heavy >= 2) {
                this._setEnvironmentalTotal(modifiers.extreme);
            }
            else if (count.heavy === 1 || count.moderate >= 2) {
                this._setEnvironmentalTotal(modifiers.heavy);
            }
            else if (count.moderate === 1 || count.light >= 2) {
                this._setEnvironmentalTotal(modifiers.moderate);
            }
            else if (count.light === 1) {
                this._setEnvironmentalTotal(modifiers.light);
            } else {
                this._setEnvironmentalTotal(modifiers.good);
            }
        }
    }

    _environmentalCategoryIsOverwrite(category: keyof EnvironmentalModifierCategories): boolean {
        return category === 'value';
    }

    _resetEnvironmental() {
        Object.keys(this.environmental.active).forEach(category => delete this.environmental.active[category]);
    }

    _setOverwriteModifierAsActive(value: number) {
        this._resetEnvironmental();
        this._setEnvironmentalCategoryActive('value', value);
    }

    _setEnvironmentalTotal(value: number) {
        this.environmental.total = value;
    }

    get _activeEnvironmentalOverwrite(): number|undefined {
        return this.modifiers.environmental.active.value;
    }

    get _hasActiveOverwriteModifier(): boolean {
        return this.environmental.active.value !== undefined;
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

    static getDefaultEnvironmentalModifiers(): EnvironmentalModifiers  {
        return {
            total: 0,
            active: {}
        }
    }

    static getDefaultModifiers(): SituationModifiers {
        return {
            environmental: Modifiers.getDefaultEnvironmentalModifiers()
        }
    }

    static getEnvironmentalModifierLevels(): EnvironmentalModifierLevels {
        return SR.combat.environmental.levels;
    }

    static async getModifiersFromEntity(entity: Entity): Promise<Modifiers> {
        const data = await entity.getFlag(SYSTEM_NAME, FLAGS.Modifier);
        return new Modifiers(data);
    }

    static async setModifiersOnEntity(entity: Entity, modifiers: SituationModifiers) {
        await entity.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await entity.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
    }
}