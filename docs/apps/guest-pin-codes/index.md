# Guest PIN Codes

Node application that dynamically creates a PIN code for guest house access for events on a dedicated guest Google Calendar. PIN codes are added to the description of calendar events and enabled only for the duration of the event. To grant a guest access, simply create an event on the dedicated guest Google calendar and invite your guests to the event. PIN codes will be added to the description of the event once the event starts and will email all invitees for the addition of the PIN.

## Prerequesite Setup

1. Home Assistant and MQTT are setup and connected.
   - Locks are controllable via Home Assistant.
   - Lock PINs can be set, enabled, disabled, via MQTT; see [guest_pin_codes in home assistant](https://github.com/andrew-codes/home-automation/blob/main/apps/home-assistant/src/packages/guest_pin_codes.yaml#L1-L28) for an example.
1. A dedicated Google calendar; all events on this calendar will be updated with PIN codes.
1. Create Vault secrets
   - `yarn initialize-secrets --scope @ha/guest-pin-codes`
1. Set Vault secrets
   - Comma-delimited list of the lock names found from Home Assistant
   - Google guest calendar ID
   - Enable Google Calendar API
   - Google Calendar API private key; stringified JSON
     - [Enable Google Calendar API](https://developers.google.com/workspace/guides/create-project)
     - [Create service account](https://developers.google.com/workspace/guides/create-credentials#create_a_service_account)
     - [Obtain private key credentials](https://developers.google.com/workspace/guides/create-credentials#obtain_service_account_credentials)
   - Comma-delimited list of PINs to be excluded from assignment; this typically includes family member or other dedicated PINs

## User Flow

> Calendar events are updated on a 5 minute interval and events are scheduled with PIN codes every minute.

1. Create an event on the dedicated Google calendar.
   - Typically events will start in the future.
   - Events staring in the past that are currently active are also supported.
1. Once the event starts, a PIN is dynamically assigned to the event and enabled for the event.
   - PINs are added to the description of the calendar event.
1. Once the event ends, the PIN is removed from the description and disabled.
