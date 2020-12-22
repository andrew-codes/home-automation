#!/usr/bin/env ts-node

import { createSeal } from ".."

const { GITHUB_RUNNER_TOKEN } = process.env
const [, , owner, repo, name, value] = process.argv

const seal = createSeal(GITHUB_RUNNER_TOKEN)

async function run() {
  await seal(owner, repo, name, value)
}
run()
