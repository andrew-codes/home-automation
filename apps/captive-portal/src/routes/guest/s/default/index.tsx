import { ActionFunction, json, LoaderArgs, redirect } from "@remix-run/node"
import {
  useActionData,
  useTransition,
  Form,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react"
import createUnifi from "./../../../../unifi-client.server"

const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const mac = formData.get("mac")?.toString() ?? ""
  const macExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  if (!macExp.test(mac)) {
    const values = Object.fromEntries(formData)

    return json({
      errors: { mac: "Invalid MAC address provided." },
      values,
    })
  }

  const controller = await createUnifi()
  await controller.authorizeGuest(mac, 4320)

  const isPrimaryDevice = formData.get("primaryDevice")?.toString() === "on"
  if (isPrimaryDevice) {
    const { createMqtt } = await import("@ha/mqtt-client")
    const mqtt = await createMqtt()
    await mqtt.publish("homeassistant/group/guests/add", mac)
  }

  return json({ success: true })
}

const loader = async (args: LoaderArgs) => {
  const userAgent = args.request.headers.get("user-agent")
  const mobileExpressions = [/iPhone/i, /BlackBerry/i, /Windows Phone/i]

  const isMobile =
    userAgent &&
    mobileExpressions.some((toMatchItem) => userAgent.match(toMatchItem))

  return json({ knownMobile: isMobile })
}

function RegisterMacRoute() {
  const transition = useTransition()
  const { knownMobile } = useLoaderData()
  const actionData = useActionData()
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const mac = searchParams.get("id")

  if (!mac) {
    throw new Error("No MAC address provided.")
  }

  if (actionData?.success) {
    navigate("/thankyou")
  }

  return (
    <Form method="post">
      <input name="mac" type="hidden" value={mac} />
      {knownMobile && <input name="primaryDevice" type="hidden" value="on" />}
      <fieldset disabled={transition.state === "submitting"}>
        {!knownMobile && (
          <p>
            <label>
              Please mark if this device is your phone:{" "}
              <input
                name="primaryDevice"
                type="checkbox"
                defaultChecked={actionData?.values?.primaryDevice === "on"}
              />
            </label>
          </p>
        )}
        <p>
          <button type="submit">
            {transition.state === "submitting" ? "Joining..." : "Join Wi-Fi"}
          </button>
        </p>
      </fieldset>
    </Form>
  )
}

const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log(error.message)
  return <h1>Sorry, there was an error.</h1>
}

export default RegisterMacRoute
export { action, loader, ErrorBoundary }
