import * as React from "react"
import { useRouter } from "next/router"

function Index() {
  const router = useRouter()

  const [passPhrase, setPassPhrase] = React.useState("")
  const changePassPhrase = React.useCallback(
    (evt) => setPassPhrase(evt.target.value),
    [setPassPhrase]
  )

  const [isPrimaryDevice, setIsPrimaryDevice] = React.useState(false)
  const changeIsPrimaryDevice = React.useCallback(
    (evt) => setIsPrimaryDevice(evt.target.checked),
    [setPassPhrase]
  )

  const submit = React.useCallback(() => {
    fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        isPrimaryDevice,
        mac: router.query.mac,
        passPhrase,
      }),
    }).then(() => router.push("/thank-you"))
  }, [isPrimaryDevice, router.query.mac, passPhrase, router.push])

  return (
    <form>
      <label>
        Pass Phrase:
        <input type="text" value={passPhrase} onChange={changePassPhrase} />
      </label>
      <label>
        Is this a phone?:
        <input
          type="checkbox"
          checked={isPrimaryDevice}
          onChange={changeIsPrimaryDevice}
        />
      </label>
      <button type="button" onClick={submit}>
        Connect
      </button>
    </form>
  )
}

export default Index
