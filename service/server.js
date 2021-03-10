const express = require('express'),
	logger = require('./config/logger'),
	db = require('./config/db'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	path = require('path'),
	multer = require('multer'),
	uuid = require('uuid'),
	lastfmapi = require('lastfmapi')

process.on('uncaughtException', err => errHandler(err))

module.exports = env => {
	const app = express()

	app.importer = require('./config/importer')(app)
	app.env = env
	app.logger = logger

	db(app)
		.then(models => {
			app.models = models
			app.set('trust proxy', 1)
			app.use(session({
				secret: app.env.COOKIES_SECRET,
				resave: true,
				saveUninitialized: true,
				cookie: { secure: false }
			}))

			app.lastFM = new lastfmapi({
				'api_key': app.env.LFM_API_KEY,
				'secret': app.env.LFM_SECRET
			})
			app.ytQueue = {}

			app.storagePath = path.resolve(path.join(__root, './storage/'))
			const storage = multer.diskStorage({
				destination: (req, file, cb) => {
					cb(null, app.storagePath)
				},
				filename: (req, file, cb) => {
					cb(null,
						`${uuid.v4()}_${file.originalname}`)
				}
			})
			app.upload = multer({ storage: storage })

			app.use((req, res, next) => {
				res.header('Access-Control-Allow-Origin', app.env.HOSTNAME)
				res.header('Access-Control-Allow-Credentials', true)
				res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
				return next()
			})
			app.use(
				cors({
					origin: [ 'http://localhost*' ]
				})
			)
		})
		.then(() => {
			app.middlewares = app.importer('middleware')
			app.use(bodyParser.json({ limit: '100mb', extended: false }))
			app.use(app.middlewares.auth)
			app.use(app.middlewares.result)
			app.controllers = app.importer('controller')
			Object.keys(app.controllers).forEach(controller => {
				app.use(`/${controller}`, app.controllers[controller])
			})
			app.services = app.importer('service')
		})
		.then(() => {
			const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
			const ffprobePath = require('@ffprobe-installer/ffprobe').path
			app.ffmpeg = require('fluent-ffmpeg')
			app.ffmpeg.setFfprobePath(ffprobePath)
			process.env['FFMPEG_PATH'] = ffmpegPath
			process.env['FFPROBE_PATH'] = ffprobePath
			app.listen(app.env.PORT, err => {
				if (err) {
					return errHandler(err)
				}
				logger.info(`Server started at port ${app.env.PORT}`)
			})
		})
		.catch(err => errHandler(err))
}

function errHandler(err) {
	logger.error(err)
	process.exit(1)
}
