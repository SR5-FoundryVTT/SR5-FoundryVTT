# Local development environment

## Linux

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

