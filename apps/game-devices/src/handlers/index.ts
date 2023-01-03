import activeGame from "./activeGame"
import registerWithHomeAssistant from "./registerWithHomeAssistant"
import { MessageHandler } from "./types"

const handlers: MessageHandler[] = [registerWithHomeAssistant, activeGame]

export default handlers
