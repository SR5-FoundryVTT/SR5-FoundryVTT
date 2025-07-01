import Document = foundry.abstract.Document;
import DataSchema = foundry.data.fields.DataSchema;
import { AnyMutableObject, AnyObject, EmptyObject } from "fvtt-types/utils";

const { SchemaField } = foundry.data.fields;

export abstract class SanitizedModel<
    Schema extends DataSchema,
    Parent extends Document.Any,
    BaseData extends AnyObject = EmptyObject,
    DerivedData extends AnyObject = EmptyObject,
> extends foundry.abstract.TypeDataModel<Schema, Parent, BaseData, DerivedData> {
    static override migrateData(source: AnyMutableObject) {
        if (source && typeof source === "object")
            SanitizedModel.sanitize(source, this.schema);

        return super.migrateData(source);
    }

    static sanitize(
        source: AnyMutableObject,
        schema: foundry.data.fields.SchemaField.Any,
        path: string[] = []
    ): void {
        for (const [fieldName, value] of Object.entries(source)) {
            const field = schema.fields[fieldName] as foundry.data.fields.DataField.Any;
            const currentPath = [...path, fieldName];

            if (!field) {
                console.warn(`Deleted unknown field: ${currentPath.join(".")} on`, source);
                // Field not defined in schema — remove it
                // delete source[fieldName];
                continue;
            }

            // check if the value is valid
            if (field.validate(value) != null) {
                if (field instanceof SchemaField && value && typeof value === "object") {
                    // Recursively sanitize nested schema
                    SanitizedModel.sanitize(value as AnyMutableObject, field, currentPath);
                } else {
                    // Log invalid leaf field
                    console.warn(`Invalid value at ${currentPath.join(".")}:`, value, "→ Replaced with initial value.");
                    source[fieldName] = field.getInitialValue();
                }
            }
        }
    }
}
