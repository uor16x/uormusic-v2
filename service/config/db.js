const mongoose = require('mongoose')


module.exports = app => new Promise((resolve, reject) => {
	mongoose.connect(`${app.env.DB_CONNECTION}`, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
		if (err) {
			return reject(err)
		}
		return resolve(app.importer('model'))
	})
})