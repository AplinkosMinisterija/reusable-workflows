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
    postgres-user: postgres-user
    postgres-password: postgres-password
    postgres-db: my-db
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
    docker-image: ghcr.io/AplinkosMinisterija/example-monorepo
    docker-context: backend
    environment: production
    runs-on: ubuntu-latest
    docker-platforms: 'linux/amd64,linux/arm64'
    latest-tag: true
    git-ref: 1084a50
    push: true
```

For additional information
see [docker-build-push.yml](https://github.com/AplinkosMinisterija/reusable-workflows/blob/main/.github/workflows/docker-build-push.yml)

## Using workflows in real-life

### Continuous Integration

To ensure continuous integration in a real-world scenario, I would like to create workflows that:

- Compile, run, lint, and audit Node.js applications.
- Use Postgres and Redis for testing purposes.
- Work efficiently with a monorepo.
- Include caching to speed up the workflow process.

#### Example

<details open>
    <summary>ci.yml</summary>

```yaml
name: Continuous Integration

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  validate-backend:
    name: Validate backend
    uses: AplinkosMinisterija/reusable-workflows/.github/workflows/node-validation.yml@main
    with:
      working-directory: backend
      cache-dependency-path: backend/package-lock.json
      runs-on: ubuntu-latest
      node-version: 18.x
      audit-level: critical
      enable-linter: true
      postgres-user: postgres
      postgres-password: postgres
      postgres-db: my-db
      postgres-port: 5438
      redis-port: 6673
``` 

</details>

### Continuous deployment

To ensure continuous deployment in a real-world scenario, I would like to create workflows that:

- Utilize [Trunk-based development](https://trunkbaseddevelopment.com/) as a version control management practice.
- Have three environments:
    - Development, used for testing non-production ready features.
    - Staging, which always points to the `main` branch.
    - Production which deploys after
      publishing [new release in GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
      and uses [Semantic Versioning](https://semver.org/).
- Include caching to speed up the process.
- Be able to push
  to [GitHub Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
  with meaningful image tags.
- Build a multi-arch image that supports AMD64 and ARM64 architectures.

#### Examples

<details open>
    <summary>deploy-development.yml</summary>

```yaml
name: Deploy to Development

on:
  workflow_dispatch:
    inputs:
      git-ref:
        description: Git Ref (Optional)
        required: false

concurrency: deploy-to-development

jobs:
  docker-build-push:
    name: Build & push docker image
    uses: AplinkosMinisterija/reusable-workflows/.github/workflows/docker-build-push.yml@main
    with:
      docker-image: ghcr.io/aplinkosministerija/example-monorepo
      docker-context: backend
      environment: development
      runs-on: ubuntu-latest
      git-ref: ${{ github.event.inputs.git-ref }}
      push: true

  deploy:
    name: My Deployment
    needs: [ docker-build-push ]
    runs-on: ubuntu-latest

    steps:
      - run: echo "TODO"
```

</details>

<details>
    <summary>deploy-staging.yml</summary>

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ main ]

concurrency: deploy-to-staging

jobs:
  docker-build-push:
    name: Build & push docker image
    uses: AplinkosMinisterija/reusable-workflows/.github/workflows/docker-build-push.yml@main
    with:
      docker-image: ghcr.io/aplinkosministerija/example-monorepo
      docker-context: backend
      environment: staging
      runs-on: ubuntu-latest
      push: true

  deploy:
    name: My Deployment
    needs: [ docker-build-push ]
    runs-on: ubuntu-latest

    steps:
      - run: echo "TODO"
```

</details>

<details>
    <summary>deploy-production.yml</summary>

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'

concurrency: deploy-to-production

jobs:
  docker-build-push:
    name: Build & push docker image
    uses: AplinkosMinisterija/reusable-workflows/.github/workflows/docker-build-push.yml@main
    with:
      docker-image: ghcr.io/aplinkosministerija/example-monorepo
      docker-context: backend
      environment: production
      runs-on: ubuntu-latest
      latest-tag: true
      push: true

  deploy:
    name: My Deployment
    needs: [ docker-build-push ]
    runs-on: ubuntu-latest

    steps:
      - run: echo "TODO"
```

</details>

## Inspiration

The inspiration behind this project comes
from [actions/reusable-workflows](https://github.com/actions/reusable-workflows).

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

## Contributing

Contributions are welcome! See [Contributor's Guide](CONTRIBUTING.md)