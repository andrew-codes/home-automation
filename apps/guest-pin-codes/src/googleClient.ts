import { google } from "googleapis"

const { GOOGLE_PRIVATE_KEY } = process.env
const createCalendarClient = () => {
  const creds = JSON.parse(GOOGLE_PRIVATE_KEY as string)
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
    subject: "andrew@andrew.codes",
  })
  return google.calendar({
    version: "v3",
    auth,
  })
}

export { createCalendarClient }
