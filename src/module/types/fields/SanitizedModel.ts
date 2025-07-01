import Document = foundry.abstract.Document;
import DataSchema = foundry.data.fields.DataSchema;
import { AnyMutableObject, AnyObject, EmptyObject } from "fvtt-types/utils";

const { SchemaField, TypedObjectField } = foundry.data.fields;

export abstract class SanitizedModel<
    Schema extends DataSchema,
    Parent extends Document.Any,
    BaseData extends AnyObject = EmptyObject,
    DerivedData extends AnyObject = EmptyObject,
> extends foundry.abstract.TypeDataModel<Schema, Parent, BaseData, DerivedData> {
    static override migrateData(source: AnyMutableObject) {
        if (source && typeof source === "object")
            SanitizedModel._sanitize(source as any, (key) => this.schema.fields[key]);

        return super.migrateData(source);
    }

    private static isObject(value: unknown): this is Record<string, unknown> {
        return value != null && typeof value === "object";
    }

    private static _sanitize(
        source: Record<string, foundry.data.fields.DataField.Any>,
        resolveField: (ket: string) => foundry.data.fields.DataField.Any,
        path: string[] = [],
    ): void {
        for (const [fieldName, value] of Object.entries(source)) {
            const field = resolveField(fieldName);
            const currentPath = [...path, fieldName];

            if (!field) {
                console.warn(`Unknown field: ${currentPath.join(".")}`);
                continue;
            }

            if (field.validate(value) == null) continue;

            if (field instanceof SchemaField && this.isObject(value)) {
                SanitizedModel._sanitize(value as any, (subKey) => field.fields[subKey], currentPath);
            } else if (field instanceof TypedObjectField && this.isObject(value)) {
                SanitizedModel._sanitize(value as any, () => field.element, currentPath);
            } else {
                console.warn(`Replaced invalid value at ${currentPath.join(".")}:`, value, "→", field.getInitialValue());
                source[fieldName] = field.getInitialValue();
            }
        }
    }
}
