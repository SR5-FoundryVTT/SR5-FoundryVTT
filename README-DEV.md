# Local development environment

## General development
The main development workflow uses a build system using npm and gulp with Github pull requests required for changes made. None of this is required for issues, content or translations described above! This process can be involved and should a step fail with errors please search the web first.

Shadowrun5e uses Typescript, npm with gulp and git. Follow these installation manuals: 
* [https://www.npmjs.com/get-npm](https://www.npmjs.com/get-npm)
* [https://github.com/git-guides/install-git#:~:text=To%20install%20Git%2C%20navigate%20to,installation%20by%20typing%3A%20git%20version%20.](https://github.com/git-guides/install-git#:~:text=To%20install%20Git%2C%20navigate%20to,installation%20by%20typing%3A%20git%20version%20.)

Afterwards follow these steps using your terminal (cmd.exe on Windows):
* `npm install --global gulp-cli`
* Follow this manual on how to work with a Github forking and cloning, git branches and Github pull requests ([https://opensource.com/article/19/7/create-pull-request-github](https://opensource.com/article/19/7/create-pull-request-github))
* `cd <the_cloned_fork_directory>`
* `npm install` (this will take a while)
* `gulp watch`
* Start developing

There are multiple gulp tasks available to help development:
* watch => rebuild the system after a change is detected
* build => rebuild the system once, manually
* link => See section below

In general the application within FoundryVTT will use what's the build process puts into _dist/_, while most else isn't needed to function but only to provide sources.

## Unittesting
Since 0.7.13 there is unit testing support using the FVTT Quench module (https://github.com/schultzcole/FVTT-Quench). This module isn't available on the Foundry VTT module store and needs to be manually installed by developers in order to run unittests within a Foundry environment. It's encouraged to do some unit testing where possible. Rule modules should always contain some testing, while flow modules are encouraged to have some. Any application layers don't need testing. See the structure section for some broad overview over different layers / modules.

### Linking the dev and system folder
It's helpful, but not strictly necessary, to place your development folder separate from the FoundryVTT system folder as a system update will overwrite your development folder otherwise. This can be done with linking the two.

For the `gulp link` command to work, you need to include the following file as _foundryconfig.json_ directly underneath your development shadowrun5e system directory.
`{
  "dataPath": "C:\\Users\\<addYourUserHere>\\AppData\\Local\\FoundryVTT\\",
  "linkTargetDirName": "shadowrun5e"
}
`

Afterwards open a terminal (cmd.exe on Windows) with administrative permissions ([see here for help](https://www.howtogeek.com/194041/how-to-open-the-command-prompt-as-administrator-in-windows-8.1/)):
* `cd <the_cloned_fork_directory>`
* `gulp link` (should this fail, remove the existing shadowrun5e system or check for administrative permissions)

You should see a success message and a little arrow symbol on the shadowrun5e folder within the FoundryVTT _Data/systems_ directory. Now you can use the Gulp watch-Task as described above. This needs to be repeated after each Shadowrun5eVTT system update.


## Linux and docker workflow changes

On Linux you can use `docker` (or another container runtime like `podman`) to
quickly setup a local instance of `foundry`:

This will use `docker-compose` (or `podman-compose`) to manage the containers.

It requires some manual setup to make the `foundryvtt.zip` avaiable for
installation:

1. Create a `data` and a `data/cache` directory - this will host all files of
   the installation: `mkdir -p data/cache`
2. Download the desired version of foundry from your account as `zip` and place
   it inside the `data/cache` folder (this version has to match the version of
   the container-image in `docker-compose.yml`):

``` sh
wget -O data/cache/foundryvtt-$SOME_VERSION.zip $URL_TO_DOWNLOAD_LINK
```
3. Spin up `foundryvtt` using `docker-compose`:

``` sh
# This command must be run inside the root directory of this repository
# It will automatically symlink this system into data/Data/systems
docker-compose up
```

Now an instance of `foundryvtt` will be running on http://localhost:30000

If you need to restart the instance:

``` sh
docker-compose down
docker-compose up
```

# System Architecture

## Folder structure
The system in general lives under 
* src\module
* src\css
* src\templates

The systems tests live under 
* src\test

## Design
More and more parts of the system move to separtate modules organized into these broad layers:
* Rules layer. Shouldn't contain any references to Foundry objects. At best system objects should be used (like a PartsList)
  These live in the rules\ folder
* Flow layer. Should use the rules modules to introduce an order of operations for them and collect and output information. This will contain Foundry objects. These live in item\flows and actor\flows.
* Application layer. Handle interface operations. Dialogs. Application windows. Chat Message creation and so forth.

Additional separations are made for
* Initial data generation of items or template partials

