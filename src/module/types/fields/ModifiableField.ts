import { ModifiableValueSchema, ModifiableValueType } from "../template/Base";
import { AnyObject } from "fvtt-types/utils";

import DataModel = foundry.abstract.DataModel;
import SchemaField = foundry.data.fields.SchemaField;
import { DataDefaults } from "@/module/data/DataDefaults";

/**
 * A ModifiableSchemaField is a SchemaField that represents a ModifiableValue type, which 
 * holds further system functionality.
 * 
 * Foundry will hand over authority over applying value changes to SchemaFields, when the document
 * is using a DataModel schema.
 * 
 * ModifiableField alteres default Foundry type behavior to allow the system to show the whole 
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
        if (!change.effect) return undefined;

        const field = value as ModifiableValueType;
        const effectName = change.effect.name;
        const effectType = change.type;
        const effectPriority = change.priority ?? CONST.ACTIVE_EFFECT_CHANGE_TYPES[change.type]?.defaultPriority ?? 20;
        const effectSource = change.effect.uuid ?? change.effect.id ?? change.effect.name;

        field.changes.push(
            DataDefaults.createData('change_entry', {
                name: effectName,
                type: effectType,
                value: changeValue,
                priority: effectPriority,
                source: effectSource,
            })
        );

        return undefined;
    }
}
