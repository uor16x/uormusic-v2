import api from 'utils/api'

const playlistServicePrefix = 'playlist'

export const MusicService = {
    async addPlaylist(name) {
        return api.put(`${playlistServicePrefix}`, { name })
    },
    async deletePlaylist(id) {
        return api.delete(`${playlistServicePrefix}/${id}`)
    }
}