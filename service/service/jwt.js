const jwt = require('jsonwebtoken')

module.exports = app => {
	return {
		sign(data) {
			return jwt.sign(data, app.env.JWT, {
				algorithm: 'HS256',
				expiresIn: 60 * 60 * 24 * 30 // 30 days
			})
		},
		verify(token) {
			let payload
			try {
				payload = jwt.verify(token, app.env.JWT)
			} catch (err) {
				return null
			}
			return payload
		}
	}
}