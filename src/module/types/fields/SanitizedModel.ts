import Document = foundry.abstract.Document;
import DataSchema = foundry.data.fields.DataSchema;
import { AnyMutableObject, AnyObject, EmptyObject } from "fvtt-types/utils";

const { SchemaField, TypedObjectField, ArrayField } = foundry.data.fields;

function isStructured(value: unknown): value is Record<string, unknown> | ArrayLike<unknown> {
    return value !== null && typeof value === "object";
}

export abstract class SanitizedModel<
    Schema extends DataSchema,
    Parent extends Document.Any,
    BaseData extends AnyObject = EmptyObject,
    DerivedData extends AnyObject = EmptyObject,
> extends foundry.abstract.TypeDataModel<Schema, Parent, BaseData, DerivedData> {
    static override migrateData(source: AnyMutableObject) {
        if (isStructured(source) && this.schema.validate(source) != null)
            SanitizedModel._sanitize(source, (key) => this.schema.fields[key]);

        return super.migrateData(source);
    }

    private static _sanitize(
        source: Record<string, unknown> | ArrayLike<unknown>,
        resolveField: (key: string) => foundry.data.fields.DataField.Any,
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

            if (!isStructured(value)) {
                console.warn(`Replaced invalid value at ${currentPath.join(".")}:`, value, "→", field.getInitialValue());
                source[fieldName] = field.getInitialValue();
                continue;
            }

            if (field instanceof SchemaField)
                SanitizedModel._sanitize(value, (subKey) => field.fields[subKey], currentPath);

            if (field instanceof ArrayField || field instanceof TypedObjectField)
                SanitizedModel._sanitize(value, () => field.element, currentPath);
        }
    }
}
