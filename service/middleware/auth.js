const allowed = {
	user: [ 'POST', 'DELETE' ],
	youtube: [ 'GET', 'POST', 'DELETE' ],
	song: [ 'GET' ]
}

function checkPermissions(originalUrl, method) {
	const url = originalUrl.split('/').filter(s => s)[0]
	return allowed[url] && allowed[url].includes(method)
}

function checkExp(token) {
	return Date.now() < (token.exp * 1000)
}

module.exports = app => async (req, res, next) => {
	if (checkPermissions(req.originalUrl, req.method)) {
		return next()
	}
	let token
	if (req.session.token) {
		token = app.services.jwt.verify(req.session.token)
		if (token) {
			if (!checkExp(token)) {
				return res.status(401).end()
			}
			return next()
		}
	} else if (req.headers.token) {
		token = app.services.jwt.verify(req.headers.token)
		if (token) {
			if (!checkExp(token)) {
				return res.status(401).end()
			}
			const _user = await app.services.user.get({ _id: token._id })
			if (_user) {
				req.session.token = req.headers.token
				return next()
			}
		}
	}
	return res.status(401).end()
}
