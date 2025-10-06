import { ModifiableValueType } from "@/module/types/template/Base";
import { ModifiableField } from "@/module/types/fields/ModifiableField";
const { ArrayField, TypedObjectField, SchemaField } = foundry.data.fields;

export class ModifiableFieldPrep {

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

            if (mod.temp) {
                mod.changes.push(
                    { name: "SR5.Temporary", value: mod.temp, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, unused: false, priority: 0 }
                );
            }
        };

        return this.traverseFields(system, resolveField, resetFunc);
    }
}
