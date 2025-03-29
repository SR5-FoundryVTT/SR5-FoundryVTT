# Copilot Instructions

THis project is a web application implementing a FoundryVTT system allowing users to automate game rules of the Shadowrun 5th edition ttrpg. The application is built using TypeScript, SCSS and  node.js with a gulp and esbuild build pipeline. The interface is build using handlebarjs templates.

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

Data schemas are described in the `template.json` and defined in TypeScript types within the `Shadowrun` namespace.

## Core Game Mechanics

The Shadorwun 5th edition ttrpg has these core game mechanics:

- modifiers change values and are handled within the `SituationModifiers` class and sub-classes and uses the FoundryVTT active effects implemented with the `SR5eActiveEffect` class
- combat related rules, with ranged and melee combat
- combat initiative handling within the `SR5eCombat` class
- magic related rules for spells and spirits
- matrix related rules for hacking, managing networks and devices
- technomancer related rules for matrix handling special to technomancers
- rigging related rules for driving vehicles and rolling tests with vehicles