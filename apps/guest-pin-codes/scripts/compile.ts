import build from "@ha/build-ts"
import path from "path"

const run = async (): Promise<void> => {
  await build({
    entryPoints: [path.join(__dirname, "src", "CalendarInviteBody.tsx")],
    outfile: path.join(__dirname, "dist", "CalendarInviteBody.js"),
    loader: { ".png": "dataurl" },
  })

  await build()
}

export default run
