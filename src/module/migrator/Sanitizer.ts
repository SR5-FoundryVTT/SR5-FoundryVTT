const { SchemaField, TypedObjectField, ArrayField } = foundry.data.fields;
type CorrectionLog = Record<string, { oldValue: unknown; newValue: unknown }>;

/**
 * Sanitizer is responsible for validating and correcting raw data objects
 * so they conform to a Foundry VTT data model schema.
 *
 * When validation fails, invalid fields are replaced with clean or default values
 * defined by the schema. A log of all corrected fields is returned.
 */
export class Sanitizer {
    /**
     * Validate and sanitize the given source object based on a schema definition.
     * 
     * @param schema - The data model schema used for validation and correction.
     * @param source - The raw data object to be sanitized.
     * @returns A log of changes made during sanitization, or null if no changes were necessary.
     */
    public static sanitize(
        schema: foundry.data.fields.SchemaField.Any,
        source: Record<string, unknown>,
    ): CorrectionLog | null {
        const failure = schema.validate(source, { partial: true });
        if (!failure) return null;

        const corrections: CorrectionLog = {};
        this._sanitize(source, failure, (key) => schema.fields[key], corrections);
        return corrections;
    }

    /**
     * Determine whether a value is a non-null structured object (not an array).
     * Used to check if nested validation is required.
     */
    private static isStructured(value: unknown): value is Record<string, unknown> {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    /**
     * Recursively sanitize invalid values in the source by applying defaults from the schema.
     * 
     * @param source - The object or array to sanitize.
     * @param modelFailure - The structure describing validation failures.
     * @param resolveField - Function to retrieve the corresponding schema field for a key.
     * @param corrections - Object collecting the changes applied during sanitization.
     * @param path - Tracks the current nested path (for correction keys).
     */
    private static _sanitize(
        source: Record<string, unknown> | Array<unknown>,
        modelFailure: foundry.data.validation.DataModelValidationFailure,
        resolveField: (key: string) => foundry.data.fields.DataField.Any,
        corrections: Record<string, { oldValue: unknown; newValue: unknown; }>,
        path: string[] = []
    ): void {
        // Merge both named field failures and indexed element failures into one flat map for iteration.
        const failures = {
            ...modelFailure.fields,
            ...Object.fromEntries(modelFailure.elements.map(e => [e.id.toString(), e.failure]))
        };

        for (const [fieldName, failure] of Object.entries(failures)) {
            const value = source[fieldName];
            const field = resolveField(fieldName);
            const currentPath = [...path, fieldName];

            if (field instanceof SchemaField && this.isStructured(value))
                this._sanitize(value, failure, (subKey) => field.fields[subKey], corrections, currentPath);
            else if (field instanceof TypedObjectField && this.isStructured(value))
                this._sanitize(value, failure, () => field.element, corrections, currentPath);
            else if (field instanceof ArrayField && Array.isArray(value))
                this._sanitize(value, failure, () => field.element, corrections, currentPath);
            else {
                let newValue: unknown;

                // Avoid conversion from T to [T] on cleaning in ArrayField.
                if (!(field instanceof ArrayField)) {
                    const cleanValue = field.clean(value);
                    newValue = field.validate(cleanValue) == null ? cleanValue : field.getInitialValue();
                } else {
                    newValue = field.getInitialValue();
                }

                corrections[currentPath.join(".")] = { oldValue: value, newValue };
                source[fieldName] = newValue;
            }
        }
    }
}
