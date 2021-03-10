const bcrypt = require('bcrypt')

let model
module.exports = app => {
	model = app.models.User
	return {
		async get(query) {
			return app.models.User.findOne(query)
				.populate({
					path: 'playlists',
					model: 'Playlist'
				})
		},
		async create(username, password) {
			const newUser = new model({
				username,
				password: await bcrypt.hash(password, 10)
			})
			return newUser.save()
		},
		async verifyPassword(password, hash) {
			return bcrypt.compare(password, hash)
		}
	}
}