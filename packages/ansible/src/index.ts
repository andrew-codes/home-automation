import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const runPlaybook = async (
  playbookPath: string,
  hosts: Array<string>,
  vars?: Record<string, any> | undefined,
): Promise<void> => {
  sh.env["ANSIBLE_HOST_KEY_CHECKING"] = "False"
  sh.env["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

  logger.info(`Running playbook ${playbookPath} on hosts ${hosts.join(",")}`)
  await throwIfError(
    sh.exec(
      `ansible-playbook ${playbookPath} --inventory "${hosts.join(
        ",",
      )}," --extra-vars '${JSON.stringify(vars, null)}';`,
      { async: true, silent: true },
    ),
  )
}

export { runPlaybook }
