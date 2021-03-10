const mongoose = require('mongoose'),
	uuid = require('uuid')

const playlistSchema = mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4()
	},
	name: String,
	public: {
		type: Boolean,
		default: false
	},
	songs: [Object]
}, { _id: false, timestamps: true })

playlistSchema.options.toJSON = {
	transform: function (doc, ret) {
		delete ret.__v
		return ret
	}
}

module.exports = app => mongoose.model('Playlist', playlistSchema)