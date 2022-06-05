import { seal } from "tweetsodium"

const encrypt = (key: string, value: string): string => {
  const messageBytes = Buffer.from("change me")
  const keyBytes = Buffer.from(key, "base64")
  const encryptedBytes = seal(messageBytes, keyBytes)
  return Buffer.from(encryptedBytes).toString("base64")
}

export default encrypt
