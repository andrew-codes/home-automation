import { Octokit } from "@octokit/core"
import { isEmpty } from "lodash"
import encrypt from "./encrypt"

const createClient = async (
  token: string | undefined = process.env.GITHUB_TOKEN,
  repositoryIds = [],
) => {
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
  } = await octokit.request(`GET /user/codespaces/secrets/public-key`, {})

  return {
    set: async (name: string, secretValue: string): Promise<void> => {
      try {
        await octokit.request(`POST /user/codespaces/secrets/${name}`, {
          secret_name: name,
          encrypted_value: encrypt(key, "change me"),
          key_id,
          selected_repository_ids: repositoryIds,
        })
      } catch (error) {}
      await octokit.request(`PUT /user/codespaces/secrets/${name}`, {
        secret_name: name,
        encrypted_value: encrypt(key, secretValue),
        key_id,
        selected_repository_ids: repositoryIds,
      })
    },
  }
}

export default createClient
