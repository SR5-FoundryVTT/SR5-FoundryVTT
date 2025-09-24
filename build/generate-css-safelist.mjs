import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cssDir = path.resolve(__dirname, 'css');

const safelist = new Set();

const extractSelectors = async (filePath) => {
    try {
        const cssContent = fs.readFileSync(filePath, 'utf-8');
        const result = await postcss().process(cssContent, { from: filePath });

        result.root.walkRules((rule) => {
            if (!rule.selector) return;

            selectorParser((selectors) => {
                selectors.walkClasses((classNode) => {
                    safelist.add(classNode.value);
                });
                selectors.walkIds((idNode) => {
                    safelist.add(idNode.value);
                });
            }).processSync(rule.selector);
        });
    } catch (err) {
        console.error(`Error processing file ${filePath}: ${err.message}`);
    }
};

const generateSafelist = async () => {
    const files = fs.readdirSync(cssDir).filter((file) => file.endsWith('.css'));

    for (const file of files) {
        await extractSelectors(path.join(cssDir, file));
    }

    const safelistArray = Array.from(safelist).sort();

    fs.writeFileSync(
        path.resolve(__dirname, 'purgecss-safelist.mjs'),
        `export const safelist = ${JSON.stringify(safelistArray)};`,
    );

    console.log(`Safelist generated with ${safelistArray.length} entries.`);
};

generateSafelist();
