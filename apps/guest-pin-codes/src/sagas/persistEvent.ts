import {
  EventNewAction,
  EventTimeChangeAction,
  EventTitleChangeAction,
} from "../actions"

function* persistEvent(
  action: EventNewAction | EventTitleChangeAction | EventTimeChangeAction,
) {
  throw new Error("Not implemented")
}

export default persistEvent
