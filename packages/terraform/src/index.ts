import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const apply = async (
  vars?: Record<string, any> | undefined,
  cwd?: string | undefined,
  dataDir?: string | undefined,
): Promise<void> => {
  for (const [key, value] of Object.entries(vars ?? {})) {
    sh.env[`TF_VAR_${key}`] = value.toString()
  }
  sh.env["TF_DATA_DIR"] = dataDir ?? ".terraform"

  logger.info("Applying terraform")
  await throwIfError(
    sh.exec(
      `terraform init --upgrade && terraform plan --out=tfplan && terraform apply "tfplan"`,
      { async: true, silent: true, cwd: cwd ?? process.cwd() },
    ),
  )
}

export { apply }
