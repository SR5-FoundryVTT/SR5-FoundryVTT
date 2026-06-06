import ArrayField = foundry.data.fields.ArrayField;
import DataField = foundry.data.fields.DataField;
import StringField = foundry.data.fields.StringField;

type TagifyOption = { id: string; label: string };
type TagifyList = TagifyOption[] | Record<string, string>;

/** The element StringField built from the given choices, so they narrow the stored value type; `required` is always `true`. */
type TagifyElement<Choices extends StringField.Choices | undefined> = StringField<{ choices: Choices; required: true }>;

/** The assignment type ArrayField derives for the given element field — re-stated so the `_cast` override stays compatible. */
type TagifyAssignment<Choices extends StringField.Choices | undefined> =
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    ArrayField.AssignmentType<ArrayField.AssignmentElementType<TagifyElement<Choices>>, ArrayField.DefaultOptions>;
/** The initialized type ArrayField derives for the given element field — re-stated so the `_toInput` override stays compatible. */
type TagifyInitialized<Choices extends StringField.Choices | undefined> =
    ArrayField.InitializedType<ArrayField.InitializedElementType<TagifyElement<Choices>>, ArrayField.DefaultOptions>;

/**
 * Create an ArrayField that can be used with the Tagify system
 * - the field stores selected tag ids as a string array
 */
export class TagifyMultiField<
    const Choices extends StringField.Choices | undefined = undefined,
> extends ArrayField<TagifyElement<Choices>> {
    constructor(choices?: Choices) {
        super(new StringField({ choices, required: true }) as TagifyElement<Choices>);
    }

    /**
     * Override array field's form support
     * - array field by default does not support forms. we override _toInput to provide a form now
     */
    static override get hasFormSupport() {
        return true;
    }

    /**
     * Normalize supported Tagify option inputs to a single array shape.
     * - active effect sheets provide [{ id, label }]
     * - item templates still provide config maps like { id: label }
     */
    private _normalizeOptions(options: TagifyList | undefined): TagifyOption[] {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        return Object.entries(options).map(([id, label]) => ({ id, label }));
    }

    /**
     * Normalize submitted Tagify values to stored string ids.
     * Tagify submits selected tags as { id, value }, while migrated data may already be string ids.
     */
    private _normalizeValue(value: unknown): string | undefined {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string') {
            return value.id;
        }
        return undefined;
    }

    /**
     * Override the _toInput function to return an input element setup for tagify
     * - we need to use the hook in TagifyHooks to actually setup tagify as the sheet needs to be rendered first
     * - this is currently done in the _postRender function of SR5ActiveEffectConfig
     */
    override _toInput(config: DataField.ToInputConfig<TagifyInitialized<Choices>> & { options?: TagifyList }) {
        const options = this._normalizeOptions(config.options);
        const selectedValues = Array.isArray(config.value) ? config.value : [];

        // map the values from their id to their option
        const value = selectedValues.map(id => {
            const label = options.find(opt => opt.id === id)?.label;
            return label ? { id, value: game.i18n.localize(label) } : undefined;
        }).filter(obj => !!obj);

        const input = document.createElement('input');
        input.name = config.name!;
        input.className = "tagify-selection";
        input.disabled = config.disabled ?? false;
        // stringify our values to set on the data so that we can parse it later
        input.setAttribute('value', JSON.stringify(value));
        input.setAttribute('options', JSON.stringify(options));

        return input;
    }

    /**
     * Override the _cast function to interpret the input value correctly
     */
    override _cast(value: unknown) {
        type Assignment = TagifyAssignment<Choices>;

        // parse out the value if it is a string
        if (typeof value === 'string') {
            if (!value) return [] as Assignment;
            try {
                const shouldBeArray = JSON.parse(value);
                if (Array.isArray(shouldBeArray)) {
                    return shouldBeArray
                        .map(value => this._normalizeValue(value))
                        .filter(value => typeof value === 'string') as Assignment;
                }
                console.error("Shadowrun5e | Parsed string is not an array.", value);
                return [] as Assignment;
            }
            catch (e) {
                console.error(`Shadowrun5e | Could not parse string value ${value} as array.`, e);
                return [] as Assignment;
            }
        }

        if (Array.isArray(value)) {
            return value
                .map(value => this._normalizeValue(value))
                .filter(value => typeof value === 'string') as Assignment;
        }

        return super._cast(value);
    }
}
