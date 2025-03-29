# Copilot Instructions

THis project is a web application implementing a FoundryVTT system allowing users to automate the Shadowrun 5th edition ttrpg. The application is built using TypeScript, SCSS and  node.js with a gulp and esbuild build pipeline. The interface is build using handlebarjs templates.

## Coding Standards

- Use cameClase for variable and functions names and JSON properties
- Use PascalCase for class and component names
- Use single quotes for strings
- Use 4 spaces for identation
- Use async/await for asynchronous code
- Use template literals for strings that contain variables

## Unittesting

Unittesting is done using Mocha and Chai, both of which are executed through a FoundryVTT module called Quench.
The individual unittests are setup in `src/unittests/quench.ts` and stored in `src/unittests` in individual `sr5.<unitTest>.spec.ts` files.

## Architecture

The main components are within the `SR5Actor` and `SR5Item` document classes, connecting the main functionality. The system separates code between document classes, connecting everything, rule objects, handling the Shadowrun 5th edition rule system, and flow objects, connecting FoundryVTT and rule functionality.

The system implements tests of the Shadowrun 5th edition rules within the `SuccessTest` class.