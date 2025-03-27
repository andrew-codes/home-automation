# Infrastructure as Apps

- Status: draft
- Deciders: Andrew Smith
- Date: 2025-03-27
- Tags: devops

## Context and Problem Statement

Applications can be deployed to applications or to provisioned infrastructure. For example, the k8s app deploys Kubernetes to a provisioned LXC container in Proxmox. However, most applications are not deployed directly to infrastructure, but to Kubernetes, which is also an app. This is more confusing than the rule: all apps deploy to infrastructure. Additionally, the deployment of apps that require provisioning is a one-time action, much like provisioning itself.

Should apps that run directly on a VM or as an un-orchestrated containers be considered infrastructure and therefore have the provision action include both hardware and software provisioning?

## Decision Drivers

- Infrastructure deployments are only required ot occur once, but currently occur on every deployment.
- Infrastructure deployments are generally longer and slow down the deployment process as a whole.
- Frequent intermittent failures can occur on infrastructure deployments which prevent all other deployments from happening.

## Considered Options

1. Keep as-is
2. Treat infrastructure deployments as provisioning

## Decision Outcome

Chosen option: "Option 2: Treat infrastructure deployments as provisioning", because it is the only proposed option that solves all drivers of the problem space. In doing so, it improves the overall quality and reliability to deploy apps from the repo.

### Positive Consequences

- Faster app deploy times
- Fewer app deployment failures
- Enables the use of automated deployment tools such as [ArgoCD](https://argo-cd.readthedocs.io/en/stable/)
