import api from 'utils/api'

const servicePrefix = 'user'

export const UserService = {
    async get() {
        return api.get(`${servicePrefix}`)
    },

    set(token) {
        localStorage.setItem('token', token)
    },

    async clear() {
        localStorage.removeItem('token')
        return api.delete(`${servicePrefix}`)
    },

    async authorize(username, password) {
        return api.post(`${servicePrefix}`, { username, password })
    },

    async update(id, body) {
        return api.post(`${servicePrefix}/edit`, body)
    },
}