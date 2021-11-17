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

const Form = styled.form``
const Label = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`

function Index() {
  const router = useRouter()

  const [isPrimaryDevice, setIsPrimaryDevice] = React.useState(false)
  const changeIsPrimaryDevice = React.useCallback(
    (evt) => setIsPrimaryDevice(evt.target.checked),
    [setIsPrimaryDevice]
  )

  const submit = React.useCallback(() => {
    fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        isPrimaryDevice,
        mac: router.query.mac,
      }),
    }).then((resp) => {
      if (resp.ok) {
        router.push("/thank-you")
      }
    })
  }, [isPrimaryDevice, router.query.mac, router.push])

  return (
    <Form>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h1>Welcome to Smith-Simms Wifi</h1>
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
