import { ModifiableValue } from "../template/Base";
import { AnyObject, SimpleMerge } from "fvtt-types/utils";
import { SR5ActiveEffect } from "src/module/effect/SR5ActiveEffect";

import DataModel = foundry.abstract.DataModel;
import SchemaField = foundry.data.fields.SchemaField;

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
    Fields extends ReturnType<typeof ModifiableValue>,
    Options extends SchemaField.Options<Fields> = SchemaField.DefaultOptions,
    AssignmentType = SchemaField.Internal.AssignmentType<Fields, SimpleMerge<Options, SchemaField.DefaultOptions>>,
    InitializedType = SchemaField.Internal.InitializedType<Fields, SimpleMerge<Options, SchemaField.DefaultOptions>>,
    PersistedType extends AnyObject | null | undefined = SchemaField.Internal.PersistedType<
        Fields,
        SimpleMerge<Options, SchemaField.DefaultOptions>
    >
> extends foundry.data.fields.SchemaField<Fields, Options, AssignmentType, InitializedType, PersistedType> {
    override _applyChangeCustom(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (SR5ActiveEffect.applyModifyToModifiableValue(change.effect, model, change, value, delta)) return undefined;
        return super._applyChangeCustom(value, delta, model, change);
    }

    protected override _applyChangeOverride(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (SR5ActiveEffect.applyOverrideToModifiableValue(change.effect, model, change, value, delta)) return undefined;
        return super._applyChangeOverride(value, delta, model, change);
    }

    protected override _applyChangeUpgrade(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (SR5ActiveEffect.applyUpgradeToModifiableValue(change.effect, model, change, value, delta)) return undefined;
        return super._applyChangeUpgrade(value, delta, model, change);
    }

    protected override _applyChangeDowngrade(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        if (SR5ActiveEffect.applyDowngradeToModifiableValue(change.effect, model, change, value, delta)) return undefined;
        return super._applyChangeDowngrade(value, delta, model, change);
    }

    /**
     * Avoid breaking sheet rendering by assuring Foundry never applies any naive multiplication of an 'object'
     */
    protected override _applyChangeMultiply(value: InitializedType, delta: InitializedType, model: DataModel.Any, change: ActiveEffect.ChangeData) {
        return undefined;
    }
}
