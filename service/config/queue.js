const uuid = require('uuid')

module.exports = (app) => {
    let queue = {}

    return {
        update(userId) {
            app.emit(userId, 'queue:update', queue[userId] || [])
        },
        setStatus(userId, id, status) {
            if (typeof id === 'string') {
                const item = queue[userId].find(item => item.id === id)
                if (item) {
                    item.status = status
                }
            }
            if (Array.isArray(id)) {
                queue[userId].forEach(item => {
                    if (id.indexOf(item.id) > -1) {
                        item.status = status
                    }
                })
            }

            this.update(userId)
        },

        add(userId, names) {
            const result = {}
            const songs = names.map(fileName => {
                result[fileName] = uuid.v4()
                return {
                    id: result[fileName],
                    name: fileName,
                    status: 'Encoding'
                }
            })
            queue[userId] = [
                ...songs,
                ...(queue[userId] || [])
            ]
            this.update(userId)
            return result
        },

        delete(userId, id) {
            if (typeof id === 'string') {
                queue[userId] = queue[userId].filter(item => item.id !== id)
            }
            if (Array.isArray(id)) {
                queue[userId] = queue[userId].filter(item => id.indexOf(item.id) <= -1)
            }
            this.update(userId)
        }
    }
}