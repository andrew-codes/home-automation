import { seal } from "tweetsodium"
import { Octokit } from "@octokit/core"
import { isEmpty } from "lodash"

const createClient =
  (token: string | undefined = process.env.GITHUB_TOKEN) =>
  async (
    owner: string,
    repo: string,
    name: string,
    secretValue: string,
    repositoryIds: string[] = [],
  ): Promise<void> => {
    if (!token) {
      throw new Error(
        "Token not provided. Either use GITHUB_TOKEN env variable or provide a token to the client creation function.",
      )
    }
    if (isEmpty(repositoryIds)) {
      throw new Error("Please provide a collection of repository IDs.")
    }
    const octokit = new Octokit({ auth: token })
    const {
      data: { key, key_id },
    } = await octokit.request(
      `GET /repos/${owner}/${repo}/actions/secrets/public-key`,
      {
        owner,
        repo,
      },
    )
    const messageBytes = Buffer.from(secretValue)
    const keyBytes = Buffer.from(key, "base64")
    const encryptedBytes = seal(messageBytes, keyBytes)
    const encrypted = Buffer.from(encryptedBytes).toString("base64")

    await octokit.request("PUT /user/codespaces/secrets/{secret_name}", {
      secret_name: name,
      encrypted_value: encrypted,
      key_id,
      selected_repository_ids: repositoryIds,
    })
  }

export default createClient
