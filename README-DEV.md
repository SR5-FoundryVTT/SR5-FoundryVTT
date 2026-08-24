# Local development environment

## General development
Shadowrun5e targets Foundry Virtual Tabletop 14 and uses TypeScript, esbuild, Sass, npm, and Gulp. Use Node
`>=24.13.1 <25.0.0`, matching the supported Foundry 14 application runtime. A global Gulp installation is not required.

Install [Node.js 24](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads), and a local Foundry 14
application. Then clone your fork and run:

```sh
npm ci
npm run watch:dev
```

The main npm commands are:

* `npm run watch:dev`: copy assets and rebuild development code, styles, templates, and tours as files change.
* `npm run watch:prod`: run the watcher with production feature flags.
* `npm run build:dev`: build application code and assets once for development.
* `npm run build:prod`: clean and build application code and assets once for production.
* `npm run build:db`: intentionally rebuild LevelDB compendium output under `/packs`.
* `npm run package`: build the production application and compendiums for a release.
* `npm run validate:packs`: validate and compile compendium sources in a temporary directory without touching live packs.
* `npm test`: type-check production and Quench test sources.

Stop Foundry before running `npm run build:db` or `npm run package`. A running Foundry process can lock the LevelDB pack
directories. Normal application builds do not compile packs and are safe to run independently.

The resulting application used for FoundryVTT will only use contents in `/dist`.

Development builds include the Quench registration code. Production builds exclude it.

## Linking the dev and system folder
It's helpful, but not strictly necessary, to place your development folder separate from the FoundryVTT system folder as a system update will overwrite your development folder otherwise. This can be done by linking the two. For this to work, the shadowrun5e system can't be installed in your local Foundry.

### Option B: (Windows) mklink
You can execute this command from within your `cmd` or `Windows Terminal`:
`mklink /D "C:\Users\<yourUser>\AppData\Local\FoundryVTT\Data\systems\shadowrun5e" "<yourClonedRepoPath>"`

<yourClonedRepoPath> must be the cloned repository that includes the `dist` folder within it.

## oxlint / Prettier

This project uses oxlint and Prettier to enforce code style and formatting.

It is strongly recommended to set up Prettier and oxlint in your IDE to run automatically as you develop. oxlint is also ran as part of the PR build pipeline.

The relevant commands are:
 * `npm run lint`: Run the linter, outputting all errors and warnings
 * `npm run lint:fix`: Run the linter, fixing all errors and warnings it can auto-fix and outputting the rest
 * `npm run lint:errors`: Run the linter, outputting only errors
 * `npm run lint:errors:fix`: Run the linter, fixing all errors it can auto-fix and outputting the rest
 * `npm run format:all`: Run Prettier over the configured repository files. Keep formatting-only changes separate from behavior changes.

Linting runs with `--type-aware`, which needs type information and therefore the `oxlint-tsgolint` binary that ships as
a dependency. Rules live in `.oxlintrc.json`.

## VS Code setup

The repository publishes portable tasks and extension recommendations under `.vscode`. The shared files contain no
machine-specific paths. If you want VS Code to launch Foundry, set `FOUNDRY_APP_PATH` and `FOUNDRY_DATA_PATH` in your
user environment and create an ignored `.vscode/launch.json`, for example:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Foundry VTT 14",
            "type": "node",
            "request": "launch",
            "program": "${env:FOUNDRY_APP_PATH}/main.mjs",
            "args": ["--dataPath=${env:FOUNDRY_DATA_PATH}", "--hotReload"],
            "cwd": "${env:FOUNDRY_APP_PATH}"
        }
    ]
}
```

These variables are local paths, not secrets, but they should remain in user configuration rather than committed files.

## Sourcebook citation tooling

Sourcebook citation data and the MCP server now live in the sibling `mcp-sourcebook-citation` project. This repo consumes that tooling but does not vendor the citation corpus, generated indexes, or the MCP implementation.

NOTE: this mcp server is currently available upon request from the system author team.

Typical setup:
 * Clone `mcp-sourcebook-citation` next to this repo.
 * Run `npm install` in that project.
 * Start the stdio MCP server with `npm run mcp:server` in that project, or register it as a VS Code MCP server.

Example VS Code MCP configuration:

```json
{
	"servers": {
		"sourcebook-citation": {
			"type": "stdio",
			"command": "node",
			"args": [
				"../mcp-sourcebook-citation/src/index.mjs"
			],
			"cwd": "../mcp-sourcebook-citation"
		}
	},
	"inputs": []
}
```

When the sourcebook corpus changes, rebuild and validate indexes from the standalone project instead:
 * `npm run build:indexes`
 * `npm run validate:indexes`
 * `npm run validate:mcp`

The standalone project README is the source of truth for citation tooling setup and data layout.

# System Architecture
A broad overview of the different areas of the shadowrun5e system. For more explanations around system specific concepts see `System Concepts`.
## Folder structure
Everything needed to execute the system within foundry must live under 
* `/dist`
FoundryVTT compendium packs are used as is:
- `/packs`
Data that needs to be copied into `/dist` as is during build:
* `/public`
Source code 
- `/src`


## Translations
The FoundryVTT language config files used by Foundry are at `/dist/locale/<language>/config.json`. The `/dist` directory
is generated, so translation changes belong in `/public/locale/<language>/config.json`. Application build and watch
commands copy those files into `/dist/locale`.

In order to get your translation changes to the `/public` language files into the system, you'll have to create a GitHub pull request against the systems `master`/`main` branch. 

## Separation
More and more parts of the system move to separate modules organized into these broad layers:
All following folder reference are relative to src\module\*
* Rules layer. Shouldn't contain any references to Foundry objects. At best system objects should be used (like a PartsList)
  These live in the rules\ folder
* Flow layer. Should use the rules modules to introduce an order of operations for them and collect and output information. This will contain Foundry objects. These live in item\flows and actor\flows.
* Application layer. Handle interface operations. Dialogs. Application windows. Chat Message creation and so forth.
* Tests layer. Whenever any Shadowrun test is implemented it should extend the SuccessTest class. All tests live in the tests\ folder. See `Test Implementation` for more details.

Additional separations are made for
* Initial data generation of items or template partials

## Branches and Pull Requests
We'll gladly accept pull requests for all things moving the system forward. :)

The system branch workflow is simple:
`master` is the main stable branch and the default target for pull requests. CI installs from the lockfile, type-checks
production and Quench sources, checks error-level lint findings, builds application assets, and validates compendium
sources; all required checks must pass.

`release/**` is the active branch for upcoming releases. It's temporary and will be removed once merged into `master`. If you're actively working on changes for that release, you can pull from it and address your pull request into it. It's setup using the same GitHub action as `master`. You should only pull from this branch, if you need commits in its history. Otherwise, use `master`.

## Unittesting
There is unit testing support using the FVTT Quench module. It's encouraged to do some unit testing where possible but it's not mandatory. Rule modules should always contain some testing, while flow modules are encouraged to have some. Any application layers don't need testing. See the structure section for some broad overview over different layers / modules. 

Afterwards open a terminal (cmd.exe on Windows) with administrative permissions ([see here for help](https://www.howtogeek.com/194041/how-to-open-the-command-prompt-as-administrator-in-windows-8.1/)):
* `cd <the_cloned_fork_directory>`

You should see a success message and a little arrow symbol on the shadowrun5e folder within the FoundryVTT _Data/systems_ directory. Now you can use the Gulp watch-Task as described above. This needs to be repeated after each Shadowrun5eVTT system update.

### Running Quench locally

The Quench runner connects to an existing Foundry development world and tests the currently checked-out
branch. It does not build the system or start Foundry.

* Run `npm run watch:dev` or `npm run build:dev` so the development system is available to Foundry.
* Install Quench in the same Foundry data directory and launch a world using the development system.
* Install the browser once with `npx playwright install chromium`.
* Run `npm run quench`.

The runner prints one line per test as it runs (`✓` pass, `✗` fail, `○` pending), then a failure
summary with source-mapped stack traces and final counts. It exits with code `1` if any tests fail.

#### CLI usage

```sh
npm run quench                             # full suite (shadowrun5e.**)
npm run quench -- shadowrun5e.rules.**     # one batch by pattern
npm run quench -- --headed                 # open a visible browser window
```

#### Configuration via `.env.local`

Create a `.env.local` file in the repo root (it is gitignored) to override defaults:

```sh
# URL of the running Foundry instance (default: http://localhost:30000)
FOUNDRY_URL=http://localhost:30001

# Username to join the world as (default: Gamemaster)
FOUNDRY_USER=Gamemaster

# Default test pattern when none is given on the command line (default: shadowrun5e.**)
QUENCH_PATTERN=shadowrun5e.rules.**

# Watchdog timeout for the full run in milliseconds (default: 600000)
QUENCH_RUN_TIMEOUT=600000

# Set to 1 to print raw browser console output (useful for debugging)
QUENCH_PAGE_LOGS=0
```

Values already set in your shell environment take precedence over `.env.local`.


# System Concepts
General concepts as used in the shadowrun5e system.
## Test implementation (Success Test)
The shadowrun5e system implements Shadowrun 5e Success Tests as implementations of the `SuccessTest` class. These implementations are connected to items containing `action` segments. An `action` segment defines values and implementations to use for all tests related to that action.

While a `SuccessTest` implementation doesn't need an `action` to function, it's advised to trigger tests via casting actions.

For further details see the `SuccessTest` class docs and `TestCreation` docs.
### General structure
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
### Test creation
If you don't know how to create a `SuccessTest` implementation the helper function within `TestCreator` available at `game.shadowrun5e.test`
provide a few different options. These are meant as system internal helpers to simplify the different ways to create tests
into one helper and not pollute the general `SuccessTest` class.
#### Value application
Tests can be created with values from these sources:
- action
- test action defaults
- test action based on documents

These different value providers will be merged in order of distance to the user by `TestCreator`, allowing a test implementation to take values from all of these sources and overwrite only those necessary. The closest user distance is given by the action, followed by the documents.

### Class structure
Everything is based on the `SuccessTest` class, which defines general testing flow and also handles Foundry related interaction.

The different Shadowrun 5 test types are created using subclasses:
- OpposedTest
- TeamworkTest
### Test flow
Triggering an active success test through an action will always show a dialog and chat message, both of which are optional.

Should the action define a followup test, it will be initiated immediately for the active user.

Opposing tests must be triggered manually by targeted actors through the chat message of the original active success test. Should the original action define a resist test, it will be initiated immediately for the opposing user.

These behaviors are implemented within the `SuccessTest` and `OpposedTest` base classes and can be altered by implementing classes.

### Actions and tests
Test implementations can be created fully without actions, though most players will trigger tests using any of the action items (action, weapon, spell, ...).

Values from actions are taken to create configured test implementation. In general whenever a test defines default values (attributes, skill, modifiers, categories) these can be fully overwritten by what the action configures the test to use. If an action is given no configuration for any of a value, the default value of the test implementation will be used.

### Tests and Active Effects
Active Effects can apply to tests, both in general and with a specific filter.

#### Test implementations
Active Effects can target specific test implementations. In this case, the effect will only apply to actions using these tests.

In general this should be used sparingly and is mostly a technical way of addressing tests. Instead, try using action categories. If you're missing an action category, inform us on our Discord channel on the FoundryVTT server or, better, the GitHub issues.

#### Categories
Tests and actions can have categories. These are used to give tests a set of labels, allowing them to be targeted by an Active Effect.

Typical use cases would be:
- matrix => a matrix action
- spell => any spell action
- social => any social skill action
- climbing => a climbing action

Categories can be mixed and matched at will and don't have to adhere to sr5 rules.

## Modifier implementation
The shadowrun5e system has multiple ways of handling modifiers on actors, items and 'situations':
- actor local modifiers
- situational modifiers
  
To define what modifiers a Shadowrun 5e Test uses an `action` can define a set of modifiers to use. These modifiers will be taken using the actors `ModifiersFlow` handler, sitting in between tests and modifiers applied onto a document.
### Actor local modifiers
The legacy modifiers are flat values for actors, which are taken as is and can be prepared during Document prepareData.

Examples for these are modifiers for movement, armor and physical overflow.
### Situational modifiers
These modifiers depend upon the current situation a token / actor finds itself in at the moment. These can't be prepared beforehand but must be recalculated before values for each test can be used. They can be stored on all document types, but tend to be only on `Scene` and `SR5Actor` documents, which will be merged to a resulting situational modifier.

This allows GMs to define broad situation modifiers for all actors on a specific scene, while also allowing to change some or all modifiers on an per actor basis as well.

Examples for these are environmental, noise and recoil.
These modifiers can also be used to apply rules that need to recalculate between tests or combat turns or other changing events outside of an actors context or data preparation.

## Actions
Any item can contain the action template allowing it to cast it as a Shadowrun 5e success test.


# Extending compendium contents

FoundryVTT uses nedb to implement their compendiums, internally called packs. These nedb's are build from scratch on each release and need source document json files to be built from.

If changes are to be made on compendium items, you can either make those directly within their source file underneath `./packs/_source` or using Foundry GUI. To make these changes persistent, extract compendium content to their source using `node ./utils/packs.mjs package unpack`. Since source documents are stored using their name, be careful when changing that and compare their on disk name with expectations. Reserved filesystem basenames are exported with a leading `_` for portability, while the internal Foundry document name in the JSON stays unchanged.

Since nedb packs aren't stored in git, changing pack contents will trigger changes for system compendiums as soon as the next GitHub release workflow is triggered.
