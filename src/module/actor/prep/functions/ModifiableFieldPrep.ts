import { ModifiableValueType } from "@/module/types/template/Base";
import { ModifiableField } from "@/module/types/fields/ModifiableField";
const { ArrayField, TypedObjectField, SchemaField } = foundry.data.fields;

export class ModifiableFieldPrep {

    private static _markPreviousChangesUnused(changes: ModifiableValueType['changes'], currentIndex: number): void {
        for (let i = 0; i < currentIndex; i++) {
            changes[i].unused = true;
        }
    }

    static applyChanges(mod: ModifiableValueType): number {
        mod.value = mod.base;

        mod.changes.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < mod.changes.length; i++) {
            const change = mod.changes[i];

            switch (change.mode) {
                case CONST.ACTIVE_EFFECT_MODES.ADD:
                case CONST.ACTIVE_EFFECT_MODES.CUSTOM:
                    mod.value += change.value;
                    break;
                case CONST.ACTIVE_EFFECT_MODES.MULTIPLY:
                    mod.value *= change.value;
                    break;
                case CONST.ACTIVE_EFFECT_MODES.OVERRIDE:
                    mod.value = change.value;
                    this._markPreviousChangesUnused(mod.changes, i);
                    break;
                case CONST.ACTIVE_EFFECT_MODES.UPGRADE:
                    if (mod.value < change.value) {
                        mod.value = change.value;
                        this._markPreviousChangesUnused(mod.changes, i);
                    } else {
                        change.unused = true;
                    }
                    break;
                case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
                    if (mod.value > change.value) {
                        mod.value = change.value;
                        this._markPreviousChangesUnused(mod.changes, i);
                    } else {
                        change.unused = true;
                    }
                    break;
                default:
                    console.warn(`Unknown Active Effect mode ${change.mode} encountered.`);
                    break;
            }
        }

        return mod.value;
    }

    private static traverseFields(
        source: object,
        resolveField: (key: string) => foundry.data.fields.DataField.Any,
        func: (mod: ModifiableValueType) => void
    ): void {
        if (!source || (typeof source !== "object")) return;

        for (const [fieldName, value] of Object.entries(source)) {
            const field = resolveField(fieldName);

            if (field instanceof ModifiableField)
                func(value);
            else if (field instanceof SchemaField)
                this.traverseFields(value, (subKey) => field.fields[subKey], func);
            else if (field instanceof TypedObjectField || field instanceof ArrayField)
                this.traverseFields(value, () => field.element, func);
        }
    }

    static resetAllModifiers(system: Actor['system'] | Item['system']) {
        const resolveField = (key: string) => system.schema.fields[key] as foundry.data.fields.DataField.Any;
        const resetFunc = (mod: ModifiableValueType) => {
            mod.changes = [];

            if (mod.temp)
                mod.changes.push({ name: "SR5.Temporary", value: mod.temp, mode: 2, unused: false, priority: 0 });
        };

        return this.traverseFields(system, resolveField, resetFunc);
    }
}
