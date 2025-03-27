# Documentation stored in root/docs directory

- Status: proposed
- Deciders: Andrew Smith
- Date: 2025-03-27
- Tags: docs

## Context and Problem Statement

Documentation source is hard to find when cloning the repo. There is a need for cross-project documentation that exists in `./docs` or the docs docs app (the documentation website). Documentation related directly a single app or package is stored alongside the respective project.

Should all documentation be consolidated into a single directory located in `./docs` of the repo?

## Decision Drivers

- Inconsistent documentation storage locations; adr is in `./docs` while docs app is with the source code of the docs app.
- It is unclear for any documentation content where its source is stored.

## Considered Options

1. Single storage location
2. Store with each project

## Decision Outcome

Chosen option: "Option 1: single storage location", because the driving problems deemed as legitimate and option 1 is the only option that addresses them. Additionally, there are some pros for option 2 that could be debated on their correctness.

### Positive Consequences

- Simplified docs app configuration by removing the need to calculate all projects' docs directory as a source.

### Negative Consequences

- Increased complexity in docs app configuration; some files are excluded from page creation, e.g., adr files.

## Pros and Cons of the Options

### Option 1: Single storage location

Store all docs in a single directory, located in root of repo, e.g., `./docs`. This directory also becomes a project, with a project.json. The docs app takes an implicit dependency on this project.

- Good, because it removes the mental decision tree required to find where documentation is stored.
- Good, because documentation is more discoverable from within the repo.
- Good, because the configuration of the docs website is simplified, with only a single source for documentation source files.
- Good, because the workflow write and maintain documentation is simplified.
- Good, because it ensures the docs app can invalidate the compile target on documentation updates.
- Bad, because project specific documentation no longer lives with the project; making each project less encapsulated.

### Option 2: Store with each project

Cross-project documentation is stored in `./docs`; removing it from the docs app. Project specific content is stored in a `docs` directory underneath the project's root directory.

- Good, because it reduces the friction of context switching for the developer to look at project level docs while working in a project.
- Good, because the project becomes more fully encapsulated by including its relevant documentation.
- Bad, because it introduces high friction to writing and maintaining documentation.
