import sh from "shelljs"

const run = async (): Promise<void> => {
  sh.exec("yarn remix dev --port 8089")
}

if (require.main === module) {
  run()
}

export default run
