import { useEffect } from "react"

function ThankYouRoute() {
  useEffect(() => {
    document.location.reload()
  }, [])

  return (
    <>
      <h1>Thank you!</h1>
      <blockquote>
        Please do not cancel the captive portal. It should change from "Cancel"
        to "Done". Please be patient, this may take a few moments.
      </blockquote>
    </>
  )
}

export default ThankYouRoute
