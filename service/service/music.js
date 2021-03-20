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
						file: data.fileName
					}
					const { artist, title } = parseArtistTitle(data.originalname)
					_song.artist = artist.trim()
					_song.title = title.trim()
					_song.originalName = data.originalname.replace('.mp3', '')
					return app.models.Song.create({
						..._song,
						_id: uuid.v4()
					})
				})
			return bluebird.all(songs)
		},
		async attachSongsToPlaylist(playlist, songs) {
			const songIds = songs.map(song => song._id)
			playlist.songs = [
				...songIds,
				...playlist.songs,
			]
			playlist.markModified('songs')
			return playlist.save()
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