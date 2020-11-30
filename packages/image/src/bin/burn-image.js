#!/usr/bin/env node

const sh = require("shelljs")
const image = require("../image")

const [, , mediaPath, imageFile] = process.argv

console.log(`Using path image file: ${imageFile}`)

async function run() {
  try {
    await image(mediaPath, imageFile)
    sh.exec(`hdiutil eject ${mediaPath}`)
  } catch (e) {
    console.log(e)
  }
}

run()
