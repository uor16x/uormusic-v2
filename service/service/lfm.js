module.exports = app => {
	return {
		search(data) {
			return new Promise((resolve, reject) => {
				app.lastFM.track.getInfo({
					artist: data.artist,
					track: data.title
				}, (err, track) => {
					if (err) {
						app.lastFM.track.search({
							track: data.originalName
						}, (err, tracks) => {
							if (err) {
								reject(err)
							}
							const foundTrack = tracks
								&& tracks.trackmatches
								&& tracks.trackmatches.track
								&& tracks.trackmatches.track.length
								&& tracks.trackmatches.track[0]
							if (!foundTrack) {
								reject('Cant find track')
							}
							app.lastFM.track.getInfo({
								artist: foundTrack.artist,
								track: foundTrack.name
							}, (err, track) => {
								if (err) {
									return reject(err)
								}
								resolve(track)
							})
						})
					} else {
						resolve(track)
					}
				})
			})
		}
	}
}

