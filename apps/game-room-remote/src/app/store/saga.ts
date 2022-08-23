import { call, put, take, takeEvery } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { bindActionCreators } from 'redux'
import { SocketConnectAction, SocketConnectPayload } from './types'
import io from 'socket.io-client'

const connectSocket = ({
    socketUrl,
    subscribeData,
    eventHandlers
}: SocketConnectPayload) => eventChannel(
    emitter => {
        const boundEventHandlers = bindActionCreators(eventHandlers, emitter as any)

        fetch(socketUrl)
        const socket = io()
        socket.on('connect', () => {
            console.log('connected')
            boundEventHandlers.onOpen()
            socket.emit('client/action', JSON.stringify(subscribeData))
        })
        socket.on('server/action', (payload) => {
            boundEventHandlers.onMessage(payload)
        })

        return socket.close
    }
)


const socketSaga = function* (action: SocketConnectAction) {
    const socketChannel = yield call(connectSocket, action.payload)
    while (true) {
        const eventAction = yield take(socketChannel)
        console.log(eventAction)
        yield put(eventAction)
    }
}

function* rootSaga() {
    yield takeEvery<SocketConnectAction>("SOCKET/CONNECT", socketSaga)
}

export default rootSaga