module.exports = app => {
    return {
        async createBucket(id) {
            return app.storage.createBucket(id)
        }
    }
}