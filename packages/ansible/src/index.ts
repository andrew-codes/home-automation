import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const runPlaybook = async (
  playbookPath: string,
  hosts: Array<string>,
  vars?: Record<string, any> | undefined,
  privateKeyPath?: string | undefined,
): Promise<void> => {
  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  logger.info(`Running playbook ${playbookPath} on hosts ${hosts.join(",")}`)
  await throwIfError(
    sh.exec(
      `ansible-playbook --inventory "${hosts.join(
        ",",
      )}," --extra-vars '${JSON.stringify(vars, null)}' ${!!privateKeyPath ? `--private-key ${privateKeyPath}` : ""} ${playbookPath};`,
      { async: true, silent: false },
    ),
  )
}

export { runPlaybook }
