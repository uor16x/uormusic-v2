const dotenv = require('dotenv-safe')
require('./prototype')
dotenv.config()
require('./service/server')(process.env)