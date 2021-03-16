const uuid = require('uuid'),
	bluebird = require('bluebird'),
	path = require('path')

let model
module.exports = app => {
	return {
		async createPlaylist(name) {
			return app.models.Playlist.create({
				_id: uuid.v4(),
				name,
				songs: []
			})
		},
		async deletePlaylist(id) {
			return app.models.Playlist.findOneAndRemove({ _id: id })
		},
		async createSongs(songsData) {
			const songs = songsData
				.map(data => {
					const _song = {
						file: data.filename
					}
					const { artist, title } = parseArtistTitle(data.originalname)
					_song.artist = artist.trim()
					_song.title = title.trim()
					_song.originalName = data.originalname.replace('.mp3', '')
					return _song
				})
			return bluebird.all(
				songs.map(song => {
					const srcPath = path.join(app.storagePath, song.file)
					const destPath = `${srcPath}_320`
					return app.services.audio.increaseBitrate(srcPath, destPath).then(() => {
						song.file = `${song.file}_320`
						return song
					}, err => {
						throw new Error(`Cant increase bitrate for ${song.originalName}`)
					})
				})
			)
				.then(songs => {
					return bluebird.all(
						songs.map(song => {
							const srcPath = path.join(app.storagePath, song.file)
							return app.services.audio.metadata(srcPath).then(metadata => {
								if (metadata && metadata.format && metadata.format.duration) {
									song.duration = metadata.format.duration
								}
								return song
							}, err => {
								throw new Error(`Cant get metadata for ${song.originalName}`)
							})
						})
					)
				})
				.then(songs => {
					return bluebird.all(
						songs.map(song => {
							return app.services.lfm.search({
								artist: song.artist,
								title: song.title,
								originalName: song.originalName
							})
								.then(track => {
									if (track && track.album && track.album.image) {
										song.cover = {
											local: false,
											path: track.album.image[1]['#text']
										}
									}
									return app.models.Song.create({
										...song,
										_id: uuid.v4()
									})
								}, err => {
									app.logger.debug(`${song.originalName} cover not found`)
									return app.models.Song.create({
										...song,
										_id: uuid.v4()
									})
								})
						})
					)
				})
		}
	}
}

function parseArtistTitle(name) {
	const splitted = name.replace('.mp3', '').split('-')
	let artist, title
	if (splitted.length === 1) {
		artist = 'Unknown Artist'
		title = splitted[0]
	} else {
		artist = splitted[0]
		title = splitted.filter((val, i) => i !== 0).join('-')
	}
	return { artist, title }
}