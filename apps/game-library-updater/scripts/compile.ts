import build from "@ha/build-ts"
import path from 'path'

const run = async () => {
    await build({ entryPoints: [path.join(__dirname, '..', 'src', 'index.ts')], outfile: path.join(__dirname, '..', 'dist', 'index.js'), })
}

export default run