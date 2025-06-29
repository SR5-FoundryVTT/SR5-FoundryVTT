
import DataModel from "node_modules/fvtt-types/src/foundry/common/abstract/data.mjs";
import { ArrayField, DataField } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs"
import { SR5ActiveEffect } from "src/module/effect/SR5ActiveEffect";

/**
 * Provide system functionality to ModifiableValue-fields.
 * 
 * These fields contain these properties:
 * - base
 * - value
 * - mod
 * - override
 * - temp
 */
export class ModifiableArrayField<
    const ElementFieldType extends DataField.Any,
    const Options extends ArrayField.AnyOptions = ArrayField.DefaultOptions<
        ArrayField.AssignmentElementType<ElementFieldType>
    >,
    const AssignmentElementType = ArrayField.AssignmentElementType<ElementFieldType>,
    const InitializedElementType = ArrayField.InitializedElementType<ElementFieldType>,
    const AssignmentType = ArrayField.AssignmentType<AssignmentElementType, Options>,
    const InitializedType = ArrayField.InitializedType<AssignmentElementType, InitializedElementType, Options>,
    const PersistedElementType = ArrayField.PersistedElementType<ElementFieldType>,
    const PersistedType extends PersistedElementType[] | null | undefined = ArrayField.PersistedType<
        AssignmentElementType,
        PersistedElementType,
        Options
    >
>
    extends foundry.data.fields.ArrayField<ElementFieldType, Options, AssignmentElementType, InitializedElementType, AssignmentType, InitializedType, PersistedElementType, PersistedType> {

    override _applyChangeCustom(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (SR5ActiveEffect.applyModifyToModifiableValue(change.effect, model, change, value, delta)) return undefined;
        return super._applyChangeCustom(value, delta, model, change);
    }
}