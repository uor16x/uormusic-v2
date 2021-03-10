const router = require('express').Router(),
	path = require('path')

module.exports = app => {
	router.put('/:id', app.upload.array("songs[]", 1000), async (req, res) => {
		if (!req.files || req.files.length === 0) {
			return res.result('No files')
		}
		const playlistId = req.params.id
		if (!playlistId) {
			return res.result('Playlist id required')
		}
		const _user = await app.services.user.get({ token: req.session.token })
		const _playlist = _user && _user.playlists.find(list => list._id === playlistId)
		if (!_playlist) {
			return res.result('No such playlist attached to current user')
		}
		let songs
		try {
			songs = await app.services.music.createSongs(req.files)
		} catch (err) {
			return res.result(err)
		}

		const listSongs = [
			...songs.filter(s => s).map(song => song._id),
			..._playlist.songs.filter(s => s)
		]
		_playlist.songs = [ ...listSongs ]

		_playlist.markModified('playlists')
		await _playlist.save()
		return res.result()
	})

	router.get('/get/file/:name', async (req, res) => {
		if (!req.params.name) {
			return res.result('File location missing')
		}
		return res.sendFile(path.resolve(path.join(app.storagePath, req.params.name)))
	})

	router.get('/get/:id', async (req, res) => {
		if (!req.params.id) {
			return res.result('Id missing')
		}
		let song
		try {
			song = await app.models.Song.findOne({ _id: req.params.id })
		} catch (err) {
			app.logger.error(err)
			return res.result('Song missing')
		}
		return res.sendFile(path.join(app.storagePath, song.file))
	})
	return router
}