const router = require('express').Router(),
	path = require('path')

module.exports = app => {
	router.post('/:id', async (req, res) => {
		const song = await app.models.Song.findOne({ _id: req.params.id })
		if (!song) {
			return res.result('No such song')
		}
		const { artist, title } = req.body
		if (!artist) {
			return res.result('Artist is missing')
		}
		if (!title) {
			return res.result('Title is missing')
		}
		song.artist = artist
		song.title = title
		try {
			await song.save()
		} catch (err) {
			return res.result(`Save error: ${err.message}`)
		}
		return res.result(null)
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

	router.delete('/:playlistId/:songId', async (req, res) => {
		const { playlistId, songId } = req.params
		if (!playlistId || !songId) {
			return res.result('Id is missing')
		}

		const user = await app.models.User.findOne({ _id: req.session.userId })
		const playlistFound = !!user.playlists.find(list => list === playlistId)
		if (!playlistFound) {
			return res.result('Playlist doesn\'t belong to this user')
		}

		let _playlist
		try {
			_playlist = await app.models.Playlist.findOne({ _id: playlistId })
		} catch (err) {
			return res.result(`Error getting playlist: ${err.message}`)
		}
		if (!_playlist) {
			return res.result('No such playlist')
		}

		let _song
		try {
			_song = await app.models.Song.findOne({ _id: songId })
		} catch (err) {
			return res.result(`Error getting song: ${err.message}`)
		}
		if (!_song) {
			return res.result('No such song')
		}

		const songFound = !!_playlist.songs.find(song => song === songId)
		if (!songFound) {
			return res.result('Song doesn\'t belong to this playlist')
		}
		_playlist.songs = _playlist.songs.filter(song => song !== songId)
		_playlist.markModified('playlists')
		try {
			await _playlist.save()
		} catch (err) {
			return res.result(`Save error: ${err.message}`)
		}

		try {
			await app.models.Song.findOneAndRemove({ _id: songId })
		} catch (err) {
			return res.result(`Delete error: ${err.message}`)
		}

		return res.result(null)
	})
	return router
}