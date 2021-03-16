const router = require('express').Router()

module.exports = app => {

	router.put('/', async (req, res, next) => {
		const { name } = req.body
		if (!name) {
			return res.result('Playlist name is missing')
		}
		let _user = await app.services.user.get({ token: req.session.token })
		if (!_user) {
			return res.result('No such user')
		}
		const _playlist = await app.services.music.createPlaylist(name)
		const playlists = [
			_playlist,
			..._user.playlists
		]
		_user.playlists = playlists.map(list => list._id)

		_user.markModified('playlists')
		await _user.save()
		return res.result(null, { playlists })
	})

	router.delete('/:id', async (req, res) => {
		const { id } = req.params
		if (!id) {
			return res.result('Id is missing')
		}
		let _user = await app.services.user.get({ token: req.session.token })
		if (!_user) {
			return res.result('No such user')
		}
		const found = _user.playlists.find(list => list._id === id)
		if (!found) {
			return res.result('Playlist doesn\'t belong to the user')
		}
		_user.playlists = _user.playlists.filter(list => list._id !== id)
		_user.markModified('playlists')
		await _user.save()

		return res.result(null)
	})

	router.get('/:id', async (req, res) => {
		const { id } = req.params
		if (!id) {
			return res.result('Playlist id required')
		}
		let _user = await app.services.user.get({ token: req.session.token })
		if (!_user) {
			return res.result('No such user')
		}
		const _playlist = _user && _user.playlists.find(list => list._id === id)
		if (!_playlist) {
			return res.result('No such playlist attached to current user')
		}
		const playlistFull = await app.models.Playlist.findOne({ _id: id }).populate({
			path: 'songs',
			model: 'Song'
		}).exec()
		return res.result(null, { songs: playlistFull.songs })
	})

	return router
}