# Build Folder

This folder contains build-time tooling scripts for the project.

## Files

### `generate-css-safelist.mjs`
A Node.js script that scans all `.css` files inside the `build/css/` folder and extracts all class and ID selectors. It generates:
- `purgecss-safelist.mjs`: an ES module exporting the full list of selectors as a `safelist` array.
- This safelist can be imported in `postcss.config.mjs` to prevent PurgeCSS from stripping essential styles.
- To generate a complete safelist, you need to place the relevant CSS files in the `build/css/` directory. To obtain the necessary files start any game in FoundryVTT, locate the respective css files (as of V13 `all.min.css` and `foundry.css`) in the dev tools of your browser and download them to the correct folder.

### `purgecss-safelist.mjs`
> Automatically generated. **Do not edit manually.**
