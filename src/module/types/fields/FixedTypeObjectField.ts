import { AnyObject } from "fvtt-types/utils";

import DataField = foundry.data.fields.DataField;
import TypedObjectField = foundry.data.fields.TypedObjectField;

export class FixedTypeObjectField<
    Element extends DataField.Any,
    Options extends TypedObjectField.Options<AnyObject> = TypedObjectField.DefaultOptions,
    AssignmentType = TypedObjectField.AssignmentType<Element, Options>,
    InitializedType = TypedObjectField.InitializedType<Element, Options>,
    PersistedType extends AnyObject | null | undefined = TypedObjectField.InitializedType<Element, Options>,
> extends foundry.data.fields.TypedObjectField<Element, Options, AssignmentType, InitializedType, PersistedType> {
    /**
     * Get the field at the specified path for nested object keys.
     * 
     * This is a fix for broken v13 behavior:
     * - Solution taken from: https://github.com/foundryvtt/foundryvtt/issues/13286
     * - Issue: https://github.com/foundryvtt/foundryvtt/issues/13249
     * 
     * TODO: fvtt-vtt v14 should fix this. Remove by then.
     * NOTE: This will either return a matching field or undefined.
     * 
     * @param path The path to the field.
     * @returns The field at the specified path or undefined
     */
    override _getField(path) {
        if (path.length === 0) return this;
        const key = path.shift();
        // @ts-expect-error TODO: fvtt-types v14 validateKey defaults to foundry.packages.BasePackage.validateId, disallowing invalid keys NOT checking for nested object keys
        if ((key === this.element.name) || (this.validateKey?.(key) !== false)) {
            // @ts-expect-error TODO: fvtt-types v13 getFields exists on DataField but it's not getting recognized
            return this.element.getField(path);
        }
    }
}