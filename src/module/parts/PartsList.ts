import { ModifiableValueType } from "../types/template/Base";

/**
 * A class for managing a list of named parts with generic values.
 * This class provides methods for adding, removing, and querying parts,
 * as well as calculating the total of numerical parts.
 */
export class PartsList<Field extends ModifiableValueType = ModifiableValueType> {
    private readonly _field: Field;

    get changes() {
        return this._field.changes;
    }

    constructor(field: Field) {
        this._field = field;
    }

    private _markPreviousChangesMasked(currentIndex: number): void {
        for (let i = 0; i < currentIndex; i++) {
            if (!this._field.changes[i].applied) continue;
            this._field.changes[i].masked = true;
        }
    }

    private _createPartChange(
        name: string,
        value: number,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority = 0
    ) {
        return { name, value, mode, priority, masked: false, applied: true };
    }

    /**
     * Finds and returns the value of the first part with a matching name.
     * @param name The name of the part to find.
     * @returns The part's value, or undefined if not found.
     */
    getPartValue(name: string) {
        return this._field.changes.find(part => part.name === name)?.value;
    }

    /**
     * Adds a new part to the list.
     */
    addPart(...args: Parameters<PartsList["_createPartChange"]>): void {
        this._field.changes.push(this._createPartChange(...args));
    }

    addBasePart(name: string, value: number): void {
        return this.addPart(name, value, CONST.ACTIVE_EFFECT_MODES.ADD, -Infinity);
    }

    /**
     * Adds a part with a unique name, optionally overwriting an existing one.
     */
    addUniquePart(
        name: string,
        value: number | undefined | null,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority: number = 0,
    ): void {
        const index = this._field.changes.findIndex(part => part.name === name);

        if (value != null) {
            const newPart = this._createPartChange(name, value, mode, priority);
            if (index !== -1) {
                newPart.masked = this._field.changes[index].masked;
                newPart.applied = this._field.changes[index].applied;

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

    addUniqueBasePart(name: string, value: number | undefined | null): void {
        return this.addUniquePart(name, value, CONST.ACTIVE_EFFECT_MODES.ADD, -Infinity);
    }

    removePart(name: string): void {
        this._field.changes = this._field.changes.filter(part => part.name !== name);
    }

    calcTotal(options?: { min?: number; max?: number }): number {
        this._field.value = this._field.base;

        this._field.changes.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < this._field.changes.length; i++) {
            const change = this._field.changes[i];
            change.masked = false;

            if (!change.applied) continue;

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
                        change.masked = true;
                    }
                    break;
                case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
                    if (this._field.value > change.value) {
                        this._field.value = change.value;
                        this._markPreviousChangesMasked(i);
                    } else {
                        change.masked = true;
                    }
                    break;
                default:
                    console.warn(`Unknown Active Effect mode ${change.mode} encountered.`);
                    break;
            }
        }

        this.removePart('SR5.EnforcedMaximum');
        if (options?.max != null && this._field.value > options.max) {
            this._markPreviousChangesMasked(this._field.changes.length);
            this.addUniquePart('SR5.EnforcedMaximum', options.max, CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, Infinity);
            this._field.value = options.max;
        }

        this.removePart('SR5.EnforcedMinimum');
        if (options?.min != null && this._field.value < options.min) {
            this._markPreviousChangesMasked(this._field.changes.length);
            this.addUniquePart('SR5.EnforcedMinimum', options.min, CONST.ACTIVE_EFFECT_MODES.UPGRADE, Infinity);
            this._field.value = options.min;
        }

        // SR5#78 - All values are rounded up
        this._field.value = Math.ceil(this._field.value);

        return this._field.value;
    }

    static isModifiableValue(list: any): list is ModifiableValueType {
        const keys = ['base', 'changes', 'value'] satisfies ReadonlyArray<keyof ModifiableValueType>;
        return typeof list === 'object' && keys.every(key => Object.hasOwn(list, key));
    }

    static addPart<F extends ModifiableValueType>(
        list: F, ...args: Parameters<PartsList<F>["addPart"]>
    ): void {
        new PartsList(list).addPart(...args);
    }

    static addBasePart<F extends ModifiableValueType>(
        list: F, ...args: Parameters<PartsList<F>["addBasePart"]>
    ): void {
        new PartsList(list).addBasePart(...args);
    }

    static addUniquePart<F extends ModifiableValueType>(
        list: F, ...args: Parameters<PartsList["addUniquePart"]>
    ): void {
        new PartsList(list).addUniquePart(...args);
    }

    static addUniqueBasePart<F extends ModifiableValueType>(
        list: F, ...args: Parameters<PartsList["addUniqueBasePart"]>
    ): void {
        new PartsList(list).addUniqueBasePart(...args);
    }

    static removePart<F extends ModifiableValueType>(
        list: F, ...args: Parameters<PartsList<F>["removePart"]>
    ): void {
        new PartsList(list).removePart(...args);
    }

    static calcTotal<F extends ModifiableValueType>(
        list: F, ...args: Parameters<PartsList<F>["calcTotal"]>
    ): number {
        return new PartsList(list).calcTotal(...args);
    }
}
