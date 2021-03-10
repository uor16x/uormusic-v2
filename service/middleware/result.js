module.exports = app => (req, res, next) => {
	res.result = function (err, data) {
		if (err) {
			if (res.statusCode === 200) {
				res.status(400)
			}
			app.logger.error(err)
			data = err
		}
		const opts = [ 'body', 'params', 'query' ]
		let logLine = `${res.statusCode} : [${req.method}] => ${req.originalUrl} `
		opts.forEach(opt => {
			const optStringified = JSON.stringify(req[opt])
			if (optStringified !== '{}') {
				logLine += `# ${opt}: ${optStringified} `
			}
		})
		app.logger.debug(logLine)
		return data ? res.json(data) : res.end()
	}
	return next()
}