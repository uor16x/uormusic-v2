const path = require('path'),
	fs = require('fs'),
	uuid = require('uuid'),
	{ Readable } = require('stream')

module.exports = app => {
	return {
		increaseBitrateAndUpload: (file) => {
			return new Promise((resolve, reject) => {
				const fileStream = new Readable()
				fileStream._read = () => {}
				fileStream.push(file.buffer)
				fileStream.push(null)

				const filename = `${uuid.v4()}.mp3`

				const gcsStream = app.storage
					.bucket('uormusicv2-songs')
					.file(filename)
					.createWriteStream()

				gcsStream
					.on('error', reject)
					.on('finish', () => resolve(filename))

				new app.ffmpeg(fileStream)
					.audioBitrate(320)
					.withAudioCodec('libmp3lame')
					.toFormat('mp3')
					.outputOptions('-id3v2_version', '4')
					.on('error', reject)
					.pipe(gcsStream, { end: true })
			})
		}
	}
}
