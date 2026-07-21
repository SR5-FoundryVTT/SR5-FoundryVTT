import { SR5 } from '@/module/config';
import { TagifyMultiField } from '@/module/types/fields/TagifyMultiField';

const { AnyField, ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

const FilterConditionData = () => ({
    type:   new StringField({ required: true, initial: 'tests', choices: SR5.effectFilterTypes }),
    mode:   new StringField({ required: true, initial: 'include', choices: SR5.effectSelectionModes }),
    values: new TagifyMultiField(),
});

const TargetData = () => ({
    id:         new StringField({ required: true, blank: false, initial: () => foundry.utils.randomID() }),
    name:       new StringField({ required: true, blank: true, initial: '' }),
    applyTo:    new StringField({ required: true, initial: 'actor', choices: SR5.effectApplyTo }),
    conditions: new ArrayField(new SchemaField(FilterConditionData())),
    onlyForItemTest: new BooleanField(),
});

const ActiveEffectData = (baseChanges: foundry.data.ActiveEffectTypeDataModel.ChangeSchema) => ({
    appliedByTest:   new BooleanField(),
    onlyForEquipped: new BooleanField(),
    onlyForWireless: new BooleanField(),
    expiryAction:    new StringField({ required: true, initial: 'default', choices: ['default', 'delete', 'update'] }),
    targets: new ArrayField(new SchemaField(TargetData())),
    changes: new ArrayField(new SchemaField({
        // SchemaField owns its children, so spreading baseChanges would reuse already-parented fields.
        key:      new StringField(baseChanges.key.options),
        type:     new StringField(baseChanges.type.options),
        value:    new AnyField(baseChanges.value.options),
        phase:    new StringField(baseChanges.phase.options),
        priority: new NumberField(baseChanges.priority.options),
        target: new StringField({ required: false, blank: true, initial: "" }),
    })),
});

export class ActiveEffectDM extends foundry.data.ActiveEffectTypeDataModel<ReturnType<typeof ActiveEffectData>> {
    static override defineSchema() {
        return ActiveEffectData(super.defineSchema().changes.element.fields);
    }

    static override LOCALIZATION_PREFIXES = ["SR5.ActiveEffect"];
}
