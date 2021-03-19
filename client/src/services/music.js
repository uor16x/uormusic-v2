import api from 'utils/api'

const playlistServicePrefix = 'playlist'

export const MusicService = {
    async addPlaylist(name) {
        return api.put(`${playlistServicePrefix}`, { name })
    },
    async deletePlaylist(id) {
        return api.delete(`${playlistServicePrefix}/${id}`)
    },
    async uploadFiles(playlistId, files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('songs', files[i])
        }
        return api({
            url: `${playlistServicePrefix}/upload/${playlistId}`,
            method: 'POST',
            data: formData,
        })
    },
    getSongs(playlistId) {
        return api.get(`${playlistServicePrefix}/${playlistId}`)
    }
}