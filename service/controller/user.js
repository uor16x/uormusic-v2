const router = require('express').Router()

module.exports = app => {

	router.get('/', async (req, res, next) => {
		const _user = await app.services.user.get({ token: req.session.token })
		_user.password = undefined
		return res.result(null, _user)
	})

	router.post('/', async (req, res, next) => {
		const { username, password } = req.body
		if (!username) {
			return res.result('Username missing')
		}
		if (!password) {
			return res.result('Password missing')
		}
		let currUser
		const _user = await app.services.user.get({ username })
		if (!_user) {
			// Sign up
			const newUser = await app.services.user.create(req.body.username, req.body.password)
			if (!newUser) {
				return res.result('Error create user')
			}
			currUser = newUser
		} else {
			// Sign in
			const passwordMatch = await app.services.user.verifyPassword(password, _user.password)
			if (!passwordMatch) {
				return res.result('Wrong password')
			}
			currUser = _user
		}
		const authToken = app.services.jwt.sign({ _id: currUser._id })
		currUser.token = authToken
		req.session.token = authToken
		req.session.userId = currUser._id
		req.session.save()
		await currUser.save()
		return res.result(null, { token: authToken })
	})

	router.delete('/', async (req, res, next) => {
		req.session.destroy()
		return res.result()
	})

	router.post('/edit', async (req, res) => {
		let user
		try {
			user = await app.models.User.findOne({ _id: req.session.userId })
		} catch (err) {
			return res.result(`Error getting user: ${err.message}`)
		}
		if (!user) {
			return res.result('No such user')
		}
		const { playlists } = req.body
		if (playlists) {
			user.playlists = playlists
			user.markModified('playlists')
		}
		try {
			await user.save()
		} catch (err) {
			return res.result(`Save error: ${err.message}`)
		}
		return res.result(null)
	})

	return router
}