import socketIOClient from 'socket.io-client'

export const SocketService = {
    socket: null,

    connect(userId) {
        this.socket = socketIOClient(process.env.REACT_APP_BASE_URL, { auth: { userId } })
    },

    addHandler(event, cb) {
        this.socket && this.socket.on(event, cb)
    }
}