
import { HYDRATE } from 'next-redux-wrapper';

type SocketConnectPayload = {
    socketUrl: string,
    subscribeData?: any
    eventHandlers: {
        onOpen: any
        onClose: any
        onError: any
        onMessage: any
    }
}

type SocketErrorAction = {
    type: 'SOCKET/ERROR',
    payload: string | Error | any
}

type SocketMessageAction = {
    type: 'SOCKET/MESSAGE',
    payload: string | any
}

type SocketConnectAction = {
    type: "SOCKET/CONNECT"
    payload: SocketConnectPayload
}

type HydrateAction = {
    type: typeof HYDRATE
}

type AllActions = SocketConnectAction | SocketErrorAction | SocketMessageAction | HydrateAction

interface State { }

export type {
    AllActions, SocketConnectAction, SocketConnectPayload, SocketErrorAction, SocketMessageAction, State
}