# Security Policy

Security fixes are provided for the current release line targeting Foundry VTT 14. Older system and Foundry versions may
no longer receive fixes.

Do not open a public issue for a suspected vulnerability. Use GitHub's
[private vulnerability reporting form](https://github.com/SR5-FoundryVTT/SR5-FoundryVTT/security/advisories/new) and
include affected versions, impact, reproduction steps, and any suggested mitigation. Avoid including real credentials,
private world data, or copyrighted game content.

Maintainers will acknowledge a usable report when available, investigate it privately, and coordinate disclosure after a
fix or mitigation is ready. Ordinary bugs without a security impact should use the public issue tracker.

The development-only Foundry type declarations currently pull in `showdown@2.1.0`, for which npm reports unresolved
moderate advisories. It is not imported by this project and is verified absent from the production browser bundle. Track
its removal or replacement in the maintained Foundry-types fork; do not treat it as a shipped runtime dependency.
