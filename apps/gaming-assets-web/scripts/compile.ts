import build from "@ha/build-ts"

const run = async (): Promise<void> => {
  await build({ external: ["sharp"] })
}

export default run
