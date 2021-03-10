const mongoose = require('mongoose'),
	uuid = require('uuid')

const songSchema = mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4()
	},
	title: String,
	artist: String,
	originalName: String,
	file: String,
	duration: Number,

	cover: {
		local: {
			type: Boolean,
			default: false
		},
		path: String
	}
}, { _id: false, timestamps: true })

songSchema.options.toJSON = {
	transform: function (doc, ret) {
		delete ret.__v
		return ret
	}
}

module.exports = app => mongoose.model('Song', songSchema)