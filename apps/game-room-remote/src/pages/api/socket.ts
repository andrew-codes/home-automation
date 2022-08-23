import Server from 'socket.io'
import { connectAsync } from "async-mqtt"

const SocketHandler = async (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running')
    } else {
        console.log('Socket is initializing')
        const io = new Server(res.socket.server);
        res.socket.server.io = io
    }

    res.socket.server.io.on('connection', async function connection(socket) {
        console.log('connected')
        const mqtt = await connectAsync(`tcp://10.1.0.160`, {
            port: parseInt('30610', 10),
        })
        await mqtt.subscribe('playnite/#')
        mqtt.on("message", (topic, payload) => {
            try {
                socket.emit('server/action', topic)
            } catch (error) {
                console.log(error)
            }
        })

        socket.emit('server/action', JSON.stringify({ hello: 'world' }));
    })



    res.end()
}

export default SocketHandler