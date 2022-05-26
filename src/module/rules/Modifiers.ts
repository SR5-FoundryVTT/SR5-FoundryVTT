import {FLAGS, SR, SYSTEM_NAME} from "../constants";
import SituationModifiers = Shadowrun.SituationModifiers;
import EnvironmentalModifiers = Shadowrun.EnvironmentalModifiers;
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifierCategories = Shadowrun.EnvironmentalModifierCategories;
import {ModifiableDocumentTypes} from "../apps/EnvModifiersApplication";
import Modifier = Shadowrun.Modifier;

export class Modifiers {
    data: SituationModifiers;

    constructor(data: SituationModifiers|undefined) {
        // Fail gracefully for no modifiers given.
        // This can happen as Foundry returns empty objects for no flags set.
        if (!data || typeof data !== 'object' || !("environmental" in data)) {
            data = Modifiers.getDefaultModifiers();
        }

        // Duplicate data to avoid cross talk between different entities over different Modifier instances.
        // @ts-ignore
        this.data = duplicate(data);
    }

    get hasActiveEnvironmental(): boolean {
        return Object.keys(this.environmental.active).length > 0;
    }

    get modifiers(): SituationModifiers {
        return this.data;
    }

    set modifiers(modifiers: SituationModifiers) {
        this.data = modifiers;
    }

    /**
     *
     * @param type A string which SHOULD be of type ModifierTypes
     */
    getTotalForType(type: string): number {
        const modifier = this.modifiers[type] || {total: 0};
        return modifier.total;
    }

    get environmental(): EnvironmentalModifiers {
        return this.data.environmental;
    }

    set environmental(modifiers: EnvironmentalModifiers) {
        this.data.environmental = modifiers;
    }

    _matchingActiveEnvironmental(category: keyof EnvironmentalModifierCategories, level: number): boolean {
        return this.environmental.active[category] === level;
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
        if (!this._environmentalCategoryIsOverwrite(category)) {
            this._disableEnvironmentalOverwrite();
        }

        this._setEnvironmentalCategoryActive(category, level);
        this.calcEnvironmentalTotal();
    }

    toggleEnvironmentalCategory(category: keyof EnvironmentalModifierCategories, level: number) {
        if (this._matchingActiveEnvironmental(category, level)) {
            this._setEnvironmentalCategoryInactive(category);
        } else if (this._environmentalCategoryIsOverwrite(category)) {
            this._setEnvironmentalOverwriteActive(level);
        } else {
            this._setEnvironmentalCategoryActive(category, level);
        }

        // Remove a lingering overwrite if anything is set active.
        if (!this._environmentalCategoryIsOverwrite(category)) {
            this._setEnvironmentalOverwriteInactive();
        }

        this.calcEnvironmentalTotal();
    }

    calcEnvironmentalTotal() {
        // Manual selection will overwrite all else...
        if (this.hasActiveEnvironmentalOverwrite) {
            const modifier = this._activeEnvironmentalOverwrite;

            if (modifier === undefined) {
                console.error('An active overwrite modifier was returned as undefined');
                return;
            }

            this._resetEnvironmental();
            this._setEnvironmentalOverwriteActive(modifier);
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

    static async clearOnEntity(document: ModifiableDocumentTypes): Promise<Modifiers> {
        await document.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        return new Modifiers(Modifiers.getDefaultModifiers());
    }

    static async clearEnvironmentalOnEntity(document: ModifiableDocumentTypes): Promise<Modifiers> {
        const modifiers = await Modifiers.getModifiersFromEntity(document);

        modifiers.data.environmental = Modifiers.getDefaultEnvironmentalModifiers();

        await Modifiers.setModifiersOnEntity(document, modifiers.data);

        return modifiers;
    }

    _environmentalCategoryIsOverwrite(category: keyof EnvironmentalModifierCategories): boolean {
        return category === 'value';
    }

    _resetEnvironmental() {
        Object.keys(this.environmental.active).forEach(category => delete this.environmental.active[category]);
    }

    _setEnvironmentalOverwriteActive(value: number) {
        this._resetEnvironmental();
        this._setEnvironmentalCategoryActive('value', value);
    }

    _setEnvironmentalOverwriteInactive() {
        this._setEnvironmentalCategoryInactive('value');
    }

    _setEnvironmentalTotal(value: number) {
        this.environmental.total = value;
    }

    get _activeEnvironmentalOverwrite(): number|undefined {
        return this.modifiers.environmental.active.value;
    }

    get hasActiveEnvironmentalOverwrite(): boolean {
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

    static getDefaultModifier(): Modifier {
        return {
            total: 0
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

    static getModifiersFromEntity(document: ModifiableDocumentTypes): Modifiers {
        // It's possible for scene modifiers to chosen, while no scene is actually opened.
        // if (!document) return new Modifiers(Modifiers.getDefaultModifiers());

        const data = document.getFlag(SYSTEM_NAME, FLAGS.Modifier) as SituationModifiers;
        return new Modifiers(data);
    }

    static async setModifiersOnEntity(document: ModifiableDocumentTypes, modifiers: SituationModifiers) {
        // Removing unsetFlag causes strange update behaviour...
        // ...this behaviour has been observed at other updates on flags.
        await document.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await document.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
    }
}