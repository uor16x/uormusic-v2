const fs = require('fs'),
	path = require('path')

module.exports = app => folder => {
	const folderPath = path.resolve(path.join(__root, 'service', folder))
	const files = fs.readdirSync(folderPath)
	if (!files) {
		throw new Error('No such folder or its empty')
	}
	return files.reduce((acc, item) => {
		const filePath = path.resolve(path.join(folderPath, item))
		acc[item.replace('.js', '')] = require.main.require(filePath)(app)
		return acc
	}, {})
}