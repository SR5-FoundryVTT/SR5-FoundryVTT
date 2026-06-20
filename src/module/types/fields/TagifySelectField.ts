import DataField = foundry.data.fields.DataField;
import StringField = foundry.data.fields.StringField;

type TagifyOption = { id: string; label: string };
type TagifyList = TagifyOption[] | Record<string, string>;

/** Default options with required: true, blank: true so callers don't have to pass them explicitly. */
type TagifySelectDefaultOptions = Omit<StringField.DefaultOptions, 'required' | 'blank'> & { required: true; blank: true };
type TagifyInitialized<Options extends StringField.Options<unknown>> = StringField.InitializedType<Options>;

/**
 * A StringField that renders as a Tagify single-value select in edit mode.
 *
 * The stored value is a stable key (e.g. 'fire') or raw custom text.
 * TagifyHooks initializes the Tagify instance on elements with class 'tagify-select'.
 */
export class TagifySelectField<
    const Options extends StringField.Options<unknown> = TagifySelectDefaultOptions,
> extends StringField<Options> {

    constructor(options?: Options) {
        super({ required: true, blank: true, ...(options ?? {}) } as Options);
    }

    /**
     * Normalize supported Tagify option inputs to a single array shape.
     * - footer templates provide config maps like { key: i18nLabel }
     * - direct callers may provide [{ id, label }]
     */
    private _normalizeOptions(options: TagifyList | undefined): TagifyOption[] {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        return Object.entries(options).map(([id, label]) => ({ id, label }));
    }

    /**
     * Override the _toInput function to return an input element setup for Tagify single-value select.
     * - TagifyHooks initializes the Tagify instance after render via the 'tagify-select' class
     */
    override _toInput(config: DataField.ToInputConfig<TagifyInitialized<Options>> & { options?: TagifyList }): HTMLElement {
        const options = this._normalizeOptions(config.options);

        const input = document.createElement('input');
        input.name = config.name!;
        input.className = 'tagify-select';
        input.disabled = config.disabled ?? false;
        input.setAttribute('value', (config.value as string | undefined) ?? '');
        input.setAttribute('options', JSON.stringify(options));

        return input;
    }
}
