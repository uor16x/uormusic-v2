import api from 'utils/api'

const playlistServicePrefix = 'playlist',
    songServicePrefix = 'song'

export const MusicService = {
    async addPlaylist(name) {
        return api.put(`${playlistServicePrefix}`, { name })
    },
    async deletePlaylist(id) {
        return api.delete(`${playlistServicePrefix}/${id}`)
    },
    async deleteSong(playlistId, songId) {
        return api.delete(`${songServicePrefix}/${playlistId}/${songId}`)
    },
    async updatePlaylist(id, body) {
        return api.post(`${playlistServicePrefix}/${id}`, body)
    },
    async updateSong(id, body) {
        return api.post(`${songServicePrefix}/${id}`, body)
    },
    async uploadFiles(playlistId, files) {
        const formData = new FormData();
        const names = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            formData.append('songs',file)
            names.push(file.name)
        }
        const namesQuery = encodeURIComponent(JSON.stringify(names))
        return api({
            url: `${playlistServicePrefix}/upload/${playlistId}?names=${namesQuery}`,
            method: 'POST',
            timeout: 300000,
            data: formData,
        })
    },
    getSongs(playlistId) {
        return api.get(`${playlistServicePrefix}/${playlistId}`)
    }
}