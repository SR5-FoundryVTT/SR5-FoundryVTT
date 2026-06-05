import { createTagifyMulti, createTagifySelect, TagifyTags, TagifyValues } from '@/module/utils/sheets';

export const TagifyHooks = {
    registerHooks: () => {
        Hooks.on('sr5_processTagifyElements', (html: HTMLElement) => {
            // Multi-value tagify (arrays)
            const multiElements = html.querySelectorAll<HTMLInputElement>('input.tagify-selection');
            for (const element of multiElements) {
                const values = JSON.parse(element.getAttribute('value') ?? '[]') as TagifyTags;
                const options = JSON.parse(element.getAttribute('options') ?? '[]') as TagifyValues;

                createTagifyMulti(element, options, values);
                element.addEventListener('change', (event) => {
                    if (event.currentTarget) {
                        const target = event.currentTarget as HTMLInputElement & { tagifyValue: string };
                        target.setAttribute('value', target.tagifyValue);
                    }
                });
            }

            // Single-value tagify select (string fields)
            const selectElements = html.querySelectorAll<HTMLInputElement>('input.tagify-select');
            for (const element of selectElements) {
                const currentValue = element.getAttribute('value') ?? '';
                const options = JSON.parse(element.getAttribute('options') ?? '[]') as TagifyValues;
                createTagifySelect(element, options, currentValue);
            }
        })
    }
}
