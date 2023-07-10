import { useEffect } from "react"

function ThankYouRoute() {
  useEffect(() => {
    document.location.reload()
  }, [])

  return (
    <>
      <h1>Thank you!</h1>
    </>
  )
}

export default ThankYouRoute
