import * as React from "react"
import { useRouter } from "next/router"
import styled from "styled-components"

const Form = styled.form`
  width: 100%;
`
const Label = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`
const TextField = styled.input`
  flex: 1;
`

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
    }).then((resp) => {
      if (resp.ok) {
        router.push("/thank-you")
      }
    })
  }, [isPrimaryDevice, router.query.mac, passPhrase, router.push])

  return (
    <Form>
      <h1>Welcome to Smith-Simms Wifi</h1>
      <Label>
        Pass Phrase
        <TextField type="text" value={passPhrase} onChange={changePassPhrase} />
      </Label>
      <Label>
        Is this a phone?
        <input
          type="checkbox"
          checked={isPrimaryDevice}
          onChange={changeIsPrimaryDevice}
        />
      </Label>
      <button type="button" onClick={submit}>
        Connect
      </button>
    </Form>
  )
}

export default Index
