const router = require('express').Router(),
	bluebird = require('bluebird')

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

	router.post('/:playlistId', async (req, res) => {
		const playlist = await app.models.Playlist.findOne({ _id: req.params.playlistId })
		if (!playlist) {
			return res.result('No such playlist')
		}
		const { name, songs } = req.body
		if (name) {
			playlist.name = name
		}
		if (songs) {
			playlist.songs = songs
			playlist.markModified('songs')
		}
		await playlist.save()
		return res.result(null)
	})

	router.post('/upload/:playlistId', app.upload.any(), async (req, res) => {
		const playlist = await app.models.Playlist.findOne({ _id: req.params.playlistId })
		if (!playlist) {
			return res.result('No such playlist')
		}
		const songs = req.files.map(file => {
			return app.services.audio.increaseBitrateAndUpload(file)
				.then(fileName => ({
					fileName,
					originalname: file.originalname
				}))
		})
		bluebird.all(songs)
			.then(app.services.music.createSongs)
			.then(createdSongs => app.services.music.attachSongsToPlaylist(playlist, createdSongs))
			.then(() => res.result(null))
			.catch(err => res.result(err.message))
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