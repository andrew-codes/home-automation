interface MessageHandler {
    shouldHandle(topic: string): boolean
    handle(topic: string, payload: Buffer): Promise<void>
}

export type { MessageHandler }