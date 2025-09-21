import ArrayField = foundry.data.fields.ArrayField;
import DataField = foundry.data.fields.DataField;
import Document = foundry.abstract.Document;

/**
 * Create an ArrayField that can be used with the Tagify system
 * - the data must be a StringField that will map to tagify objects
 * TODO figure out how to enforce the type? maybe just default to it? That seems smarter now that i write this todo...
 * - TODO these types were copy-pasted verbatim from ArrayFields just to make things work, it should be cleaned up
 */
export class TagifyAltField<
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
        let options = config.options ?? [];

        if (typeof options === 'object') {
            options = Object.entries(options).map(([id, label]) => ({id, label}));
        }

        // map the values from their id to their option
        const value = config.value?.map((id) => {
            const label = options.find((opt) => opt.id === id)?.label;
            if (label) {
                return {
                    id,
                    value: game.i18n.localize(label),
                }
            }
            return undefined;
        }).filter(id => !!id) ?? [];

        const input = document.createElement('input');
        input.name = config.name;
        // stringify our values to set on the data so that we can parse it later
        input.setAttribute('value', JSON.stringify(value))
        input.setAttribute('options', JSON.stringify(options));
        input.className = "tagify-selection";
        if (config.disabled) {
            input.disabled = true;
        }
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
        if (Array.isArray(value) && value.length === 0) return super._cast(value);
        // parse out the value if it is a string
        if (typeof value === 'string') {
            if (value === '') {
                return [] as AssignmentType;
            }
            try {
                const shouldBeArray = JSON.parse(value);
                if (Array.isArray(shouldBeArray)) {
                    return shouldBeArray.map((item) => {
                        return this._mapTagifyToString(item)
                    }) as AssignmentType;
                }
                console.error("Shadowrun5e | Parsed string is not an array.", value)
                return [] as AssignmentType;
            }
            catch (e) {
                console.error(`Shadowrun5e | Could not parse string value ${value} as array.`, e)
                return [] as AssignmentType;
            }
        }
        if (Array.isArray(value)) {
            return value.map((item) => {
                return this._mapTagifyToString(item)
            }) as AssignmentType;
        }
        return super._cast(value);
    }

    _mapTagifyToString(item) {
        if (typeof item === 'object') {
            return item.id;
        }
        return item;
    }
}
