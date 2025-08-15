import { createTagifyOnInput } from '@/module/utils/sheets';

export const TagifyHooks = {
    registerHooks: () => {
        Hooks.on('sr5_processTagifyElements', (html: HTMLElement) => {
            const elements = html.querySelectorAll<HTMLInputElement>('input.tagify-selection');

            for (const element of elements) {
                // Tagify expects this format for localized tags.
                const values = JSON.parse(element.getAttribute('value') ?? '[]') as any[];
                const options = JSON.parse(element.getAttribute('options') ?? '[]') as any[];

                // Tagify dropdown should show all whitelist tags.
                const maxItems = options.length;

                // create the tagify element, capture any changes to update the currentTarget's value
                createTagifyOnInput(element, options, maxItems, values, (event) => {
                    if (event.currentTarget) {
                        const target = event.currentTarget as HTMLInputElement & { tagifyValue: string };
                        target.setAttribute('value', target.tagifyValue);
                    }
                });
            }
        })
    }
}
