export function registerFonts(): void {
    CONFIG.fontDefinitions['Rajdhani'] = {
        editor: true,
        fonts: [
            {
                urls: ['systems/shadowrun5e/fonts/rajdhani-v16-latin_latin-ext-300.woff2'],
                style: 'normal',
                weight: '300',
            },
            {
                urls: ['systems/shadowrun5e/fonts/rajdhani-v16-latin_latin-ext-regular.woff2'],
                style: 'normal',
                weight: '400',
            },
            {
                urls: ['systems/shadowrun5e/fonts/rajdhani-v16-latin_latin-ext-500.woff2'],
                style: 'normal',
                weight: '500',
            },
            {
                urls: ['systems/shadowrun5e/fonts/rajdhani-v16-latin_latin-ext-600.woff2'],
                style: 'normal',
                weight: '600',
            },
            {
                urls: ['systems/shadowrun5e/fonts/rajdhani-v16-latin_latin-ext-700.woff2'],
                style: 'normal',
                weight: '700',
            },
        ],
    };

    // Remove non-supplied fallback fonts
    const fallbackFonts = ['Arial', 'Courier', 'Courier New', 'Times', 'Times New Roman'];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    for (const fallbackFont of fallbackFonts) delete CONFIG.fontDefinitions[fallbackFont];
}
