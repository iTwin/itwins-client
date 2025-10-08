# Release Process

## Pr phase

Before committing finishing a PR run `pnpm changeset` or `pnpm changeset --empty` to generate a new changeset. The changeset will either be a major minor or patch change.
Empty is only for non-version impacting changes.
This will generate a file in the .changeset folder that will have the change description of what you have worked on.

## Publishing phase

### Publishing

Go to [actions](https://github.com/iTwin/itwins-client/actions) on github and run `Changesets Release` github action. This will create a release tag, github release, version the package, create a release pr, and publish the npm package.

### Post branch release

A Pr will be created from release branch pointing at main. Merge PR in and feel free to delete.