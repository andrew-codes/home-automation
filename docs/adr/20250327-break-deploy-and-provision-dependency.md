# Break Deploy and Provision Dependency

- Status: accepted
- Deciders: Andrew Smith
- Date: 2025-03-27
- Tags: devops

## Context and Problem Statement

Deployments automatically attempt to provision resources for the respective application. Failures to provision will prevent all deployments from being completed. Provisioning failures can easily occur due to the Terraform provisioned state being out of sync with the actual resources.

There are several ways for this state to become stale or out of sync:

- Attempting to deploy from two different local environments; Terraform state is not shared
- CI agents (different environments from the original deployment); Terraform state is not shared
- Deploying, then removing the local Terraform state

Should applications' deployments automatically provision their needed resources?

## Decision Drivers

- Failed deployments due to provision errors despite resources already existing/provisioned.
- Difficulties automating deployments due to lack of shared Terraform state with CI agents.
- Terraform state may be sensitive and should not be committed to the repo.

## Considered Options

1. Keep dependency as-is
1. Provision is a separate activity

## Decision Outcome

Chosen option: "option 2: Provision is a separate activity", because it addresses all three decision drivers while also reducing the initial setup effort.

### Positive Consequences

- Reduced effort and instructions for getting started with a new home lab; requiring fewer manual steps and less setup work.
- Enables the possibility of using deployment tooling, e.g. [ArgoCD](https://argo-cd.readthedocs.io/en/stable/).

## Pros and Cons of the Options

### Option 1: Keep as-is

Share Terraform state between all environments; local, CI or otherwise. This ensures the state is in sync and re-running provision targets become idempotent.

- Good, because it removes a manual step required on first deploy of applications.
- Bad, because it requires a dedicated shared space; requiring additional manual setup of shared directory.
- Bad, because the setup required to get started is more involved and with additional nuance/caveats/special cases that must be communicated.

### Option 2: Provision is a separate activity

Provisioning applications becomes a manual step that occurs only once, prior to any deployments.

- Good, because this does not require any additional, manual setup steps of configuring a shared directory.
- Good, because the complexity of configuring automated deployments is reduced
- Good, because CI agents do not need access to a local, shared directory; allowing them to be run in the Cloud.
- Bad, because it is possible to attempt deployments without having first provisioned resources.
