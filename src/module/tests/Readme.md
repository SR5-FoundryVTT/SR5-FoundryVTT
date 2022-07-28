# Test implementation

Shadowrun5e system uses a action based testing system with a system specific implementation for what defines a success test within Shadowrun 5th edition.

## General structure
* Anything testable defines an action
* An action can have multiple tests connected to it:
  * An active test
  * A followup to the active test
  * An opposed test
  * A resist test for the opposed test
* Each of these defines at least what test to use and allows for skill/attributes to be configured, should the user want to
* If there is no user configured test action default action values will be used that are connected to the test implementation
* All test implementations are registered within `game.shadowrun5e.tests` and only taken and created from there
* Modules can, in theory, overwrite a registered test implementation by replacing the implementation for a test within that registry

## Test creation
If you don't know how to create a `SuccessTest` implementation the helper function within `TestCreator` available at `game.shadowrun5e.test`
provide a few different options. These are meant as system internal helpers to simplify the different ways to create tests
into one helper and not pollute the general `SuccessTest` class.

## Class structure
Everything is based on the `SuccessTest` class, which defines general testing flow and also handles Foundry related interaction.
The different Shadowrun 5 test types are created using subclasses:
- OpposedTest
- TeamworkTest