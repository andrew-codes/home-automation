import * as secretUtils from ".."

describe("secret utils module", () => {
  test("toEnvName will convert a secret's name to its corresponding ENV_VARIABLE name.", () => {
    const actual = secretUtils.toEnvName("mqtt/user-name/first-name")
    expect(actual).toEqual("MQTT_USER_NAME_FIRST_NAME")
  })

  test("toK8sName will convert a secret's name to its corresponding ENV_VARIABLE name.", () => {
    const actual = secretUtils.toK8sName("mqtt/user-name/first-name")
    expect(actual).toEqual("mqtt-user-name-first-name")
  })
})
