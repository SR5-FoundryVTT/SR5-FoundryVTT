import { ModifiableValue } from "../template/Base";
import { AnyObject, SimpleMerge } from "fvtt-types/utils";
import { SR5ActiveEffect } from "src/module/effect/SR5ActiveEffect";

import DataModel = foundry.abstract.DataModel;
import SchemaField = foundry.data.fields.SchemaField;

/**
 * A ModifiableSchemaField is a SchemaField that represents a ModifiableValue type, which 
 * holds further system functionality.
 * 
 * A ModifiableValue holds att least these properties:
 * - base
 * - value
 * - mod
 * - override
 * - temp
 */
export class ModifiableField<
    Fields extends ReturnType<typeof ModifiableValue>,
    Options extends SchemaField.Options<Fields> = SchemaField.DefaultOptions,
    AssignmentType = SchemaField.Internal.AssignmentType<Fields, SimpleMerge<Options, SchemaField.DefaultOptions>>,
    InitializedType = SchemaField.Internal.InitializedType<Fields, SimpleMerge<Options, SchemaField.DefaultOptions>>,
    PersistedType extends AnyObject | null | undefined = SchemaField.Internal.PersistedType<
        Fields,
        SimpleMerge<Options, SchemaField.DefaultOptions>
    >
> extends foundry.data.fields.SchemaField<Fields, Options, AssignmentType, InitializedType, PersistedType> {
    /**
     * When applying a effect change, inject custom application logic for ModifiableValues.
     *
     * Modify will inject into custom data, when system ModifiableValue-fields are found, which will later be used for
     * value transparancy and calcution. .
     * 
     * @param value 
     * @param delta 
     * @param model 
     * @param change 
     * @returns 
     */
    override _applyChangeCustom(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (SR5ActiveEffect.applyModifyToModifiableValue(change.effect, model, change, value, delta)) return undefined;
        return super._applyChangeCustom(value, delta, model, change);
    }

    /**
     * When applying a effect change, inject custom application logic for ModifiableValues.
     * 
     * Override will create custom data, when system ModifiableValue-fields are found, which will late be used for
     * value transparancy and calculation.
     * 
     * @param value 
     * @param delta 
     * @param model 
     * @param change 
     * @returns 
     */
    protected override _applyChangeOverride(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        // Return value unchanged, as effects don´t alter the output value here but add to it.
        if (SR5ActiveEffect.applyOverrideToModifiableValue(change.effect, model, change, value, delta)) return value;
        return super._applyChangeOverride(value, delta, model, change);
    }
}