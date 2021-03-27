module.exports = app => client => {
    const store = {}
    client.on('connection', (socket) => {
        const userId = socket
            && socket.handshake
            && socket.handshake.auth
            && socket.handshake.auth.userId
        if (!userId) return
        if (store[userId]) {
            store[userId].disconnect()
        }
        app.logger.debug(`Socket connected: $${userId} [${socket.id}]`)
        store[userId] = socket
        app.queue.update(userId)
        socket.on('disconnect', () => {
            store[userId] = undefined;
            app.logger.debug(`Socket disconnected: $${userId} [${socket.id}]`)
        })

    })
    return function (id, event, data) {
        const socket = store[id]
        if (!socket) {
            throw new Error('No such socket')
        }
        app.logger.info(`Emitted <${event}> => $${id}`)
        socket.emit(event, data)
    }

}