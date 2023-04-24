# Reusable Workflows for Developing GitHub Actions

The repository contains [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) and
provides a collection of workflow templates that facilitate the development of GitHub actions across several
repositories.

## Background

These workflows are designed to help streamline common development tasks, such as building and testing code, deploying
applications. By using reusable workflows, developers can save time and effort by avoiding
the need to recreate the same workflows across multiple repositories. Additionally, the repository includes
documentation and best practices for creating and sharing reusable workflows.

## Available workflows

### Node.js application validation

This workflow **compiles** and **tests** the code. Additionally, it starts **Postgres** and **Redis** services that may
be required to run the tests. Optionally, it checks that the code adheres to **linting** rules and can run `npm audit`
on
the packages in the repository.

#### Usage

```yaml
node-validation:
  uses: AplinkosMinisterija/reusable-workflows/.github/workflows/node-validation.yml@main
  with:
    runs-on: ubuntu-latest
    working-directory: backend
    cache-dependency-path: backend/package-lock.json
    node-version: 18.x
    node-caching: npm
    audit-level: none
    enable-linter: false
    postgres-user: postgres
    postgres-password: postgres
    postgres-db: auth-test
    postgres-port: 5438
    redis-port: 6673
```

For additional information
see [node-validation.yml](https://github.com/AplinkosMinisterija/reusable-workflows/blob/main/.github/workflows/node-validation.yml)

### Build & push docker image

This workflow automates the building, tagging, and pushing of Docker images to GitHub's Container Registry.

#### Usage

```yaml
docker-build-push:
  uses: AplinkosMinisterija/reusable-workflows/.github/workflows/docker-build-push.yml@main
  with:
    docker-image: ghcr.io/AplinkosMinisterija/biip-auth
    docker-context: backend
    environment: production
    runs-on: ubuntu-latest
    docker-platforms: 'linux/amd64,linux/arm64'
    latest-tag: true
    git-ref: 1084a50
```

For additional information
see [docker-build-push.yml](https://github.com/AplinkosMinisterija/reusable-workflows/blob/main/.github/workflows/docker-build-push.yml)

## Inspiration

The inspiration behind this project comes
from [actions/reusable-workflows](https://github.com/actions/reusable-workflows).

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE.txt)

## Contributing

Contributions are welcome! See [Contributor's Guide](CONTRIBUTING.md)