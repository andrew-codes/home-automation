import { ActionFunction, json, redirect } from "@remix-run/node"
import { useActionData, useParams, useTransition, Form } from "@remix-run/react"
import createUnifi from "./../../unifi-client.server"

export const action: ActionFunction = async ({ request }) => {
  const { createLogger } = await import("@ha/logger")
  const logger = createLogger()
  try {
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

    return redirect("/thankyou")
  } catch (error: any) {
    console.log(error)
    logger.error(error)

    return json({
      errors: { "500": "There was an error connecting you to the wi-fi." },
    })
  }
}

export default function RegisterMacRoute() {
  const transition = useTransition()
  const actionData = useActionData()
  const params = useParams()

  return (
    <Form method="post">
      {actionData?.errors.mac ? (
        <p style={{ color: "red" }}>{actionData.errors.mac}</p>
      ) : null}
      {actionData?.errors["500"] ? (
        <p style={{ color: "red" }}>{actionData.errors["500"]}</p>
      ) : null}
      <input name="mac" type="hidden" value={params.mac} />
      <fieldset disabled={transition.state === "submitting"}>
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
        <p>
          <button type="submit">
            {transition.state === "submitting" ? "Submitting..." : "Submit"}
          </button>
        </p>
      </fieldset>
    </Form>
  )
}