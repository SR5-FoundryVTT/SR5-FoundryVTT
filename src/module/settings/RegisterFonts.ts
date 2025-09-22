// TODO: Remove local definitions if League-of-Foundry-Developers/foundry-vtt-types
// supplies the correct types [#3498](https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/3498) and directly assign Rajdhani
interface LocalFontDefinition {
    editor: boolean;
    fonts: {
        urls: string[];
        style?: string;
        weight?: string | number;
    }[];
}

export function registerFonts(): void {
    // Use the local interface to satisfy TS
    const rajdhani: LocalFontDefinition = {
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

    // Assign with any-cast to bypass the broken CONFIG.fontDefinitions type
    CONFIG.fontDefinitions['Rajdhani'] = rajdhani as any;

    // Remove non-supplied fallback fonts
    const fallbackFonts = ['Arial', 'Courier', 'Courier New', 'Times', 'Times New Roman'];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    for (const fallbackFont of fallbackFonts) delete CONFIG.fontDefinitions[fallbackFont];
}
