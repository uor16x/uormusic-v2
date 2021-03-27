const router = require('express').Router(),
	bluebird = require('bluebird'),
	uuid = require('uuid')

module.exports = app => {

	router.put('/', async (req, res, next) => {
		const { name } = req.body
		if (!name) {
			return res.result('Playlist name is missing')
		}
		let _user
		try {
			_user = await app.services.user.get({ token: req.session.token })
		} catch (err) {
			return res.result(`Error getting user: ${err.message}`)
		}
		if (!_user) {
			return res.result('No such user')
		}
		let _playlist
		try {
			_playlist = await app.services.music.createPlaylist(name)
		} catch (err) {
			return res.result(`Error getting playlist: ${err.message}`)
		}
		const playlists = [
			_playlist,
			..._user.playlists
		]
		_user.playlists = playlists.map(list => list._id)

		_user.markModified('playlists')
		try {
			await _user.save()
		} catch (err) {
			return res.result(`Save error: ${err.message}`)
		}

		return res.result(null, { playlists })
	})

	router.post('/:playlistId', async (req, res) => {
		let playlist
		try {
			playlist = await app.models.Playlist.findOne({ _id: req.params.playlistId })
		} catch (err) {
			return res.result(`Error getting playlist: ${err.message}`)
		}
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
		try {
			await playlist.save()
		} catch (err) {
			return res.result(`Save error: ${err.message}`)
		}
		return res.result(null)
	})

	router.post(
		'/upload/:playlistId',
		app.upload.any(),
		async (req, res) => {
			const playlist = await app.models.Playlist.findOne({ _id: req.params.playlistId })
			if (!playlist) {
				return res.result('No such playlist')
			}
			const userId = req.session.userId
			const names = req.query.names && JSON.parse(req.query.names)
			const fileUploadIds = app.queue.add(userId, names)
			const songs = req.files.map(file => {
				const id = fileUploadIds[file.originalname]
				return app.services.audio.increaseBitrateAndUpload(file)
					.then(fileName => {
						app.queue.setStatus(userId, id, 'URL-generation')
						const fileRef = app.storage
							.bucket('uormusicv2-songs')
							.file(fileName)
						return bluebird.props({
							url: fileRef.getSignedUrl({ action: 'read', expires: '01-01-2030'}),
							data: {
								fileName,
								originalname: file.originalname
							}
						})
					})
					.then(fileData => {
						app.queue.setStatus(userId, id, 'Storing')
						return {
							...fileData.data,
							uploadId: id,
							url: fileData.url[0]
						}
					})
			})
			res.result(null)
			bluebird.all(songs)
				.then(app.services.music.createSongs)
				.then(createdSongs => {
					app.queue.setStatus(userId, createdSongs.map(song => song.uploadId), 'Attaching')
					return app.services.music.attachSongsToPlaylist(playlist, createdSongs)
						.then(() => createdSongs)
				})
				.then(createdSongs => {
					app.queue.setStatus(userId, createdSongs.map(song => song.uploadId), 'Done')
					app.emit(userId, 'songs:update', {})
					setTimeout(() => {
						app.queue.delete(userId, createdSongs.map(song => song.uploadId))
					}, 3000)
					app.logger.debug('Upload done')
				})
				.catch(err => {
					app.logger.error(err)
					// TODO: set error for specific queue item
				})
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

		try {
			const _playlist = await app.models.Playlist.findOne({ _id: id })
			await app.services.music.deleteSongs(_playlist.songs)
		} catch (err) {
			return res.result(`Error deleting song files: ${err.message}`)
		}

		_user.playlists = _user.playlists.filter(list => list._id !== id)
		_user.markModified('playlists')
		try {
			await _user.save()
		} catch (err) {
			return res.result(`Save error: ${err.message}`)
		}



		return res.result(null)
	})

	router.get('/:id', async (req, res) => {
		const { id } = req.params
		if (!id) {
			return res.result('Playlist id required')
		}
		let _user
		try {
			_user = await app.services.user.get({ token: req.session.token })
		} catch(err) {
			return res.result(`Error getting user: ${err.message}`)
		}
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