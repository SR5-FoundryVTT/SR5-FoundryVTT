import ArrayField = foundry.data.fields.ArrayField;
import DataField = foundry.data.fields.DataField;
import Document = foundry.abstract.Document;

/**
 * Create an ArrayField that can be used with the Tagify system
 * - the data must match {value: string, id: string}
 * TODO figure out how to enforce the type? maybe just default to it? That seems smarter now that i write this todo...
 * - TODO these types were copy-pasted verbatim from ArrayFields just to make things work, it should be cleaned up
 */
export class TagifyField<
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
        // Create a Map for O(1) lookups from id to label
        const optionsMap = new Map(
            (config.options as {id: string; label: string}[]).map(opt => [opt.id, opt.label])
        );
        // map the values from their id to their option
        const value = (config.value as {id: string; value: string}[])?.map(({id}) => {
            const label = optionsMap.get(id);
            return label ? { id, value: game.i18n.localize(label) } : undefined;
        }).filter(obj => !!obj) ?? [];

        const input = document.createElement('input');
        input.name = config.name;
        // stringify our values to set on the data so that we can parse it later
        input.setAttribute('value', JSON.stringify(value))
        input.setAttribute('options', JSON.stringify(config.options));
        input.className = "tagify-selection";
        return input;
    }

    /**
     * Override array field's form support
     * - array field by default does not support forms. we override _toInput to provide a form now
     */
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
            if (value === '') {
                return [] as AssignmentType;
            }
            try {
                const shouldBeArray = JSON.parse(value);
                if (Array.isArray(shouldBeArray)) {
                    return shouldBeArray as AssignmentType;
                }
                console.error("Shadowrun5e | Parsed string is not an array.", value)
                return [] as AssignmentType;
            }
            catch (e) {
                console.error(`Shadowrun5e | Could not parse string value ${value} as array.`, e)
                return [] as AssignmentType;
            }
        }
        return super._cast(value);
    }
}
