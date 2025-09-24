import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import { safelist } from './build/purgecss-safelist.mjs';

export default {
    plugins: [
        purgeCSSPlugin({
            content: ['./src/templates/**/*.{html,hbs}', './src/module/**/*.{ts,js}'],
            safelist,
        }),
    ],
};
