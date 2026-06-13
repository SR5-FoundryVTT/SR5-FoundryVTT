import { ModifiableValueSchema, ModifiableValueType } from "../template/Base";
import { AnyObject } from "fvtt-types/utils";

import DataModel = foundry.abstract.DataModel;
import SchemaField = foundry.data.fields.SchemaField;
import { DataDefaults } from "@/module/data/DataDefaults";
import { SR5ActiveEffect } from "@/module/effect/SR5ActiveEffect";

/**
 * A ModifiableSchemaField is a SchemaField that represents a ModifiableValue type, which 
 * holds further system functionality.
 * 
 * Foundry will hand over authority over applying value changes to SchemaFields, when the document
 * is using a DataModel schema.
 * 
 * ModifiableField alteres default Foundry mode behavior to allow the system to show the whole 
 * value resolution instead of just altering the total modified value.
 */
/**
 * A ModifiableField extends functionality for the ModifiableValue type for ActiveEffect change application
 * by allowing for more granular control over how changes are applied and displayed.
 * 
 * This is directly related to SR5ActiveEffect and its legacy application, both sharing the same application
 * logic.
 */
export class ModifiableField<
    Fields extends ReturnType<typeof ModifiableValueSchema>,
    Options extends SchemaField.Options<Fields> = SchemaField.DefaultOptions,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    AssignmentType = SchemaField.Internal.AssignmentType<Fields, Options>,
    InitializedType = SchemaField.Internal.InitializedType<Fields, Options>,
    PersistedType extends AnyObject | null | undefined = SchemaField.Internal.PersistedType<Fields, Options>
> extends foundry.data.fields.SchemaField<Fields, Options, AssignmentType, InitializedType, PersistedType> {
    override applyChange(value: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData): undefined {
        const changeValue = Number(change.value);
        if (isNaN(changeValue)) return undefined;

        const field = value as ModifiableValueType;
        const name = change.effect.name;
        // @ts-expect-error TODO: fvtt-types - Replace local types with fvtt-type types
        const type = change.type as string; 
        const priority = change.priority ?? SR5ActiveEffect.CHANGE_TYPES[type]?.defaultPriority ?? 20;

        field.changes.push(
            DataDefaults.createData('change_entry', {
                name,
                type,
                value: changeValue,
                priority,
                source: change.effect.uuid,
            })
        );

        return undefined;
    }
}
