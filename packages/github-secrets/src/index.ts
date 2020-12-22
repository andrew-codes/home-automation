import { seal } from "tweetsodium"
import { Octokit } from "@octokit/core"

const createSeal = (githubToken) => {
  if (!githubToken) {
    throw new Error(
      "No GITHUB_RUNNER_TOKEN defined, Check your secrets.sh file."
    )
  }

  return async (owner, repo, name, value) => {
    if (!owner || !repo || !name || !value) {
      throw new Error("Owner, repo, name and value are required.")
    }
    const octokit = new Octokit({ auth: githubToken })

    const {
      data: { key, key_id },
    } = await octokit.request(
      `GET /repos/${owner}/${repo}/actions/secrets/public-key`,
      {
        owner,
        repo,
      }
    )
    const messageBytes = Buffer.from(value)
    const keyBytes = Buffer.from(key, "base64")
    const encryptedBytes = seal(messageBytes, keyBytes)
    const encrypted = Buffer.from(encryptedBytes).toString("base64")

    await octokit.request(
      `PUT /repos/${owner}/${repo}/actions/secrets/${name}`,
      {
        key_id,
        owner,
        repo,
        secret_name: name,
        encrypted_value: encrypted,
      }
    )
  }
}

export { createSeal }
