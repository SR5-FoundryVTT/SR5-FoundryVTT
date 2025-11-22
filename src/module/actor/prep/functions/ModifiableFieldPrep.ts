import { PartsList } from "@/module/parts/PartsList";
import { ModifiableValueType } from "@/module/types/template/Base";
import { ModifiableField } from "@/module/types/fields/ModifiableField";
const { ArrayField, TypedObjectField, SchemaField } = foundry.data.fields;

export class ModifiableFieldPrep {

    private static traverseFields(
        source: unknown,
        resolveField: (key: string) => foundry.data.fields.DataField.Any,
        func: (mod: ModifiableValueType) => void
    ): void {
        if (!source || (typeof source !== "object")) return;

        for (const [fieldName, value] of Object.entries(source)) {
            const field = resolveField(fieldName);

            if (field instanceof ModifiableField)
                func(value as ModifiableValueType);
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
                PartsList.addPart(mod, "SR5.Temporary", mod.temp);
            }
        };

        return this.traverseFields(system, resolveField, resetFunc);
    }
}
