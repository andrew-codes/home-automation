import path from "path"
import sh from "shelljs"
import generate from "./generate"

const run = async (): Promise<void> => {
  await generate()
  sh.exec("remix dev --port 8080")
  // sh.exec("remix build --sourcemap")
  // sh.exec(`remix serve ${path.join(__dirname, "..", "dist")}`)
}

if (require.main === module) {
  run()
}

export default run
