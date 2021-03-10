const path = require('path'),
	fs = require('fs')

module.exports = app => {
	return {
		increaseBitrate: (src, dest) => {
			return new Promise((resolve, reject) => {
				new app.ffmpeg({ source: src })
					.audioBitrate(320)
					.withAudioCodec('libmp3lame')
					.toFormat('mp3')
					.outputOptions('-id3v2_version', '4')
					.on('error', err => {
						return reject(err)
					})
					.on('end', () => {
						try {
							fs.unlinkSync(path.resolve(src))
							resolve()
						} catch (err) {
							reject(err)
						}
					})
					.saveToFile(dest)
			})
		},
		metadata: src => {
			return new Promise((resolve, reject) => {
				app.ffmpeg.ffprobe(src, function (err, metadata) {
					if (err) {
						return reject(err)
					}
					return resolve(metadata)
				})
			})
		}
	}
}
