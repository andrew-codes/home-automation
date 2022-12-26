import registerWithHomeAssistant from "./registerWithHomeAssistant"
import { MessageHandler } from "./types"

const handlers: MessageHandler[] = [registerWithHomeAssistant]

export default handlers
