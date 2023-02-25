import build from "@ha/build-ts"

const run = async (): Promise<void> => {
  await build({ external: ["shelljs"] })
}

export default run
