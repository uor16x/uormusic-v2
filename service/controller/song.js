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
		await song.save()
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
	return router
}