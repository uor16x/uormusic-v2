const _ = require('lodash'),
	chalk = require('chalk'),
	moment = require('moment'),
	path = require('path')

const defaultHandler = arg => console.log(`DEFAULT LOG: ${JSON.stringify(arg)}`)
module.exports = { info: defaultHandler, debug: defaultHandler, error: defaultHandler }

function handleLog(args, level) {
	if (_.isArray(args) || (args.length && typeof args !== 'string')) {
		let result = ``
		for (let i = 0; i < args.length; i++) {
			let item = args[i]
			if (_.isFunction(item)) {
				continue
			}
			if (_.isObject(item)) {
				if (item.message) {
					item = item.message
				} else {
					item = JSON.stringify(item)
				}

			}
			result += item
			if (i !== args.length - 1) {
				result += ', '
			}
		}
		return handleLog(result, level)
	}
	if (_.isObject(args)) {
		if (level === 'error' && args.message && args.stack) {
			return handleLog([ args.message, args.stack ], 'error')
		}
		args = JSON.stringify(args)
	}
	const date = chalk.inverse(moment().format('[ ]DD.MM HH:mm:ss[ ]'))
	let levelTag, arg
	switch (level) {
		case 'info':
			levelTag = chalk.bgGreen(' INFO  ')
			arg = chalk.green(args)
			break
		case 'debug':
			levelTag = chalk.bgYellow(' DEBUG ')
			arg = chalk.yellow(args)
			break
		case 'error':
			levelTag = chalk.bgRed(' ERROR ')
			arg = chalk.red(args)
			break
	}
	console.log(`${date} ${levelTag} ${arg}`)
}

module.exports = Object.keys(module.exports).reduce((acc, item) => {
	acc[item] = function logReceiver() {
		return handleLog(arguments || 'Empty log', item)
	}
	return acc
}, module.exports)

