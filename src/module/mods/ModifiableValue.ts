import { ModifiableValueType } from "../types/template/Base";

/**
 * A class for managing a list of named parts with generic values.
 * This class provides methods for adding, removing, and querying parts,
 * as well as calculating the total of numerical parts.
 */
export class ModifiableValue<Field extends ModifiableValueType = ModifiableValueType> {
    // Use finite sentinels so priorities survive chat flag serialization.
    static readonly LOWER_PRIORITY = Number.MIN_SAFE_INTEGER;
    static readonly TOP_PRIORITY = Number.MAX_SAFE_INTEGER;

    private readonly _field: Field;

    get changes() {
        return this._field.changes;
    }

    /**
     * Create a manager for a modifiable numeric field.
     * @param {Field} field - The field object containing `base`, `value`, and `changes`.
     */
    constructor(field: Field) {
        this._field = field;
    }

    /**
     * Get the numeric value of the first change matching `name`.
     * @param {string} name - The part name to find in `changes`.
     * @returns {number | undefined} The value of the found part, or `undefined` if not present.
     */
    get(name: string) {
        return this._field.changes.find(part => part.name === name)?.value;
    }

    /**
     * Adds a new part to the list.
     * @param {string} name - The change name.
     * @param {number} value - The numeric value for the change.
     * @param {CONST.ACTIVE_EFFECT_MODES} [mode=CONST.ACTIVE_EFFECT_MODES.ADD] - The change mode.
     * @param {number} [priority=10*mode] - Priority for ordering.
     */
    add(...args: Parameters<ModifiableValue["_createChange"]>): void {
        this._field.changes.push(this._createChange(...args));
    }

    /**
     * Add a base change (uses the lowest possible priority sentinel).
     * @param {string} name - The base change name.
     * @param {number} value - The base numeric value.
     */
    addBase(name: string, value: number): void {
        return this.add(name, value, CONST.ACTIVE_EFFECT_MODES.ADD, ModifiableValue.LOWER_PRIORITY);
    }

    /**
     * Adds a part with a unique name, overwriting an existing one with the same name.
     * @param {string} name - Unique name for the change.
     * @param {number | undefined | null} value - Value to set; if `null`/`undefined`, the entry will be removed.
     * @param {CONST.ACTIVE_EFFECT_MODES} [mode=CONST.ACTIVE_EFFECT_MODES.ADD] - Mode used when applying the change.
     * @param {number} [priority=10*mode] - Priority for ordering.
     */
    addUnique(
        name: string,
        value: number | undefined | null,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority: number = 10 * mode,
    ): void {
        const index = this._field.changes.findIndex(part => part.name === name);

        if (value != null) {
            const newPart = this._createChange(name, value, mode, priority);
            if (index !== -1) {
                newPart.enabled = this._field.changes[index].enabled;
                newPart.invalidated = this._field.changes[index].invalidated;

                this._field.changes[index] = newPart;
            } else {
                this._field.changes.push(newPart);
            }
        } else if (index === -1) {
            console.warn(`Shadowrun 5e | Cannot add a part with an undefined value. Part: ${name}`);
        } else {
            this._field.changes.splice(index, 1);
        }
    }

    /**
     * Add a unique base change (lowest possible priority sentinel).
     * @param {string} name - Name of the base change.
     * @param {number | undefined | null} value - Base value to set; if `null`/`undefined`, the entry will be removed.
     */
    addUniqueBase(name: string, value: number | undefined | null): void {
        return this.addUnique(name, value, CONST.ACTIVE_EFFECT_MODES.ADD, ModifiableValue.LOWER_PRIORITY);
    }

    /**
     * Add or remove a unique change based on the presence of a value.
     * If `value` is provided, it adds/updates the change;
     * if `value` is falsy, it removes the change with the given name.
     * @param {string} name - The name of the change to add or remove.
     * @param {number | undefined | null} value - The value to set for the change; if falsy, the change will be removed.
     * @param {CONST.ACTIVE_EFFECT_MODES} [mode=CONST.ACTIVE_EFFECT_MODES.ADD] - The mode to use when adding the change.
     * @param {number} [priority=10*mode] - The priority to use when adding the change.
     */
    setUnique(
        name: string,
        value: number | undefined | null,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority: number = 10 * mode,
    ): void {
        if (value) {
            this.addUnique(name, value, mode, priority);
        } else {
            this.remove(name);
        }
    }

    /**
     * Remove all changes with the given name.
     * @param {string} name - Name of the part to remove from `changes`.
     */
    remove(name: string): void {
        this._field.changes = this._field.changes.filter(part => part.name !== name);
    }

    /**
     * Calculate the total value by applying changes in priority order.
     * @param {{min?: number, max?: number}} [options] - Optional bounds to enforce on the final value.
     * @param {number} [options.min] - If provided, enforces a minimum value (adds an `SR5.EnforcedMinimum` change).
     * @param {number} [options.max] - If provided, enforces a maximum value (adds an `SR5.EnforcedMaximum` change).
     * @returns {number} The computed total (rounded up per SR5 rules).
     */
    calcTotal(options?: { min?: number; max?: number }): number {
        this._field.value = this._field.base;

        this._field.changes.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < this._field.changes.length; i++) {
            const change = this._field.changes[i];
            change.invalidated = false;

            if (!change.enabled) continue;

            switch (change.mode) {
                case CONST.ACTIVE_EFFECT_MODES.ADD:
                case CONST.ACTIVE_EFFECT_MODES.CUSTOM:
                    this._field.value += change.value;
                    break;
                case CONST.ACTIVE_EFFECT_MODES.MULTIPLY:
                    this._field.value *= change.value;
                    break;
                case CONST.ACTIVE_EFFECT_MODES.OVERRIDE:
                    this._field.value = change.value;
                    this._markPreviousChangesMasked(i);
                    break;
                case CONST.ACTIVE_EFFECT_MODES.UPGRADE:
                    if (this._field.value < change.value) {
                        this._field.value = change.value;
                        this._markPreviousChangesMasked(i);
                    } else {
                        change.invalidated = true;
                    }
                    break;
                case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
                    if (this._field.value > change.value) {
                        this._field.value = change.value;
                        this._markPreviousChangesMasked(i);
                    } else {
                        change.invalidated = true;
                    }
                    break;
                default:
                    console.warn(`Unknown Active Effect mode ${change.mode} encountered.`);
                    break;
            }
        }

        this.remove('SR5.EnforcedMaximum');
        if (options?.max != null && this._field.value > options.max) {
            this._markPreviousChangesMasked(this._field.changes.length);
            this.addUnique('SR5.EnforcedMaximum', options.max, CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, ModifiableValue.TOP_PRIORITY);
            this._field.value = options.max;
        }

        this.remove('SR5.EnforcedMinimum');
        if (options?.min != null && this._field.value < options.min) {
            this._markPreviousChangesMasked(this._field.changes.length);
            this.addUnique('SR5.EnforcedMinimum', options.min, CONST.ACTIVE_EFFECT_MODES.UPGRADE, ModifiableValue.TOP_PRIORITY);
            this._field.value = options.min;
        }

        // SR5#78 - All values are rounded up
        this._field.value = Math.ceil(this._field.value);

        return this._field.value;
    }

    /**
     * Create a change object.
     * @param {string} name - The change name/key.
     * @param {number} value - Numeric value for the change.
     * @param {CONST.ACTIVE_EFFECT_MODES} [mode=CONST.ACTIVE_EFFECT_MODES.ADD] - Mode for applying the change.
     * @param {number} [priority=10*mode] - Priority used to order changes.
     * @returns {ModifiableValueType['changes'][number]} A newly created change object.
     */
    private _createChange(
        name: string,
        value: number,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority = 10 * mode,
    ): ModifiableValueType['changes'][number] {
        return { name, value, mode, priority, invalidated: false, enabled: true, effectUuid: null };
    }

    /**
     * Mark all previously applied changes as masked up to `currentIndex` (exclusive).
     * @param {number} currentIndex - Index at which masking begins; previous indices will be masked.
     */
    private _markPreviousChangesMasked(currentIndex: number): void {
        for (let i = 0; i < currentIndex; i++) {
            if (!this._field.changes[i].enabled) continue;
            this._field.changes[i].invalidated = true;
        }
    }

    /**
     * Type-guard that checks whether `list` looks like a `ModifiableValueType`.
     * @param {any} list - The object to test for `base`, `changes`, and `value` keys.
     * @returns {list is ModifiableValueType} True when the object matches the shape of a ModifiableValueType.
     */
    static isModifiableValue(list: any): list is ModifiableValueType {
        const keys = ['base', 'changes', 'value'] satisfies ReadonlyArray<keyof ModifiableValueType>;
        return typeof list === 'object' && keys.every(key => Object.hasOwn(list, key));
    }

    /**
     * Returns true when a change is a base change.
     * @param {ModifiableValueType['changes'][number]} change - The change object to inspect (an element of `changes`).
     * @returns {boolean} True if the change is the base change.
     */
    static isBaseChange(change: ModifiableValueType['changes'][number]): boolean {
        return change.priority === ModifiableValue.LOWER_PRIORITY;
    }

    /**
     * Static helper to add a change to a `ModifiableValueType` list.
     * @template F
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `add` (name, value, mode, priority).
     */
    static add<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue<F>["add"]>
    ): void {
        new ModifiableValue(list).add(...args);
    }

    /**
     * Static helper to add a base change to a `ModifiableValueType` list.
     * @template F
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `addBase` (name, value).
     */
    static addBase<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue<F>["addBase"]>
    ): void {
        new ModifiableValue(list).addBase(...args);
    }

    /**
     * Static helper to add or update a unique change on the given list.
     * @template F
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `addUnique` (name, value, mode, priority).
     */
    static addUnique<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue["addUnique"]>
    ): void {
        new ModifiableValue(list).addUnique(...args);
    }

    /**
     * Static helper to add or update a unique base change on the given list.
     * @template F
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `addUniqueBase` (name, value).
     */
    static addUniqueBase<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue["addUniqueBase"]>
    ): void {
        new ModifiableValue(list).addUniqueBase(...args);
    }

    /**
     * Static helper to remove changes by name from the given list.
     * @template F
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `remove` (name).
     */
    static remove<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue<F>["remove"]>
    ): void {
        new ModifiableValue(list).remove(...args);
    }

    /**
     * Static helper to add or remove a unique change based on the presence of a value.
     * If `value` is provided, it adds/updates the change;
     * if `value` is falsy, it removes the change with the given name.
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `addOrRemoveUnique` (name, value).
     */
    static setUnique<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue<F>["setUnique"]>
    ): void {
        new ModifiableValue(list).setUnique(...args);
    }

    /**
     * Static helper to calculate the total for the given modifiable list.
     * @template F
     * @param {F} list - The modifiable list object.
     * @param {...any} args - Arguments forwarded to instance `calcTotal` (options).
     * @returns {number} The computed total value.
     */
    static calcTotal<F extends ModifiableValueType>(
        list: F, ...args: Parameters<ModifiableValue<F>["calcTotal"]>
    ): number {
        return new ModifiableValue(list).calcTotal(...args);
    }
}
