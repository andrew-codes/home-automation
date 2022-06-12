#!/usr/bin/env node

const sh = require("shelljs")
const burnImage = require("../burnImage")

const [, , mediaPath, imageFile] = process.argv

console.log(`Using path image file: ${imageFile}`)

async function run() {
  try {
    await burnImage(mediaPath, imageFile)
    sh.exec(`hdiutil eject ${mediaPath};`, { silent: true })
  } catch (e) {
    console.log(e)
  }
}

run()
