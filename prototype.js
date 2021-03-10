const appRoot = require('app-root-path')

Object.defineProperty(global, '__root', {
    get: function () {
        return appRoot.toString()
    }
})
