// @ts-expect-error using the ArrayField and DataField namespaces
import { ArrayField, DataField } from 'fvtt-types/src/foundry/common/data/fields';
// @ts-expect-error using the Document namespace
import Document from 'fvtt-types/src/foundry/common/abstract/document';

/**
 * Create an ArrayField that can be used with the Tagify system
 * - the data must match {value: string, id: string}
 * TODO figure out how to enforce the type? maybe just default to it? That seems smarter now that i write this todo...
 * - TODO these types were copy-pasted verbatim from ArrayFields just to make things work, it should be cleaned up
 */
export class TagifyArrayField<
    const ElementFieldType extends DataField.Any | Document.AnyConstructor,
    const Options extends ArrayField.AnyOptions = ArrayField.DefaultOptions,
    const AssignmentElementType = ArrayField.AssignmentElementType<ElementFieldType>,
    const InitializedElementType = ArrayField.InitializedElementType<ElementFieldType>,
    const AssignmentType = ArrayField.AssignmentType<AssignmentElementType, Options>,
    const InitializedType = ArrayField.InitializedType<InitializedElementType, Options>,
    const PersistedElementType = ArrayField.PersistedElementType<ElementFieldType>,
    const PersistedType extends PersistedElementType[] | null | undefined = ArrayField.PersistedType<
        PersistedElementType,
        Options
    >,
> extends foundry.data.fields.ArrayField<ElementFieldType, Options, AssignmentElementType, InitializedElementType, AssignmentType, InitializedType, PersistedElementType, PersistedType> {

    /**
     * Override the _toInput function to return an input element setup for tagify
     * @param config
     * - we need to use the hook in TagifyHooks to actually setup tagify as the sheet needs to be rendered first
     * - this is currently done in the _postRender function of SR5ActiveEffectConfig
     */
    override _toInput(config) {
        // filter the config values to be only valid ids
        config.value = config.value?.filter(({id}) => id) ?? [];

        const input = document.createElement('input');
        input.name = config.name;
        // stringify our values to set on the data so that we can parse it later
        input.setAttribute('value', JSON.stringify(config.value))
        input.setAttribute('options', JSON.stringify(config.options));
        input.className = "tagify-selection";
        return input;
    }

    static override get hasFormSupport() {
        return true;
    }

    /**
     * Override the _cast function to interpret the input value correctly
     * @param value
     */
    override _cast(value) {
        // parse out the value if it is a string
        if (typeof value === 'string') {
            try {
                return JSON.parse(value) as AssignmentType;
            }
            catch (e) {
                // TODO log error
                return [] as AssignmentType;
            }
        }
        return super._cast(value);
    }
}
