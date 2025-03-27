# Break Deploy and Provision Dependency

- Status: draft
- Deciders: Andrew Smith
- Date: 2025-03-27
- Tags: devops

Technical Story: [description | ticket/issue URL] <!-- optional -->

## Context and Problem Statement

The provisioning or application resources is not always idempotent and can have intermittent failures due to failed connections to target machines. This can block the deployment of applications even if the resources are already provisioned.

Should applications' deployments automatically provision their needed resources?

## Decision Drivers <!-- optional -->

- Failed deployments due to intermittent provision errors despite resources already existing/provisioned.
- Difficulties when automating deployments with source changes.

## Considered Options

- Keep dependency of targets; persist Terraform provisioning state in a central location accessible by both dev and CI.
- Provision is a separate activity that must be done prior to deployments.

## Decision Outcome

Chosen option: "[option 1]", because [justification. e.g., only option, which meets k.o. criterion decision driver | which resolves force force | … | comes out best (see below)].

### Positive Consequences <!-- optional -->

- [e.g., improvement of quality attribute satisfaction, follow-up decisions required, …]
- …

### Negative Consequences <!-- optional -->

- [e.g., compromising quality attribute, follow-up decisions required, …]
- …

## Pros and Cons of the Options <!-- optional -->

### [option 1]

[example | description | pointer to more information | …] <!-- optional -->

- Good, because [argument a]
- Good, because [argument b]
- Bad, because [argument c]
- … <!-- numbers of pros and cons can vary -->

### [option 2]

[example | description | pointer to more information | …] <!-- optional -->

- Good, because [argument a]
- Good, because [argument b]
- Bad, because [argument c]
- … <!-- numbers of pros and cons can vary -->

### [option 3]

[example | description | pointer to more information | …] <!-- optional -->

- Good, because [argument a]
- Good, because [argument b]
- Bad, because [argument c]
- … <!-- numbers of pros and cons can vary -->

## Links <!-- optional -->

- [Link type](link to adr) <!-- example: Refined by [xxx](yyyymmdd-xxx.md) -->
- … <!-- numbers of links can vary -->
