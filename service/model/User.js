const mongoose = require('mongoose'),
	uuid = require('uuid')

const userSchema = mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4()
	},
	username: String,
	password: String,
	options: Object,
	token: String,
	playlists: [Object]
}, { _id: false })

userSchema.options.toJSON = {
	transform: function (doc, ret) {
		delete ret.__v
		delete ret.password
		delete ret.token
		return ret
	}
}

module.exports = app => mongoose.model('User', userSchema)