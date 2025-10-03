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

    /**
     * Creates a new PartsList instance.
     * @param field An optional initial list of parts.
     */
    constructor(field: Field) {
        this._field = field;
    }

    // --- Core Functionality ---

    private _markPreviousChangesUnused(currentIndex: number): void {
        for (let i = 0; i < currentIndex; i++) {
            this._field.changes[i].unused = true;
        }
    }

    /**
     * Returns the sum of all numerical part values.
     * It safely handles non-numerical values by ignoring them.
     */
    public get total(): number {
        this._field.value = this._field.base;

        this._field.changes.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < this._field.changes.length; i++) {
            const change = this._field.changes[i];

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
                    this._markPreviousChangesUnused(i);
                    break;
                case CONST.ACTIVE_EFFECT_MODES.UPGRADE:
                    if (this._field.value < change.value) {
                        this._field.value = change.value;
                        this._markPreviousChangesUnused(i);
                    } else {
                        change.unused = true;
                    }
                    break;
                case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
                    if (this._field.value > change.value) {
                        this._field.value = change.value;
                        this._markPreviousChangesUnused(i);
                    } else {
                        change.unused = true;
                    }
                    break;
                default:
                    console.warn(`Unknown Active Effect mode ${change.mode} encountered.`);
                    break;
            }
        }

        return this._field.value;
    }

    /**
     * Finds and returns the value of the first part with a matching name.
     * @param name The name of the part to find.
     * @returns The part's value, or undefined if not found.
     */
    public getPartValue(name: string) {
        return this._field.changes.find(part => part.name === name)?.value;
    }

    // --- Mutators ---

    /**
     * Adds a new part to the list.
     */
    public addPart(
        name: string,
        value: number,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority = 0
    ): void {
        if (!value && (!mode || mode === CONST.ACTIVE_EFFECT_MODES.ADD)) return;

        this._field.changes.push({ mode, priority, unused: false, name, value });
    }

    /**
     * Adds a part with a unique name, optionally overwriting an existing one.
     */
    public addUniquePart(
        name: string,
        value: number,
        overwrite = true,
        mode: CONST.ACTIVE_EFFECT_MODES = CONST.ACTIVE_EFFECT_MODES.ADD,
        priority = 0,
    ): void {
        const index = this._field.changes.findIndex(part => part.name === name);

        // If part exists
        if (index !== -1) {
            if (overwrite) {
                // If value is defined, update the existing part.
                // Otherwise, remove it.
                if (value !== undefined) {
                    this._field.changes[index] = { mode, priority, unused: false, name, value };
                } else {
                    this._field.changes.splice(index, 1);
                }
            }
        } else if (value !== undefined) {
            // Part does not exist, add it.
            this.addPart(name, value);
        } else {
            console.warn(`Shadowrun 5e | Cannot add a part with an undefined value. Part: ${name}`);
        }
    }

    /**
     * Removes all parts with a matching name.
     */
    public removePart(name: string): void {
        this._field.changes = this._field.changes.filter(part => part.name !== name);
    }
}
