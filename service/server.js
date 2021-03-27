const express = require('express'),
	logger = require('./config/logger'),
	db = require('./config/db'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	path = require('path'),
	multer = require('multer'),
	uuid = require('uuid'),
	lastfmapi = require('lastfmapi'),
	{ Storage } = require('@google-cloud/storage'),
	multerStorage = require('multer-google-storage'),
	http = require('http')

process.on('uncaughtException', err => errHandler(err))

module.exports = env => {
	const app = express()

	app.importer = require('./config/importer')(app)
	app.env = env
	app.logger = logger
	app.storage = new Storage({  projectId: app.env.GOOGLE_CLOUD_PROJECT, keyFilename: "gcp-creds.json" })

	db(app)
		.then(models => {
			app.models = models
			app.services = app.importer('service')
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

			app.upload = multer({
				storage: multer.memoryStorage()
			})

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
			const clientBundlePath = path.join(__root, './client/build')
			app.use(express.static(clientBundlePath))
			app.get('/', (req, res) => {
				return res.sendFile('index.html', { root: clientBundlePath })
			})
			app.middlewares = app.importer('middleware')
			app.use(bodyParser.json({ limit: '100mb', extended: false }))
			app.use(app.middlewares.auth)
			app.use(app.middlewares.result)
			app.controllers = app.importer('controller')
			Object.keys(app.controllers).forEach(controller => {
				app.use(`/${controller}`, app.controllers[controller])
			})
		})
		.then(() => {
			const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
			const ffprobePath = require('@ffprobe-installer/ffprobe').path
			app.ffmpeg = require('fluent-ffmpeg')
			app.ffmpeg.setFfprobePath(ffprobePath)
			process.env['FFMPEG_PATH'] = ffmpegPath
			process.env['FFPROBE_PATH'] = ffprobePath
			const server = http.createServer(app)
			app.queue = require('./config/queue')(app)
			app.emit = require('./config/socket')(app)(require('socket.io')(server, {
				cors: true,
				origins: ['http://localhost*'],
			}))
			server.listen(app.env.PORT, err => {
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
