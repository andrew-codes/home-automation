import sh from "shelljs"
import compile from "./compile"

const run = async (): Promise<void> => {
  sh.exec(`yarn nx run graph-schema:generate`)
  await compile()
}

if (require.main === module) {
  run()
}
