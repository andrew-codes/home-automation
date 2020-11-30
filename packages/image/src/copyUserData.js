const fs = require("fs/promises")
const path = require("path")
const Handlebars = require("handlebars")

async function copyUserData(targetPath, data) {
  const userDataContent = await fs.readFile(
    path.join(__dirname, "user-data.yml"),
    "utf8"
  )
  const userDataTemplate = Handlebars.compile(userDataContent)
  await fs.writeFile(
    path.join(targetPath, "user-data"),
    userDataTemplate(data),
    "utf8"
  )
}

module.exports = copyUserData
