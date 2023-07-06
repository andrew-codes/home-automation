import * as React from "react"

const CalendarInviteBody: React.FC<{
  pin?: string
  guestWifiSsid?: string
  guestWifiPassPhrase?: string
  securitySystemPin?: string
}> = ({ pin, securitySystemPin, guestWifiSsid, guestWifiPassPhrase }) => {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <h1>Welcome</h1>
        <h2>Access to our Home</h2>
        <dl>
          <dt>Door Code</dt>
          <dd>{pin}</dd>
          {securitySystemPin && (
            <>
              <dt>Security Alarm Code</dt>
              <dd>{securitySystemPin}</dd>
            </>
          )}
        </dl>
        {!!guestWifiSsid && (
          <>
            <h2>Join our Wifi</h2>
            <p></p>
            <dl>
              <dt>Network Name/SSID</dt>
              <dd>{guestWifiSsid}</dd>
              <dt>Pass Phrase</dt>
              <dd>{guestWifiPassPhrase}</dd>
            </dl>
          </>
        )}
      </body>
    </html>
  )
}

export default CalendarInviteBody
