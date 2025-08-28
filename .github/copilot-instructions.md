# Copilot Instructions

This project is a web application implementing a FoundryVTT system allowing users to automate game rules of the Shadowrun 5th edition ttrpg. The application is built using TypeScript, SCSS and handlebarjs templates.

## Coding Standards

- Use cameClase for variable and functions names and JSON properties
- Use PascalCase for class and component names
- Use single quotes for strings
- Use 4 spaces for identation
- Use async/await for asynchronous code
- Use template literals for strings that contain variables

## Unittesting

Unittesting is done using Mocha and Chai.
The individual unittests are connected and called in `src/unittests/quench.ts` with each stored in `src/unittests` in individual `sr5.<unitTest>.spec.ts` files.

## Architecture

The main components are within the `SR5Actor` and `SR5Item` document classes, connecting the main functionality. The system separates code between document classes, connecting everything, rule objects, handling the Shadowrun 5th edition rule system, and flow objects, connecting FoundryVTT and rule functionality.

The system implements dice throws and rule checks of the Shadowrun 5th edition rules within the `SuccessTest` class. This class and it's sub-classes are not unittests!

Data itself is stored in so called FoundryVTT document classes, which are:
- `SR5Item`
- `SR5Actor`
- `SR5Combat`
- `SR5Scene`
- `SR5Message`

All of these document classes contain FoundryVTT data, directly as properties on those classes object instances, and system related data stored in the `system` property directly on the objects. For example `SR5Item.system.attributes.body.value`.

### Layers of functionality

The system is designed in layers, with each layer responsible for a specific aspect of the functionality. This separation of concerns allows for easier maintenance and extensibility of the codebase.
The main layers are:
- documents
- sheets
- flows
- rules

Document classes provide the general API for all parts of the system to trigger functionality. These are FoundryVTT document classes that represent the various entities within the game world.
Sheet classes wrap a document class and render its contents onto a web user interface using handlebarjs. These are FoundryVTT objects that extend the document classes and add additional functionality for the user interface.
Flows wrap specific features or functions into a modularized file, either using objects or classes, allowing for better organization and reusability of code. Flows wrap both document and rule functionality. They can contain data manipulation and retrieval for other layers as well (documents, sheets); only rules shouldn't use flows.
Rules wrap Shadowrun 5e specific rule implementations into a modularized file, either using objects or classes, allowing for better organization and reusability of code. Rules should contain as little FoundryVTT functionality as possible.

Additionally there is a central data storage for inter document data exchange which is handled by the `DataStorage` class and `src/module/storage/storage.ts` combining multiple storage classes for data transfer.

## Core Game Mechanics

The Shadowrun 5th edition ttrpg has these core game mechanics:

- modifiers change values and are handled within the `SituationModifiers` class and sub-classes and uses the FoundryVTT active effects implemented with the `SR5eActiveEffect` class
- combat related rules, with ranged and melee combat
- combat initiative handling within the `SR5Combat` class
- magic related rules for spells and spirits
- matrix related rules for hacking, managing networks and devices
- technomancer related rules for matrix handling special to technomancers
- rigging related rules for driving vehicles and rolling tests with vehicles