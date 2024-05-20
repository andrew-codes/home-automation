import libsodium from "libsodium-wrappers"

const encrypt = async (key: string, value: string): Promise<string> => {
  await libsodium.ready
  const messageBytes = Buffer.from(value)
  const keyBytes = Buffer.from(key, "base64")
  const encryptedBytes = libsodium.crypto_box_seal(messageBytes, keyBytes)
  return Buffer.from(encryptedBytes).toString("base64")
}

export default encrypt
