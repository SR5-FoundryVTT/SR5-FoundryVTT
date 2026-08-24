# Contributing

Thanks for helping improve Shadowrun 5th Edition for Foundry VTT. Submit bug fixes and small features to `master`.
Implement significant features on an active `release/**` branch; if none exists, use `master`.

## Development setup

Use Node `>=24.13.1 <25.0.0` and Foundry VTT 14. Run `npm ci` after cloning; no global Gulp installation is needed. See
[README-DEV.md](README-DEV.md) for linking, watching, editor, and Quench instructions.

Before opening a pull request, run:

```sh
npm test
npm run lint:errors
npm run build:prod
npm run validate:packs
```

Stop Foundry before intentionally rebuilding live LevelDB packs with `npm run build:db` or `npm run package`.

Keep behavioral, dependency, and bulk-formatting changes separate. Add or update Quench coverage for rule behavior when
practical, describe manual Foundry checks in the pull request, and never commit secrets, personal filesystem paths,
generated `dist` output, or compiled packs.

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Report security issues through the
private process in [SECURITY.md](SECURITY.md), not a public issue.
