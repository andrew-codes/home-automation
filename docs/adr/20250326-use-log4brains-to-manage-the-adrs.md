# Use Log4brains to manage the ADRs

- Status: accepted
- Date: 2025-03-25
- Tags: dev-tools, doc

## Context and Problem Statement

We want to record architectural decisions made in this project and make them readily consumable.
Which tool(s) should we use to manage these records?

## Considered Options

- [Log4brains](https://github.com/thomvaill/log4brains): architecture knowledge base (command-line + static site generator)
- [ADR Tools](https://github.com/npryce/adr-tools): command-line to create ADRs
- Incorporating into existing docs site (Gatsby) for consumption.

## Decision Outcome

Chosen option: "Log4brains", because it includes the features of all the other tools. It also outputs a readily consumable format (website).

### Positive Consequences

- Tooling to create, write and manage ADRs.
- Do not need to implement the user experience.

### Negative Consequences

- Site is a hosted in a separate running instance. This makes it more challenging to present in a unified documentation site which already exists as a Gatsby site.
- Site will not match the look and feel of the existing documentation website.
