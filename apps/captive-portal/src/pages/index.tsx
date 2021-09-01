import * as React from "react"
import { useRouter } from "next/router"
import styled from "styled-components"
import { CropFree } from "@material-ui/icons"
import InputAdornment from "@material-ui/core/InputAdornment"
import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
} from "@material-ui/core"
import QrScanner, { Scanner } from "../QrScanner"

const Form = styled.form``
const Label = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
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

  let scanner: Scanner
  const [isScanning, setIsScanning] = React.useState(false)
  const setScanner = React.useCallback((s) => (scanner = s), [scanner])
  const startScan = React.useCallback(() => {
    setIsScanning(true)
    scanner.start()
  }, [scanner, setIsScanning])
  const stopScan = React.useCallback(() => {
    setIsScanning(false)
    scanner.stop()
  }, [scanner, setIsScanning])
  const scanPassPhrase = React.useCallback(
    (code) => {
      setPassPhrase(code)
      stopScan()
    },
    [stopScan, setPassPhrase]
  )

  return (
    <Form>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h1>Welcome to Smith-Simms Wifi</h1>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <IconButton aria-label="Scan QR Code" onClick={startScan}>
                      <CropFree />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              label="Pass Phrase"
              onChange={changePassPhrase}
              value={passPhrase}
            />
            {!isScanning ? (
              <Button onClick={startScan}>Scan QR Code</Button>
            ) : (
              <Button onClick={stopScan}>Stop Scanning</Button>
            )}
          </Grid>
          <Grid item xs={12}>
            <QrScanner
              hidden={!isScanning}
              onError={console.warn}
              onReady={setScanner}
              onScan={scanPassPhrase}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPrimaryDevice}
                  onChange={changeIsPrimaryDevice}
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
              }
              label="Is this device a phone?"
            />
          </Grid>
          <Grid item xs={12}>
            <Button color="primary" onClick={submit} variant="outlined">
              Connect
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Form>
  )
}

export default Index
